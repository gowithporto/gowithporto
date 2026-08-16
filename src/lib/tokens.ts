import crypto from "crypto";

/** Unguessable, URL-safe, single-use token for the buyer-held fulfillment QR. */
export function generateFulfillmentToken() {
  return crypto.randomBytes(24).toString("base64url");
}
