import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const STORAGE_KEY = "vercel_access_token";

/** In-memory cache so synchronous reads work after first hydration. */
let _cachedToken: string | null = null;

/** Call once on app start (or after sign-in) to load the persisted token. */
export async function hydrateVercelToken(): Promise<string | null> {
  if (Platform.OS !== "web") {
    _cachedToken = await SecureStore.getItemAsync(STORAGE_KEY);
  }
  return _cachedToken;
}

/** Persist and cache a new token (called after Vercel OAuth login). */
export async function setVercelToken(token: string): Promise<void> {
  _cachedToken = token;
  if (Platform.OS !== "web") {
    await SecureStore.setItemAsync(STORAGE_KEY, token);
  }
}

/** Clear token on sign-out. */
export async function clearVercelToken(): Promise<void> {
  _cachedToken = null;
  if (Platform.OS !== "web") {
    await SecureStore.deleteItemAsync(STORAGE_KEY);
  }
}

/**
 * Synchronous read — returns null if hydrateVercelToken() hasn't been called yet.
 * Prefer this inside components/screens after the UserContext has loaded.
 */
export function getCachedVercelToken(): string | null {
  return _cachedToken;
}
