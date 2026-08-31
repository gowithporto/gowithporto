/**
 * True when a Stripe error means "this account id isn't valid for the key
 * that made the call" — confirmed empirically to come back as `account_invalid`
 * (StripePermissionError), not the more commonly assumed `resource_missing`,
 * for a stored id from the wrong mode (test vs live). Both are checked since
 * Stripe may use `resource_missing` for other "no longer exists" cases.
 */
export function isStaleStripeAccountError(err: any): boolean {
  return err?.code === "account_invalid" || err?.code === "resource_missing";
}
