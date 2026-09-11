import { defaultLocale, locales, type Lang } from "@/i18n";
import { isShopEnabled } from "@/lib/marketplace";
import { NextRequest, NextResponse } from "next/server";

const SHOP_GATES: { pattern: RegExp; target: string }[] = [
  { pattern: /^\/shop\/(?!category(?:\/|$))[^/]+\/?$/, target: "/shop" },
  { pattern: /^\/cart(?:\/.*)?$/, target: "/shop" },
  { pattern: /^\/checkout(?:\/.*)?$/, target: "/shop" },
];

// Remembers whether we've already decided a locale for this browser — either
// a real redirect (Accept-Language matched a non-English locale) or an
// explicit "no redirect needed" (English preferred, or a manual switch).
// Without this we'd re-parse Accept-Language on every single request, and a
// visitor who deliberately switches back to English would get bounced to
// their browser's language again on their very next unprefixed page view.
const LOCALE_COOKIE = "gwp-locale";
const COOKIE_OPTIONS = { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" as const };

// Crawlers must always see the canonical (unprefixed) page on a bare visit —
// hreflang tags and the sitemap already tell them about the other locale
// variants independently. Redirecting them by Accept-Language would fight
// that signal instead of complementing it.
const BOT_USER_AGENT = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegrambot|bingpreview|discordbot|embedly|quora|outbrain|pinterest|redditbot|applebot/i;

function isBot(userAgent: string | null): boolean {
  return !!userAgent && BOT_USER_AGENT.test(userAgent);
}

// Accept-Language looks like "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7" — rank by
// q-value and return the first primary subtag we actually support.
function detectPreferredLocale(header: string | null): Lang | null {
  if (!header) return null;

  const ranked = header
    .split(",")
    .map((part) => {
      const [rawTag, qPart] = part.trim().split(";q=");
      const q = qPart ? parseFloat(qPart) : 1;
      const primary = rawTag?.trim().split("-")[0]?.toLowerCase();
      return { primary, q: Number.isNaN(q) ? 1 : q };
    })
    .sort((a, b) => b.q - a.q);

  for (const { primary } of ranked) {
    if ((locales as readonly string[]).includes(primary)) {
      return primary as Lang;
    }
  }
  return null;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segments = pathname.split("/");
  const maybeLocale = segments[1];

  const isPrefixed = (locales as readonly string[]).includes(maybeLocale);
  const locale = isPrefixed ? maybeLocale : defaultLocale;
  const canonicalPath = isPrefixed
    ? "/" + segments.slice(2).join("/")
    : pathname;

  if (!isShopEnabled()) {
    const gate = SHOP_GATES.find((g) => g.pattern.test(canonicalPath));
    if (gate) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = isPrefixed ? `/${locale}${gate.target}` : gate.target;
      redirectUrl.search = "?notice=coming-soon";
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Only the canonical (unprefixed) path needs a locale decision — a request
  // already carrying a locale prefix is a deliberate choice (manual switch,
  // shared link, bookmark) and always wins as-is.
  if (!isPrefixed && !isBot(request.headers.get("user-agent"))) {
    const stored = request.cookies.get(LOCALE_COOKIE)?.value;
    const known = stored && (locales as readonly string[]).includes(stored) ? (stored as Lang) : null;
    const preferred = known ?? detectPreferredLocale(request.headers.get("accept-language"));

    if (preferred && preferred !== defaultLocale) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = `/${preferred}${canonicalPath === "/" ? "" : canonicalPath}`;
      const response = NextResponse.redirect(redirectUrl);
      response.cookies.set(LOCALE_COOKIE, preferred, COOKIE_OPTIONS);
      return response;
    }

    if (!known) {
      // First visit, and English (or nothing) matched — record that decision
      // so we don't re-check Accept-Language on every subsequent request.
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-locale", locale);
      requestHeaders.set("x-canonical-path", canonicalPath || "/");
      const response = NextResponse.next({ request: { headers: requestHeaders } });
      response.cookies.set(LOCALE_COOKIE, defaultLocale, COOKIE_OPTIONS);
      return response;
    }
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-locale", locale);
  requestHeaders.set("x-canonical-path", canonicalPath || "/");

  if (isPrefixed) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = canonicalPath || "/";
    const response = NextResponse.rewrite(rewriteUrl, {
      request: { headers: requestHeaders },
    });
    // Keep the remembered preference in sync with a deliberate prefixed visit
    // (manual switch, shared link, bookmark) even if the client-side switcher
    // didn't get a chance to set it itself.
    response.cookies.set(LOCALE_COOKIE, locale, COOKIE_OPTIONS);
    return response;
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    "/((?!api|admin|store-owner|_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|logo.png|logo-email.png|robots.txt|sitemap.xml).*)",
  ],
};
