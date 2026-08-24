import { Vercel } from "@vercel/sdk";
import { getCachedVercelToken } from "../lib/vercel-token";

/**
 * Returns a Vercel SDK client initialised with the current OAuth access token.
 * Always call this function instead of using a cached module-level instance so
 * the token set after login is always picked up.
 */
export function getVercelClient(): Vercel {
  const token = getCachedVercelToken();
  return new Vercel({ bearerToken: token || "" });
}

// Backward-compatible proxy so existing `vercel.xyz` call sites keep working.
export const vercel = new Proxy({} as Vercel, {
  get(_target, prop) {
    return (getVercelClient() as any)[prop];
  },
});
