import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const STORAGE_KEY = "vercel_access_token";

let _cachedToken: string | null = null;

export async function hydrateToken(): Promise<string | null> {
  if (_cachedToken) {
    return _cachedToken;
  }

  try {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.localStorage) {
        _cachedToken = window.localStorage.getItem(STORAGE_KEY);
      }
    } else {
      const isAvailable = await SecureStore.isAvailableAsync().catch(() => false);
      if (isAvailable) {
        _cachedToken = await SecureStore.getItemAsync(STORAGE_KEY);
      }
    }
  } catch (error) {
    console.warn("[TokenStorage] Failed to hydrate token:", error);
  }

  return _cachedToken;
}

export async function setToken(token: string): Promise<void> {
  const trimmed = token ? token.trim() : "";
  _cachedToken = trimmed || null;

  try {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.localStorage) {
        if (trimmed) {
          window.localStorage.setItem(STORAGE_KEY, trimmed);
        } else {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      }
    } else {
      const isAvailable = await SecureStore.isAvailableAsync().catch(() => false);
      if (isAvailable) {
        if (trimmed) {
          await SecureStore.setItemAsync(STORAGE_KEY, trimmed, {
            keychainAccessible: SecureStore.ALWAYS,
          });
        } else {
          await SecureStore.deleteItemAsync(STORAGE_KEY);
        }
      }
    }
  } catch (error) {
    console.warn("[TokenStorage] Failed to persist token:", error);
  }
}

export async function clearToken(): Promise<void> {
  _cachedToken = null;

  try {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } else {
      const isAvailable = await SecureStore.isAvailableAsync().catch(() => false);
      if (isAvailable) {
        await SecureStore.deleteItemAsync(STORAGE_KEY);
      }
    }
  } catch (error) {
    console.warn("[TokenStorage] Failed to clear token:", error);
  }
}

export function getToken(): string | null {
  return _cachedToken;
}

