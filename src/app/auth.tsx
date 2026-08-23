import { useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { siGithub, siGmail } from "simple-icons";

import { GeistText, useTheme } from "../components/GeistUI";

export default function AuthScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const handleLogin = () => {
    // In a real app, this would authenticate and then route to home
    router.replace("/(tabs)");
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background, paddingTop: insets.top },
      ]}
    >
      <View style={styles.header}>
        <Svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <Path d="M12 2L24 22H0L12 2Z" fill={theme.text} />
        </Svg>
        <GeistText weight="bold" style={{ fontSize: 24, marginTop: 24 }}>
          Log in to Vercel
        </GeistText>
      </View>

      <View style={styles.buttonContainer}>
        {/* Primary inverted button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleLogin}
          style={[styles.primaryButton, { backgroundColor: theme.text }]}
        >
          <Svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            style={{ marginRight: 12 }}
          >
            <Path d={siGithub.path} fill={theme.background} />
          </Svg>
          <GeistText
            weight="500"
            style={{ color: theme.background, fontSize: 16 }}
          >
            Continue with GitHub
          </GeistText>
        </TouchableOpacity>

        {/* Ghost buttons */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleLogin}
          style={[styles.ghostButton, { borderColor: theme.border }]}
        >
          <Svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            style={{ marginRight: 12 }}
          >
            <Path
              d="M22.65 14.39L12 22.13 1.35 14.39a1 1 0 0 1-.36-1.12l3.35-10a1 1 0 0 1 1.9 0l1.7 5.09h8.72l1.7-5.09a1 1 0 0 1 1.9 0l3.35 10a1 1 0 0 1-.36 1.12z"
              fill="#FC6D26"
            />
          </Svg>
          <GeistText weight="500" style={{ fontSize: 16 }}>
            Continue with GitLab
          </GeistText>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleLogin}
          style={[styles.ghostButton, { borderColor: theme.border }]}
        >
          <Svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            style={{ marginRight: 12 }}
          >
            <Path
              d="M2 3a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3zm2.5 4v10h4v-7h7v7h4V7h-15z"
              fill="#2684FF"
            />
          </Svg>
          <GeistText weight="500" style={{ fontSize: 16 }}>
            Continue with Bitbucket
          </GeistText>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={[styles.line, { backgroundColor: theme.border }]} />
          <GeistText secondary style={{ paddingHorizontal: 16 }}>
            OR
          </GeistText>
          <View style={[styles.line, { backgroundColor: theme.border }]} />
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleLogin}
          style={[styles.ghostButton, { borderColor: theme.border }]}
        >
          <Svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            style={{ marginRight: 12 }}
          >
            <Path d={siGmail.path} fill={theme.text} />
          </Svg>
          <GeistText weight="500" style={{ fontSize: 16 }}>
            Continue with Email
          </GeistText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  buttonContainer: {
    gap: 16,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 6,
    minHeight: 48,
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
