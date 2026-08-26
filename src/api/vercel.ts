import { Vercel } from "@vercel/sdk";
import { getCachedVercelToken } from "../lib/vercel-token";

export function getVercelClient(): Vercel {
  const token = getCachedVercelToken();
  return new Vercel({ bearerToken: token || "" });
}

export const vercel = new Proxy({} as Vercel, {
  get(_target, prop) {
    return (getVercelClient() as any)[prop];
  },
});

