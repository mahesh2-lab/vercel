import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
  baseURL: "https://vercel-app-nine-omega.vercel.app",
  plugins: [
    expoClient({
      scheme: "myapp",
      storagePrefix: "myapp",
      storage: SecureStore,
    }),
  ],
});

/**
 * Helper to perform authenticated requests to backend API routes on native,
 * automatically attaching cookies stored in SecureStore.
 */
export async function fetchWithAuth(url: string, init?: RequestInit) {
  const cookies = await authClient.getCookie();
  const headers = new Headers(init?.headers);
  if (cookies) {
    headers.set("Cookie", cookies);
  }
  return fetch(url, {
    ...init,
    headers,
    credentials: "omit",
  });
}
