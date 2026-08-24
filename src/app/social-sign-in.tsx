import React, { useState } from "react";
import { Alert, StyleSheet, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

import { authClient } from "../lib/auth-client";
import { GeistText, useTheme } from "../components/GeistUI";

export default function SocialSignInScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  const handleVercelSignIn = async () => {
    try {
      setLoading(true);
      const { error } = await authClient.signIn.social({
        provider: "vercel",
        providerId: "vercel",
        callbackURL: "/dashboard",
      });

      if (error) {
        console.error("Better Auth Sign In Error:", error);
        Alert.alert("Sign In Error", error.message || "Failed to sign in with Vercel. See console for details.");
        return;
      }

      router.replace("/dashboard" as any);
    } catch (err: any) {
      console.error("Better Auth Sign In Exception:", err);
      Alert.alert("Sign In Error", err.message || "An unexpected error occurred during sign in. See console for details.");
    } finally {
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
        <Svg width="56" height="56" viewBox="0 0 24 24" fill="none">
          <Path d="M12 2L24 22H0L12 2Z" fill={theme.text} />
        </Svg>
        <GeistText weight="600" style={[styles.wordmark, { color: theme.text }]}>
          VERCEL
        </GeistText>
        <GeistText weight="500" style={[styles.tagline, { color: theme.text }]}>
          Develop. Preview. Ship.
        </GeistText>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={loading}
          onPress={handleVercelSignIn}
          style={[styles.primaryButton, { backgroundColor: theme.text }]}
        >
          {loading ? (
            <ActivityIndicator color={theme.background} />
          ) : (
            <>
              <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <Path d="M12 2L24 22H0L12 2Z" fill={theme.background} />
              </Svg>
              <GeistText
                weight="600"
                style={{ color: theme.background, fontSize: 16, letterSpacing: -0.2 }}
              >
                Continue with Vercel
              </GeistText>
            </>
          )}
        </TouchableOpacity>

        <GeistText weight="500" style={[styles.helperText, { color: theme.text }]}>
          Authenticate using Better Auth Expo OAuth
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
    gap: 16,
    marginTop: -32,
  },
  wordmark: {
    fontSize: 16,
    letterSpacing: 4,
    opacity: 0.9,
  },
  tagline: {
    fontSize: 14,
    opacity: 0.5,
    marginTop: 4,
  },
  buttonContainer: {
    gap: 14,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 12,
    minHeight: 54,
  },
  helperText: {
    textAlign: "center",
    fontSize: 12.5,
    letterSpacing: 0.2,
    opacity: 0.4,
    marginTop: 2,
  },
});
