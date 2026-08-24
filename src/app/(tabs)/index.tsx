import React, { useState, useEffect, useCallback, useRef, memo } from "react";
import { getCachedVercelToken } from '../../lib/vercel-token';
import {
  View,
  StyleSheet,
  Platform,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from "react-native-svg";
import {
  siGithub,
  siVercel,
  siNextdotjs,
  siVite,
  siReact,
  siVuedotjs,
  siSvelte,
  siAstro,
  siNuxt,
  siRemix,
  siGatsby,
  siAngular,
  siExpo,
  siHugo,
  siDocusaurus,
  siSolid,
  siQwik,
  siEleventy,
  siRedwoodjs,
  siNodedotjs,
  siPython,
} from "simple-icons";
import { ChevronsUpDown, Plus, Sparkles } from "lucide-react-native";
import {
  GeistText,
  GeistCard,
  useTheme,
  GeistButton,
  GeistSpinner,
} from "../../components/GeistUI";
import { Toast, ToastType } from "../../components/Toast";
import { vercel } from "../../api/vercel";
import { useUserContext } from "../../context/UserContext";

const ZapIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Defs>
      <LinearGradient
        id="zapGrad"
        x1="2"
        y1="2"
        x2="22"
        y2="22"
        gradientUnits="userSpaceOnUse"
      >
        <Stop offset="0" stopColor="#C084FC" />
        <Stop offset="0.5" stopColor="#A855F7" />
        <Stop offset="1" stopColor="#7E22CE" />
      </LinearGradient>
    </Defs>
    <Path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="url(#zapGrad)" />
  </Svg>
);

const FrameworkIcon = memo(({
  framework,
  themeText,
}: {
  framework?: string;
  themeText: string;
}) => {
  const fw = (framework || "").toLowerCase().trim();

  if (fw === "nextjs" || fw === "next") {
    return (
      <Svg width="24" height="24" viewBox="0 0 24 24" fill={themeText}>
        <Path d={siNextdotjs.path} />
      </Svg>
    );
  }

  if (fw === "vite") {
    return <ZapIcon />;
  }

  if (
    fw === "react" ||
    fw === "create-react-app" ||
    fw === "cra" ||
    fw === "react-router"
  ) {
    return (
      <Svg width="24" height="24" viewBox="0 0 24 24" fill="#61DAFB">
        <Path d={siReact.path} />
      </Svg>
    );
  }

  if (fw === "astro") {
    return (
      <Svg width="24" height="24" viewBox="0 0 24 24" fill="#FF5D01">
        <Path d={siAstro.path} />
      </Svg>
    );
  }

  if (fw === "vue" || fw === "vuepress" || fw === "vitepress") {
    return (
      <Svg width="24" height="24" viewBox="0 0 24 24" fill="#42B883">
        <Path d={siVuedotjs.path} />
      </Svg>
    );
  }

  if (fw === "nuxt" || fw === "nuxtjs" || fw === "nuxt3") {
    return (
      <Svg width="24" height="24" viewBox="0 0 24 24" fill="#00DC82">
        <Path d={siNuxt.path} />
      </Svg>
    );
  }

  if (fw === "svelte" || fw === "sveltekit" || fw.includes("svelte")) {
    return (
      <Svg width="24" height="24" viewBox="0 0 24 24" fill="#FF3E00">
        <Path d={siSvelte.path} />
      </Svg>
    );
  }

  if (fw === "remix") {
    return (
      <Svg width="24" height="24" viewBox="0 0 24 24" fill={themeText}>
        <Path d={siRemix.path} />
      </Svg>
    );
  }

  if (fw === "gatsby") {
    return (
      <Svg width="24" height="24" viewBox="0 0 24 24" fill="#663399">
        <Path d={siGatsby.path} />
      </Svg>
    );
  }

  if (fw === "angular") {
    return (
      <Svg width="24" height="24" viewBox="0 0 24 24" fill="#DD0031">
        <Path d={siAngular.path} />
      </Svg>
    );
  }

  if (fw === "expo") {
    return (
      <Svg width="24" height="24" viewBox="0 0 24 24" fill={themeText}>
        <Path d={siExpo.path} />
      </Svg>
    );
  }

  if (fw === "hugo") {
    return (
      <Svg width="24" height="24" viewBox="0 0 24 24" fill="#FF4088">
        <Path d={siHugo.path} />
      </Svg>
    );
  }

  if (fw.includes("docusaurus")) {
    return (
      <Svg width="24" height="24" viewBox="0 0 24 24" fill="#3ECC5F">
        <Path d={siDocusaurus.path} />
      </Svg>
    );
  }

  if (fw.includes("solid")) {
    return (
      <Svg width="24" height="24" viewBox="0 0 24 24" fill="#2C4F7C">
        <Path d={siSolid.path} />
      </Svg>
    );
  }

  if (fw.includes("qwik")) {
    return (
      <Svg width="24" height="24" viewBox="0 0 24 24" fill="#006CE0">
        <Path d={siQwik.path} />
      </Svg>
    );
  }

  if (fw.includes("eleventy") || fw === "11ty") {
    return (
      <Svg width="24" height="24" viewBox="0 0 24 24" fill={themeText}>
        <Path d={siEleventy.path} />
      </Svg>
    );
  }

  if (fw.includes("redwood")) {
    return (
      <Svg width="24" height="24" viewBox="0 0 24 24" fill="#BF4722">
        <Path d={siRedwoodjs.path} />
      </Svg>
    );
  }

  if (fw === "node" || fw === "nodejs") {
    return (
      <Svg width="24" height="24" viewBox="0 0 24 24" fill="#5FA04E">
        <Path d={siNodedotjs.path} />
      </Svg>
    );
  }

  if (fw === "python" || fw === "flask" || fw === "django" || fw === "fastapi") {
    return (
      <Svg width="24" height="24" viewBox="0 0 24 24" fill="#3776AB">
        <Path d={siPython.path} />
      </Svg>
    );
  }

  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill={themeText}>
      <Path d={siVercel.path} />
    </Svg>
  );
});

