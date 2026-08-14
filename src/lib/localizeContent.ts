/**
 * Merges a document's `translations.<lang>` overlay onto its base (English) fields,
 * falling back to the base value per-field when a translation is missing, and
 * strips the `translations` blob from the result so API responses keep their
 * existing shape regardless of locale.
 */
export function resolveLocalized<T extends Record<string, any>>(
  doc: T,
  lang: string,
  fields: readonly string[],
): Omit<T, "translations"> {
  const { translations, ...base } = doc;

  if (lang === "en" || !translations || typeof translations !== "object") {
    return base;
  }

  const overlay = translations[lang];
  if (!overlay || typeof overlay !== "object") {
    return base;
  }

  const result = { ...base };
  for (const field of fields) {
    if (overlay[field] !== undefined && overlay[field] !== null && overlay[field] !== "") {
      (result as Record<string, any>)[field] = overlay[field];
    }
  }
  return result;
}
