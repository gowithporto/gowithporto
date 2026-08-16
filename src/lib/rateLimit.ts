const attempts = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

type HeaderSource = Headers | Record<string, string | undefined> | undefined;

/** Best-effort client IP from x-forwarded-for, for use as a rate-limit key.
 * Accepts either a Web API Headers instance (Route Handlers) or a plain
 * headers object (NextAuth's `authorize` callback). */
export function getClientIp(headers: HeaderSource): string {
  if (!headers) return "unknown";
  const forwarded =
    typeof (headers as Headers).get === "function"
      ? (headers as Headers).get("x-forwarded-for")
      : (headers as Record<string, string | undefined>)["x-forwarded-for"];
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

/** Returns true if the request is allowed, false if the key has hit the limit. */
export function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return false;
  }

  entry.count += 1;
  return true;
}