const GitCommitNode = memo(({ color }: { color: string }) => (
  <Svg width="18" height="14" viewBox="0 0 18 14" fill="none">
    <Path d="M0 7H5" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
    <Circle cx="9" cy="7" r="3.25" stroke={color} strokeWidth="1.75" />
    <Path d="M13 7H18" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
  </Svg>
));

const GithubIcon = memo(({ color }: { color: string }) => (
  <Svg width="14" height="14" viewBox="0 0 24 24" fill={color}>
    <Path d={siGithub.path} />
  </Svg>
));

const getTimeAgo = (timestamp?: number | string) => {
  if (!timestamp) return "just now";
  const time =
    typeof timestamp === "string" ? new Date(timestamp).getTime() : timestamp;
  if (isNaN(time) || time <= 0) return "just now";
  const diffMs = Date.now() - time;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
};

const getDomain = (proj: any) => {
  const latestDep = proj.latestDeployments?.[0];
  const prodTarget = proj.targets?.production;

  const rawDomain =
    (Array.isArray(latestDep?.alias) && latestDep.alias[0]) ||
    (typeof latestDep?.alias === "string" && latestDep.alias) ||
    (Array.isArray(prodTarget?.alias) && prodTarget.alias[0]) ||
    (Array.isArray(proj.alias) && proj.alias[0]?.domain) ||
    latestDep?.url ||
    prodTarget?.url;

  if (rawDomain) {
    return String(rawDomain).replace(/^https?:\/\//, "").replace(/\/$/, "");
  }
  return `${proj.name}.vercel.app`;
};

const getCommitMessage = (proj: any) => {
  const latestDep = proj.latestDeployments?.[0];
  const prodTarget = proj.targets?.production;

  const msg =
    latestDep?.meta?.githubCommitMessage ||
    prodTarget?.meta?.githubCommitMessage ||
    latestDep?.meta?.gitlabCommitMessage ||
    latestDep?.meta?.commitMessage ||
    prodTarget?.meta?.commitMessage;

  if (msg && typeof msg === "string") {
    return msg.trim();
  }
  return "Initial commit";
};

const getRepoPath = (proj: any) => {
  const latestDep = proj.latestDeployments?.[0];
  const prodTarget = proj.targets?.production;
  const link = proj.link;

  if (link?.org && link?.repo) {
    return `${link.org}/${link.repo}`;
  }
  if (link?.repo) {
    return link.repo;
  }
  if (latestDep?.meta?.githubOrg && latestDep?.meta?.githubRepo) {
    return `${latestDep.meta.githubOrg}/${latestDep.meta.githubRepo}`;
  }
  if (prodTarget?.meta?.githubOrg && prodTarget?.meta?.githubRepo) {
    return `${prodTarget.meta.githubOrg}/${prodTarget.meta.githubRepo}`;
  }
  if (latestDep?.meta?.githubRepo) {
    return latestDep.meta.githubRepo;
  }
  if (latestDep?.meta?.githubCommitRef) {
    return `${proj.name} (${latestDep.meta.githubCommitRef})`;
  }
  return proj.name;
};

const getProjectTimestamp = (proj: any) => {
  const latestDep = proj.latestDeployments?.[0];
  const prodTarget = proj.targets?.production;
  return (
    latestDep?.createdAt ||
    prodTarget?.createdAt ||
    proj.updatedAt ||
    proj.createdAt
  );
};

// Memoized Project Item Card
const ProjectCard = memo(({
  project,
  theme,
  onPress,
}: {
  project: any;
  theme: any;
  onPress: () => void;
}) => {
  const domain = getDomain(project);
  const commitMsg = getCommitMessage(project);
  const repoPath = getRepoPath(project);
  const timeAgo = getTimeAgo(getProjectTimestamp(project));

  return (
    <View style={styles.cardWrapper}>
      <GeistCard style={styles.card} onPress={onPress}>
        {/* Top Row: Icon + Name/Domain (Left) and Chevrons (Right) */}
        <View style={styles.cardTopRow}>
          <View style={styles.cardTopLeft}>
            <FrameworkIcon
              framework={project.framework}
              themeText={theme.text}
            />
            <View style={styles.projectInfoCol}>
              <GeistText weight="bold" style={styles.projectName} numberOfLines={1}>
                {project.name}
              </GeistText>
              <GeistText secondary style={styles.projectDomain} numberOfLines={1}>
                {domain}
              </GeistText>
            </View>
          </View>

          <View style={styles.cardTopRight}>
            <ChevronsUpDown size={14} color={theme.textSecondary} />
          </View>
        </View>

        {/* Middle Row: -o- Commit Node Icon + Commit Message */}
        <View style={styles.cardMiddleRow}>
          <GitCommitNode color={theme.text} />
          <GeistText weight="600" style={styles.commitMessage} numberOfLines={1}>
            {commitMsg}
          </GeistText>
        </View>

        {/* Bottom Row: GitHub Icon + Repo Path · Time */}
        <View style={styles.cardBottomRow}>
          <GithubIcon color={theme.textSecondary} />
          <GeistText secondary style={styles.repoMetaText} numberOfLines={1}>
            {repoPath} · {timeAgo}
          </GeistText>
        </View>
      </GeistCard>
    </View>
  );
});

export default function ProjectsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { activeScope } = useUserContext();

  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState("");

  const paginationNextRef = useRef<number | null>(null);
  const isFetchingRef = useRef(false);

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
      // Guard against concurrent fetches
      if (isFetchingRef.current) return;
      if (loadMore && (!hasMore || !paginationNextRef.current)) return;

      isFetchingRef.current = true;
      if (loadMore) {
        setLoadingMore(true);
      } else {
        if (isPullToRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setHasMore(true);
        paginationNextRef.current = null;
      }
      setError("");

      const token = getCachedVercelToken();
      if (!token) {
        setError("No Vercel token found. Please sign in with Vercel.");
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
        isFetchingRef.current = false;
        return;
      }

      try {
        const teamId =
          activeScope?.type === "team" ? activeScope.id : undefined;

        const from =
          loadMore && paginationNextRef.current
            ? String(paginationNextRef.current)
            : undefined;

        // Fetch with a generous limit (15) to fill screen and enable silky smooth scrolling
        const result = await vercel.projects.getProjects({
          limit: "15",
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
            const existingIds = new Set(prev.map((p) => p.id || p.name));
            const uniqueList = list.filter((p: any) => !existingIds.has(p.id || p.name));
            return [...prev, ...uniqueList];
          });
        } else {
          setProjects(list);
        }

        // Determine if more items are available
        if (
          !newPagination?.next ||
          list.length === 0 ||
          (loadMore && paginationNextRef.current === newPagination?.next)
        ) {
          setHasMore(false);
          paginationNextRef.current = null;
        } else {
          setHasMore(true);
          paginationNextRef.current = newPagination.next;
        }

        if (isPullToRefresh) {
          showToast("Projects refreshed", "success");
        }
      } catch (err: any) {
        console.error("Error fetching projects:", err);
        setError(err.message || "Failed to fetch projects");
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
        isFetchingRef.current = false;
      }
    },
    [activeScope, hasMore],
  );

  useEffect(() => {
    let isMounted = true;

    async function load() {
      if (isMounted) {
        await fetchProjects(false, false);
      }
    }
    load();

    return () => {
      isMounted = false;
    };
  }, [activeScope]);

  const handleManualRefresh = useCallback(() => {
    fetchProjects(true, false);
  }, [fetchProjects]);

  const handleEndReached = useCallback(() => {
    if (!loading && !loadingMore && hasMore && paginationNextRef.current && !isFetchingRef.current) {
      fetchProjects(false, true);
    }
  }, [loading, loadingMore, hasMore, fetchProjects]);

  // Render Header Component for FlashList
  const renderHeader = useCallback(() => (
    <View style={styles.header}>
      <View>
        <GeistText weight="bold" style={{ fontSize: 28, letterSpacing: -0.5 }}>
          Projects
        </GeistText>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
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
  ), [theme, router]);

  // Render Footer with subtle preloader
  const renderFooter = useCallback(() => {
    if (!loadingMore) return <View style={{ height: 32 }} />;
    return (
      <View style={styles.footerLoader}>
        <GeistSpinner size={20} color={theme.text} />
      </View>
    );
  }, [loadingMore, theme.text]);

  // Render Empty Component
  const renderEmpty = useCallback(() => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <GeistText secondary style={{ fontSize: 14 }}>
          {error ? error : "No projects found."}
        </GeistText>
      </View>
    );
  }, [loading, error]);

  // Render Project Item
  const renderProjectItem = useCallback(
    ({ item }: { item: any }) => (
      <ProjectCard
        project={item}
        theme={theme}
        onPress={() => router.push(`/project/${item.id || item.name}`)}
      />
    ),
    [theme, router],
  );

  return (
    <View style={[styles.rootContainer, { backgroundColor: theme.background }]}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast((t) => ({ ...t, visible: false }))}
      />

      {loading && !refreshing && projects.length === 0 ? (
        <View style={styles.centerLoading}>
          <GeistSpinner size={28} color={theme.text} />
        </View>
      ) : (
        <FlashList
          data={projects}
          renderItem={renderProjectItem}
          keyExtractor={(item) => item.id || item.name}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.6} // Pre-fetches in advance before reaching bottom
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleManualRefresh}
              tintColor={theme.text}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxWidth: 1100,
    width: "100%",
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  cardWrapper: {
    marginBottom: 14,
    width: "100%",
  },
  card: {
    padding: 16,
    borderRadius: 12,
    width: "100%",
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTopLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
    gap: 12,
  },
  projectInfoCol: {
    flex: 1,
    justifyContent: "center",
  },
  projectName: {
    fontSize: 16,
    lineHeight: 20,
  },
  projectDomain: {
    fontSize: 13,
    marginTop: 2,
    lineHeight: 16,
  },
  cardTopRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardMiddleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  commitMessage: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  cardBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  repoMetaText: {
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  centerLoading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});
