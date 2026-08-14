import { locales } from "@/i18n";
import { headers } from "next/headers";

// Prefixes a path with the current request's locale (from proxy.ts's x-locale header),
// so server-side redirects don't silently drop the user back into English.
export async function localizedPath(path: string): Promise<string> {
  const hdrs = await headers();
  const locale = hdrs.get("x-locale") || "en";

  if (locale === "en" || !(locales as readonly string[]).includes(locale)) {
    return path;
  }

  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}
