import en from "./en.json";
import es from "./es.json";
import fr from "./fr.json";
import pt from "./pt.json";

export type Lang = "en" | "fr" | "es" | "pt";

export const locales: readonly Lang[] = ["en", "fr", "es", "pt"];
export const defaultLocale: Lang = "en";

export const languages: Record<Lang, Record<string, string>> = { en, fr, es, pt };

export const t = (lang: string, key: string) =>
  languages[lang as Lang]?.[key] || languages[defaultLocale][key] || key;
