import { defaultLocale, locales } from "@/i18n";
import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segments = pathname.split("/");
  const maybeLocale = segments[1];

  const isPrefixed = (locales as readonly string[]).includes(maybeLocale);
  const locale = isPrefixed ? maybeLocale : defaultLocale;
  const canonicalPath = isPrefixed
    ? "/" + segments.slice(2).join("/")
    : pathname;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-locale", locale);
  requestHeaders.set("x-canonical-path", canonicalPath || "/");

  if (isPrefixed) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = canonicalPath || "/";
    return NextResponse.rewrite(rewriteUrl, {
      request: { headers: requestHeaders },
    });
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    "/((?!api|admin|store-owner|_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|logo.png|logo-email.png|robots.txt|sitemap.xml).*)",
  ],
};
