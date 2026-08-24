import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

import { authClient } from "../lib/auth-client";
import { GeistText, useTheme } from "../components/GeistUI";

export default function AuthScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  // Watch for session — when OAuth completes the expoClient plugin
  // intercepts the deep-link, stores the session, and useSession updates.
  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (session?.user) {
      router.replace("/(tabs)");
    }
  }, [session]);

  const handleLogin = async () => {
    try {
      setLoading(true);
      // callbackURL must be the deep-link scheme so the OS can hand control
      // back to the app after the browser finishes. The expoClient plugin
      // intercepts "myapp://social-sign-in" and stores the session tokens.
      const { error } = await authClient.signIn.social({
        provider: "vercel",
        callbackURL: "myapp://social-sign-in",
      });

      if (error) {
        Alert.alert("Sign In Error", error.message || "Failed to sign in with Vercel");
        setLoading(false);
      }
      // Do NOT navigate here — wait for useSession above to pick up the session.
    } catch (err: any) {
      Alert.alert("Sign In Error", err.message || "An unexpected error occurred during sign in");
      setLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom + 24,
        },
      ]}
    >
      <View style={styles.header}>
        <Svg width="52" height="52" viewBox="0 0 24 24" fill="none">
          <Path d="M12 2L24 22H0L12 2Z" fill={theme.text} />
        </Svg>
        <GeistText weight="600" style={[styles.wordmark, { color: theme.text }]}>
          VERCEL
        </GeistText>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          activeOpacity={0.7}
          disabled={loading}
          onPress={handleLogin}
          style={[styles.primaryButton, { backgroundColor: theme.text }]}
        >
          {loading ? (
            <ActivityIndicator color={theme.background} />
          ) : (
            <>
              <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <Path d="M12 2L24 22H0L12 2Z" fill={theme.background} />
              </Svg>
              <GeistText
                weight="600"
                style={{ color: theme.background, fontSize: 15.5, letterSpacing: -0.2 }}
              >
                Continue with Vercel
              </GeistText>
            </>
          )}
        </TouchableOpacity>

        <GeistText
          weight="500"
          style={[styles.helperText, { color: theme.text }]}
        >
          Deploy. Preview. Ship.
        </GeistText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "space-between",
  },
  header: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
    marginTop: -32,
  },
  wordmark: {
    fontSize: 14,
    letterSpacing: 4,
    opacity: 0.9,
  },
  buttonContainer: {
    gap: 14,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    paddingVertical: 17,
    borderRadius: 12,
    minHeight: 52,
  },
  ghostButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 6,
    minHeight: 48,
    borderWidth: 1,
    backgroundColor: "transparent",
  },
  helperText: {
    textAlign: "center",
    fontSize: 12.5,
    letterSpacing: 0.2,
    opacity: 0.4,
    marginTop: 2,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  line: {
    flex: 1,
    height: 1,
  },
});