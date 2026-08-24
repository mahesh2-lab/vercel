import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";

import { authClient } from "../lib/auth-client";
import { GeistText, useTheme } from "../components/GeistUI";

/**
 * Deep-link landing screen: myapp://social-sign-in
 *
 * After the Vercel OAuth browser flow completes, the OS opens this route.
 * The @better-auth/expo expoClient plugin intercepts the URL, exchanges the
 * code, and persists the session. We just wait for useSession to populate
 * and then redirect into the app (or back to /auth on failure).
 */
export default function SocialSignInScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (isPending) return;
    if (session?.user) {
      router.replace("/(tabs)");
    } else {
      // No session after the callback — send back to auth
      router.replace("/auth");
    }
  }, [session, isPending]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ActivityIndicator size="large" color={theme.text} />
      <GeistText secondary style={styles.label}>
        Signing you in…
      </GeistText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  label: {
    fontSize: 14,
  },
});
