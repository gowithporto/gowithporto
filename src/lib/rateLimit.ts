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

// Staged login lockout — shared by any credentials-based login flow (admin,
// store-owner, ...). Callers namespace their own keys (e.g. `admin-login:...`
// vs `store-owner-login:...`) so each flow's attempt counters never collide.
type LoginAttemptState = {
  failCount: number;
  stage: 0 | 1 | 2;
  lockedUntil: number | null;
};

const loginAttempts = new Map<string, LoginAttemptState>();

const MAX_FAILS_BEFORE_LOCK = 3;
const STAGE_LOCK_MS: Record<1 | 2, number> = {
  1: 5 * 60 * 1000,
  2: 10 * 60 * 1000,
};

export type LoginLockCheck =
  | { allowed: true }
  | { allowed: false; stage: 1 | 2; lockedUntilMs: number };

/** Call before verifying credentials — short-circuits with the active lockout, if any.
 *  A lockout that has expired is cleared here, but its `stage` carries forward so a
 *  repeat offender escalates straight back to the harsher 10-minute lock. */
export function checkLoginLock(key: string): LoginLockCheck {
  const state = loginAttempts.get(key);
  if (!state?.lockedUntil) return { allowed: true };

  if (Date.now() < state.lockedUntil) {
    return { allowed: false, stage: state.stage as 1 | 2, lockedUntilMs: state.lockedUntil };
  }

  state.lockedUntil = null;
  state.failCount = 0;
  return { allowed: true };
}

/** Call after a failed password check. The 3rd consecutive failure in a cycle
 *  triggers a new lockout — stage 1 (5 min) the first time, stage 2 (10 min)
 *  every time after. */
export function recordLoginFailure(key: string): LoginLockCheck {
  const state = loginAttempts.get(key) ?? { failCount: 0, stage: 0, lockedUntil: null };
  state.failCount += 1;

  if (state.failCount >= MAX_FAILS_BEFORE_LOCK) {
    const nextStage: 1 | 2 = state.stage === 0 ? 1 : 2;
    state.stage = nextStage;
    state.lockedUntil = Date.now() + STAGE_LOCK_MS[nextStage];
    state.failCount = 0;
    loginAttempts.set(key, state);
    return { allowed: false, stage: nextStage, lockedUntilMs: state.lockedUntil };
  }

  loginAttempts.set(key, state);
  return { allowed: true };
}

/** Call after a successful login to clear any tracked failures for this key. */
export function clearLoginAttempts(key: string): void {
  loginAttempts.delete(key);
}
