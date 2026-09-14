/** Safely serializes a JSON-LD object for embedding via dangerouslySetInnerHTML.
 *
 *  JSON.stringify does not escape "<", so a free-text field (product title,
 *  description, etc.) containing "</script><script>...</script>" would close
 *  our script tag early and get parsed as a second, executing script — a
 *  stored XSS. Escaping "<" to its unicode form neutralizes that while
 *  staying valid, unchanged JSON once parsed. */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
