import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import {
  TouchableOpacity,
  View,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

import { setToken } from "../lib/token-storage";
import { getUser } from "../lib/vercel-api";
import { useUserContext } from "../context/UserContext";
import { GeistSpinner, GeistText, useTheme } from "../components/GeistUI";
import { styles } from "../styles/auth.styles";

export default function AuthScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [tokenInput, setTokenInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, loading: userLoading, refreshUser } = useUserContext();

  useEffect(() => {
    if (!userLoading && user) {
      router.replace("/(tabs)");
    }
  }, [user, userLoading, router]);

  const handleLogin = async () => {
    const trimmedToken = tokenInput.trim();
    if (!trimmedToken) {
      Alert.alert("Invalid Token", "Please enter a valid Vercel Personal Access Token.");
      return;
    }

    try {
      setLoading(true);
      await setToken(trimmedToken);

      let res;
      try {
        res = await getUser();
      } catch (e) {
        throw new Error("Invalid token or unauthorized.");
      }

      if (!res.ok) {
        throw new Error("Invalid token or unauthorized. Please check your token and try again.");
      }

      await refreshUser();
      router.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert("Authentication Failed", err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            backgroundColor: theme.background,
            paddingTop: insets.top,
            paddingBottom: insets.bottom + 32,
            flexGrow: 1,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
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
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.background,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
            placeholder="Enter the Vercel Token..."
            placeholderTextColor={theme.textSecondary}
            value={tokenInput}
            onChangeText={setTokenInput}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />

          <TouchableOpacity
            activeOpacity={0.7}
            disabled={loading || !tokenInput}
            onPress={handleLogin}
            style={[
              styles.primaryButton,
              { backgroundColor: theme.text, opacity: !tokenInput || loading ? 0.7 : 1 },
            ]}
          >
            {loading ? (
              <GeistSpinner size={20} color={theme.background} />
            ) : (
              <GeistText
                weight="600"
                style={{ color: theme.background, fontSize: 15.5, letterSpacing: -0.2 }}
              >
                Continue
              </GeistText>
            )}
          </TouchableOpacity>

          <GeistText weight="500" style={[styles.helperText, { color: theme.text }]}>
            Deploy. Preview. Ship.
          </GeistText>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

