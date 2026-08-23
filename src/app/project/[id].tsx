import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Linking,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  GeistText,
  GeistCard,
  StatusBadge,
  useTheme,
  GeistButton,
} from "../../components/GeistUI";
import {
  ExternalLink,
  GitCommit,
  Tag,
  List,
  ChevronRight,
  Settings,
} from "lucide-react-native";
import { vercel } from "../../api/vercel";

export default function ProjectScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const theme = useTheme();

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProject() {
      try {
        if (!process.env.EXPO_PUBLIC_VERCEL_TOKEN) return;
        const result = await vercel.projects.getProject({
          idOrName: id as string,
        });
        setProject(
          (result as any)?.project || (result as any)?.object || result,
        );
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={theme.text} />
      </View>
    );
  }

  const latestDeployment = project?.latestDeployments?.[0];
  const status =
    latestDeployment?.readyState === "READY"
      ? "Ready"
      : latestDeployment?.readyState === "ERROR"
        ? "Failed"
        : "Building";

  const handleVisit = () => {
    const url = `https://${project?.name || id}.vercel.app`;
    Linking.openURL(url).catch((err) => console.error("Couldn't open URL:", err));
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={styles.container}
    >
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <GeistText weight="bold" style={{ fontSize: 32, marginBottom: 8 }}>
            {project?.name || id}
          </GeistText>
          <TouchableOpacity style={styles.urlButton} activeOpacity={0.7} onPress={handleVisit}>
            <GeistText secondary style={{ fontSize: 14 }}>
              {project?.name || id}.vercel.app
            </GeistText>
            <ExternalLink
              color={theme.textSecondary}
              size={14}
              style={{ marginLeft: 6 }}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.visitButton, { borderColor: theme.border }]}
          onPress={handleVisit}
        >
          <ExternalLink
            color={theme.text}
            size={16}
            style={{ marginRight: 8 }}
          />
          <GeistText weight="500">Visit</GeistText>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        <View style={styles.leftCol}>
          <GeistCard style={{ padding: 24, marginBottom: 24 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <GeistText weight="bold" style={{ fontSize: 18 }}>
                Production Deployment
              </GeistText>
              <StatusBadge status={status} />
            </View>
            <GeistText secondary style={{ marginBottom: 24 }}>
              The deployment that is available to your visitors.
            </GeistText>

            <View style={[styles.deploymentBox, { borderColor: theme.border }]}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 12,
                }}
              >
                <View style={{ flex: 1, marginRight: 16 }}>
                  <GeistText weight="500" style={{ fontSize: 16 }} numberOfLines={2}>
                    {project?.targets?.production?.meta?.githubCommitMessage ||
                      "No commit message"}
                  </GeistText>
                </View>
                <GeistText mono secondary style={{ fontSize: 13, flexShrink: 0 }}>
                  {latestDeployment?.createdAt
                    ? new Date(latestDeployment.createdAt).toLocaleDateString()
                    : "Just now"}
                </GeistText>
              </View>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 16 }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <GitCommit
                    color={theme.textSecondary}
                    size={14}
                    style={{ marginRight: 6 }}
                  />
                  <GeistText mono secondary style={{ fontSize: 13 }}>
                    {project?.targets?.production?.meta?.githubCommitRef ||
                      "main"}
                  </GeistText>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Tag
                    color={theme.textSecondary}
                    size={14}
                    style={{ marginRight: 6 }}
                  />
                  <GeistText mono secondary style={{ fontSize: 13 }}>
                    {project?.targets?.production?.meta?.githubCommitSha?.substring(
                      0,
                      7,
                    ) ||
                      latestDeployment?.id?.substring(0, 7) ||
                      "N/A"}
                  </GeistText>
                </View>
              </View>
            </View>

            <View
              style={{
                flexDirection: "row",
                marginTop: 24,
                paddingTop: 16,
                borderTopWidth: 1,
                borderTopColor: theme.border,
                gap: 12,
              }}
            >
              <GeistButton
                title="View Logs"
                onPress={() => {
                  const depId = latestDeployment?.id || latestDeployment?.uid;
                  if (depId) {
                    router.push(`/deployment/${depId}/logs`);
                  }
                }}
                secondary
                style={{ flex: 1 }}
              />
              <GeistButton
                title="Redeploy"
                onPress={() => Alert.alert('Unsupported', 'Redeploying from the mobile dashboard is currently unsupported.')}
                secondary
                style={{ flex: 1 }}
              />
            </View>
          </GeistCard>
        </View>

        <View style={styles.rightCol}>
          <GeistCard style={{ padding: 0, overflow: "hidden" }}>
            <TouchableOpacity
              style={[
                styles.navRow,
                { borderBottomWidth: 1, borderBottomColor: theme.border },
              ]}
              onPress={() => router.push(`/project/${id}/deployments`)}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <List
                  color={theme.textSecondary}
                  size={20}
                  style={{ marginRight: 12 }}
                />
                <GeistText weight="500" style={{ fontSize: 16 }}>
                  Deployments
                </GeistText>
              </View>
              <ChevronRight color={theme.textSecondary} size={20} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navRow}
              onPress={() => router.push(`/project/${id}/settings`)}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Settings
                  color={theme.textSecondary}
                  size={20}
                  style={{ marginRight: 12 }}
                />
                <GeistText weight="500" style={{ fontSize: 16 }}>
                  Settings
                </GeistText>
              </View>
              <ChevronRight color={theme.textSecondary} size={20} />
            </TouchableOpacity>
          </GeistCard>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    maxWidth: 1200,
    width: "100%",
    alignSelf: "center",
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
    flexWrap: "wrap",
    gap: 16,
  },
  urlButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  visitButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 6,
  },
  grid: {
    flexDirection: Platform.OS === "web" ? "row" : "column",
    gap: 24,
  },
  leftCol: {
    flex: Platform.OS === "web" ? 2 : undefined,
  },
  rightCol: {
    flex: Platform.OS === "web" ? 1 : undefined,
  },
  deploymentBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
});
