import React, { useState, useEffect } from "react";
import { getCachedVercelToken } from '../../lib/vercel-token';
import {
  ScrollView,
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Linking,
  Modal,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  GeistText,
  GeistCard,
  StatusBadge,
  useTheme,
  GeistButton,
  GeistSpinner,
} from "../../components/GeistUI";
import {
  ExternalLink,
  GitCommit,
  Tag,
  List,
  ChevronRight,
  Settings,
  RotateCw,
  CheckCircle2,
  X,
} from "lucide-react-native";
import { Toast, ToastType } from "../../components/Toast";
import { vercel } from "../../api/vercel";
import { useUserContext } from "../../context/UserContext";

export default function ProjectScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const theme = useTheme();
  const { activeScope } = useUserContext();

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Redeploy modal state
  const [redeployModalOpen, setRedeployModalOpen] = useState(false);
  const [clearCache, setClearCache] = useState(false);
  const [redeployTarget, setRedeployTarget] = useState<"production" | "preview">("production");
  const [redeploying, setRedeploying] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: ToastType }>({
    visible: false,
    message: "",
    type: "success",
  });

  const showToast = (message: string, type: ToastType = "success") => {
    setToast({ visible: true, message, type });
  };

  useEffect(() => {
    async function fetchProject() {
      try {
        if (!getCachedVercelToken()) return;
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

  const latestDeployment = project?.latestDeployments?.[0];
  const rawLatestState = (latestDeployment?.readyState || latestDeployment?.state || "READY").toUpperCase();
  const status =
    rawLatestState === "READY"
      ? "Ready"
      : rawLatestState === "ERROR" || rawLatestState === "FAILED"
        ? "Failed"
        : rawLatestState === "CANCELED"
          ? "Canceled"
          : "Building";

  const handleVisit = () => {
    const url = `https://${project?.name || id}.vercel.app`;
    Linking.openURL(url).catch((err) => console.error("Couldn't open URL:", err));
  };

  const executeRedeploy = async () => {
    setRedeploying(true);
    const token = getCachedVercelToken();
    const projectName = project?.name || (id as string);
    const depId = latestDeployment?.id || latestDeployment?.uid;

    try {
      if (!token) {
        // Simulated redeploy
        setTimeout(() => {
          setRedeploying(false);
          setRedeployModalOpen(false);
          const fakeId = Math.random().toString(16).substring(2, 8);
          showToast(`Redeploying ${projectName}...`);
          router.push(`/deployment/${fakeId}`);
        }, 1000);
        return;
      }

      const queryParams = new URLSearchParams();
      queryParams.append("forceNew", "1");
      if (clearCache) {
        queryParams.append("withCache", "0");
      }
      if (activeScope?.type === "team" && activeScope.id) {
        queryParams.append("teamId", activeScope.id);
      }

      const payload: any = {
        name: projectName,
        target: redeployTarget,
      };

      if (depId) {
        payload.deploymentId = depId;
      }

      const { createDeployment } = require('../../lib/vercel-api');
      const res = await createDeployment("?" + queryParams.toString(), payload);

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || data?.message || "Failed to trigger redeployment");
      }

      showToast("Redeployment triggered successfully!", "success");
      setRedeployModalOpen(false);
      setRedeploying(false);

      const newId = data.id || data.uid || data.url || projectName;
      router.push(`/deployment/${newId}`);
    } catch (err: any) {
      console.error("Redeploy error:", err);
      setRedeploying(false);
      showToast(`Redeploy Failed: ${err.message}`, "error");
      Alert.alert("Redeploy Failed", err.message);
    }
  };

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
        <GeistSpinner size={36} color={theme.text} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={styles.container}
    >
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

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
                      latestDeployment?.meta?.githubCommitMessage ||
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
                      latestDeployment?.meta?.githubCommitRef ||
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
                onPress={() => setRedeployModalOpen(true)}
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

      {/* Redeploy Modal */}
      <Modal
        visible={redeployModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => !redeploying && setRedeployModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <RotateCw size={18} color={theme.text} />
                <GeistText weight="600" style={{ fontSize: 16 }}>
                  Redeploy Project
                </GeistText>
              </View>
              <TouchableOpacity onPress={() => !redeploying && setRedeployModalOpen(false)}>
                <X size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={{ padding: 20 }}>
              <GeistText secondary style={{ fontSize: 13, marginBottom: 16 }}>
                Trigger a new build for <GeistText weight="bold">{project?.name || id}</GeistText> from the latest commit.
              </GeistText>

              {/* Target Selector */}
              <GeistText weight="600" style={{ fontSize: 13, marginBottom: 8 }}>
                Target Environment
              </GeistText>
              <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
                {(["production", "preview"] as const).map((t) => {
                  const active = redeployTarget === t;
                  return (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setRedeployTarget(t)}
                      style={[
                        styles.targetOption,
                        {
                          backgroundColor: active ? theme.text : theme.surface,
                          borderColor: theme.border,
                        },
                      ]}
                    >
                      <GeistText
                        weight="500"
                        style={{
                          color: active ? theme.background : theme.text,
                          textTransform: "capitalize",
                          fontSize: 13,
                        }}
                      >
                        {t}
                      </GeistText>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Clear Cache Toggle */}
              <TouchableOpacity
                style={[
                  styles.cacheToggleRow,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                  },
                ]}
                activeOpacity={0.8}
                onPress={() => setClearCache(!clearCache)}
              >
                <View style={{ flex: 1 }}>
                  <GeistText weight="500" style={{ fontSize: 13 }}>
                    Clear Build Cache
                  </GeistText>
                  <GeistText secondary style={{ fontSize: 11, marginTop: 2 }}>
                    Rebuild all dependencies without cache
                  </GeistText>
                </View>
                <View
                  style={[
                    styles.checkbox,
                    {
                      backgroundColor: clearCache ? theme.text : "transparent",
                      borderColor: theme.border,
                    },
                  ]}
                >
                  {clearCache && <CheckCircle2 size={14} color={theme.background} />}
                </View>
              </TouchableOpacity>

              <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 12, marginTop: 20 }}>
                <TouchableOpacity
                  style={[styles.modalCancelBtn, { borderColor: theme.border }]}
                  onPress={() => setRedeployModalOpen(false)}
                  disabled={redeploying}
                >
                  <GeistText weight="500" style={{ fontSize: 13 }}>Cancel</GeistText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalSubmitBtn, { backgroundColor: theme.text }]}
                  onPress={executeRedeploy}
                  disabled={redeploying}
                >
                  {redeploying ? (
                    <GeistSpinner size="small" color={theme.background} />
                  ) : (
                    <GeistText weight="600" style={{ color: theme.background, fontSize: 13 }}>
                      Redeploy
                    </GeistText>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    maxWidth: 440,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  targetOption: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 6,
    borderWidth: 1,
  },
  cacheToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelBtn: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  modalSubmitBtn: {
    borderRadius: 6,
    paddingHorizontal: 18,
    paddingVertical: 8,
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
  },
});
