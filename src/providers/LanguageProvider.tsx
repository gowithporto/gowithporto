"use client";

import { defaultLocale, locales, type Lang } from "@/i18n";
import { usePathname } from "next/navigation";
import { createContext, useContext } from "react";

const LanguageContext = createContext<{ lang: Lang }>({ lang: defaultLocale });

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const segment = pathname.split("/")[1];
  const lang = (locales as readonly string[]).includes(segment)
    ? (segment as Lang)
    : defaultLocale;

  return (
    <LanguageContext.Provider value={{ lang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
