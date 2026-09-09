const KEY = "scrutinye.postSigninRedirect";

/**
 * Remembers where to send the user once they're signed in — set before navigating to
 * /signin, read back once ProtectedShell sees authenticated:true. localStorage (not
 * component state) because this needs to survive the full-page redirect out to the OAuth
 * provider and back, which a fresh page load wipes any in-memory state on.
 */
export function setPostSigninRedirect(path: string): void {
  try {
    localStorage.setItem(KEY, path);
  } catch {
    // best-effort — worst case the user just lands on the default post-login page
  }
}

/** Reads and clears the stored redirect in one step so it only ever fires once. */
export function consumePostSigninRedirect(): string | null {
  try {
    const value = localStorage.getItem(KEY);
    if (value) localStorage.removeItem(KEY);
    return value;
  } catch {
    return null;
  }
}
