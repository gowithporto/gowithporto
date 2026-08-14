"use client";

import { useLanguage } from "@/providers/LanguageProvider";
import NextLink from "next/link";
import { ComponentProps } from "react";

type Props = Omit<ComponentProps<typeof NextLink>, "href"> & { href: string };

const EXTERNAL_HREF = /^([a-z][a-z0-9+.-]*:)?\/\//i;

function localize(href: string, lang: string): string {
  if (
    lang === "en" ||
    EXTERNAL_HREF.test(href) ||
    href.startsWith("#") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  ) {
    return href;
  }

  return href === "/" ? `/${lang}` : `/${lang}${href}`;
}

// Drop-in replacement for next/link's Link that prefixes internal hrefs with the
// current locale (derived the same way LanguageProvider/Header's switcher do), so
// in-app navigation never silently drops the user back into English.
export default function Link({ href, ...props }: Props) {
  const { lang } = useLanguage();
  return <NextLink href={localize(href, lang)} {...props} />;
}
