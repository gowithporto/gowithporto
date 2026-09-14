function minuteWord(n: string) {
  return `${n} minute${n === "1" ? "" : "s"}`;
}

/** Translates the lockout codes thrown from authorize() (see lib/auth.ts) into
 *  a human message, shared by the admin and store-owner login pages. Falls
 *  back to `fallback` for a plain wrong password, or if the shape doesn't
 *  match (e.g. NextAuth's own "CredentialsSignin" for an unrelated failure). */
export function describeLoginError(error: string, fallback: string): string {
  if (error.startsWith("LOCKED_STAGE1|")) {
    const [, minutes] = error.split("|");
    return `Too many failed attempts. Please wait ${minuteWord(minutes)} before trying again.`;
  }

  if (error.startsWith("LOCKED_STAGE2|")) {
    const [, minutes, ip] = error.split("|");
    return `Too many failed attempts again. We've logged your IP address (${ip}) for security. Please wait ${minuteWord(minutes)} before trying again.`;
  }

  return fallback;
}
