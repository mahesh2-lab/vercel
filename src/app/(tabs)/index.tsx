import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  Platform,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import {
  GeistText,
  GeistCard,
  StatusBadge,
  useTheme,
  GeistButton,
} from "../../components/GeistUI";
import { GitCommit, Folder, RefreshCw, Plus } from "lucide-react-native";
import { Toast, ToastType } from "../../components/Toast";
import { vercel } from "../../api/vercel";
import { useUserContext } from "../../context/UserContext";

export default function ProjectsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { activeScope } = useUserContext();

  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadingMoreRef = useRef(false);
  const [hasMore, setHasMore] = useState(true);
  const [pagination, setPagination] = useState<any>(null);
  const paginationNextRef = useRef<number | null>(null);
  const [error, setError] = useState("");

  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: ToastType;
  }>({
    visible: false,
    message: "",
    type: "success",
  });

  const showToast = (message: string, type: ToastType = "success") => {
    setToast({ visible: true, message, type });
  };

  const fetchProjects = useCallback(
    async (isPullToRefresh = false, loadMore = false) => {
      if (loadMore) {
        if (loadingMoreRef.current) return;
        loadingMoreRef.current = true;
        setLoadingMore(true);
      } else {
        if (isPullToRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setHasMore(true);
      }
      setError("");

      const token = process.env.EXPO_PUBLIC_VERCEL_TOKEN;
      if (!token) {
        setError("No EXPO_PUBLIC_VERCEL_TOKEN found in .env");
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
        loadingMoreRef.current = false;
        return;
      }

      try {
        const teamId =
          activeScope?.type === "team" ? activeScope.id : undefined;

        // The Vercel SDK getProjects request schema dropped `until`, but supports `from`.
        // We subtract 1 millisecond from `paginationNextRef.current` to fetch items strictly older
        // than the cursor, perfectly simulating `until` and preventing timestamp overlap loops.
        const from =
          loadMore && paginationNextRef.current
            ? String(Number(paginationNextRef.current) - 1)
            : undefined;
        console.log({ from });

        const result = await vercel.projects.getProjects({
          limit: "10",
          teamId,
          ...(from ? { from } : {}),
        });

        const list =
          (result as any)?.projects ||
          (result as any)?.object?.projects ||
          (result as any)?.result?.projects ||
          [];

        const newPagination =
          (result as any)?.pagination ||
          (result as any)?.object?.pagination ||
          (result as any)?.result?.pagination;

        if (loadMore) {
          setProjects((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const uniqueList = list.filter((p: any) => !existingIds.has(p.id));
            return [...prev, ...uniqueList];
          });
        } else {
          setProjects(list);
        }
        setPagination(newPagination);

        // Prevent infinite loop if API returns the same cursor or no cursor
        if (
          !newPagination?.next ||
          (loadMore && paginationNextRef.current === newPagination?.next)
        ) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }

        paginationNextRef.current = newPagination?.next;

        if (isPullToRefresh) {
          showToast("Projects refreshed", "success");
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch projects");
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
        loadingMoreRef.current = false;
      }
    },
    [activeScope],
  );

  useEffect(() => {
    let isMounted = true;

    async function load() {
      await fetchProjects(false);
    }

    if (isMounted) {
      load();
    }

    return () => {
      isMounted = false;
    };
  }, [fetchProjects]);

  const handleManualRefresh = () => {
    fetchProjects(true);
  };

  const getStatus = (proj: any) => {
    const rawState = (
      proj.latestDeployments?.[0]?.readyState ||
      proj.latestDeployments?.[0]?.state ||
      "READY"
    ).toUpperCase();

    if (rawState === "READY") return "Ready";
    if (rawState === "ERROR" || rawState === "FAILED") return "Failed";
    if (rawState === "CANCELED") return "Canceled";
    if (rawState === "QUEUED") return "Queued";
    return "Building";
  };

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 400;

    if (
      isCloseToBottom &&
      !loading &&
      !loadingMoreRef.current &&
      hasMore &&
      paginationNextRef.current
    ) {
      fetchProjects(false, true);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={styles.container}
      scrollEventThrottle={400}
      onScroll={handleScroll}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleManualRefresh}
          tintColor={theme.text}
        />
      }
    >
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast((t) => ({ ...t, visible: false }))}
      />

      <View style={styles.header}>
        <View>
          <GeistText weight="bold" style={{ fontSize: 28 }}>
            Projects
          </GeistText>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          {/* <TouchableOpacity
            style={[
              styles.refreshButton,
              {
                borderColor: theme.border,
                backgroundColor: theme.surface,
              },
            ]}
            onPress={handleManualRefresh}
            activeOpacity={0.7}
            disabled={loading || refreshing}
          >
            {refreshing ? (
              <ActivityIndicator size="small" color={theme.text} />
            ) : (
              <RefreshCw size={16} color={theme.text} />
            )}
          </TouchableOpacity> */}

          <GeistButton
            title="Add New"
            prefix={<Plus size={16} color={theme.background} />}
            onPress={() => router.push("/deploy")}
            style={{
              backgroundColor: theme.text,
            }}
            textStyle={{
              color: theme.background,
            }}
          />
        </View>
      </View>

      {error ? (
        <View
          style={{
            padding: 24,
            backgroundColor: theme.surface,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          <GeistText style={{ color: theme.error }}>{error}</GeistText>
        </View>
      ) : loading ? (
        <View style={{ padding: 40, alignItems: "center" }}>
          <ActivityIndicator size="large" color={theme.text} />
        </View>
      ) : projects.length === 0 ? (
        <View style={{ padding: 40, alignItems: "center" }}>
          <GeistText secondary>No projects found.</GeistText>
        </View>
      ) : (
        <View style={styles.projectList}>
          {projects.map((project: any) => (
            <GeistCard
              key={project.id || project.name}
              style={styles.card}
              onPress={() =>
                router.push(`/project/${project.id || project.name}`)
              }
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  {/* <Folder size={20} color={theme.textSecondary} style={{ marginRight: 8 }} /> */}
                  <GeistText weight="bold" style={{ fontSize: 18 }}>
                    {project.name}
                  </GeistText>
                </View>
                <StatusBadge status={getStatus(project) as any} />
              </View>
              <GeistText secondary style={styles.description} numberOfLines={2}>
                {project.framework
                  ? `Framework: ${project.framework}`
                  : "Vercel Project"}
              </GeistText>
              <View style={styles.cardFooter}>
                <View style={styles.footerInfo}>
                  <GitCommit
                    size={16}
                    color={theme.textSecondary}
                    style={{ marginRight: 6 }}
                  />
                  <GeistText secondary mono style={{ fontSize: 13 }}>
                    {project.targets?.production?.meta?.githubCommitRef ||
                      "main"}
                  </GeistText>
                  <GeistText secondary style={{ marginHorizontal: 6 }}>
                    ·
                  </GeistText>
                  <GeistText secondary mono style={{ fontSize: 13 }}>
                    {project.updatedAt
                      ? new Date(project.updatedAt).toLocaleDateString()
                      : "Just now"}
                  </GeistText>
                </View>
              </View>
            </GeistCard>
          ))}
        </View>
      )}

      {loadingMore && (
        <View style={{ padding: 20, alignItems: "center" }}>
          <ActivityIndicator size="small" color={theme.text} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    maxWidth: 1200,
    width: "100%",
    alignSelf: "center",
    paddingBottom: 48,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  projectList: {
    gap: 16,
    flexDirection: Platform.OS === "web" ? "row" : "column",
    flexWrap: "wrap",
  },
  card: {
    padding: 24,
    maxWidth: "100%",
    flex: Platform.OS === "web" ? 1 : undefined,
    minWidth: Platform.OS === "web" ? 300 : "100%",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  description: {
    marginBottom: 24,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
});
