import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ScrollView,
  View,
  TouchableOpacity,
  RefreshControl,
  Platform,
  TextInput,
} from "react-native";
import Svg, {
  Rect,
  Text as SvgText,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
  Line,
  Path,
} from "react-native-svg";
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
} from "../../constants/framework-icons";
import {
  BarChart3,
  TrendingUp,
  Globe,
  Eye,
  Users,
  MousePointerClick,
  Smartphone,
  Laptop,
  Monitor,
  Compass,
  ChevronLeft,
  ChevronDown,
  Check,
  Search,
  Activity,
  Layers,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
} from "lucide-react-native";
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
import { styles } from "../../styles/(tabs)/analytics.styles";

type TimeRange = "24h" | "7d" | "30d" | "90d";
type DimensionTab = "pages" | "referrers" | "countries" | "devices" | "events";

interface ProjectItem {
  id: string;
  name: string;
  framework?: string;
  updatedAt?: number;
}

interface PageviewCountData {
  visitors: number;
  pageviews: number;
}

interface CustomEventCountData {
  visitors: number;
  count: number;
}

interface TimeSeriesPoint {
  date: string;
  label: string;
  pageviews: number;
  visitors: number;
}

interface BreakdownItem {
  key: string;
  label: string;
  pageviews: number;
  visitors: number;
  percentage: number;
}

const ZapIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <Defs>
      <SvgGradient
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
      </SvgGradient>
    </Defs>
    <Path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="url(#zapGrad)" />
  </Svg>
);

const FrameworkIcon = ({
  framework,
  themeText,
}: {
  framework?: string;
  themeText: string;
}) => {
  const fw = (framework || "").toLowerCase().trim();

  if (fw === "nextjs" || fw === "next") {
    return (
      <Svg width="18" height="18" viewBox="0 0 24 24" fill={themeText}>
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
      <Svg width="18" height="18" viewBox="0 0 24 24" fill="#61DAFB">
        <Path d={siReact.path} />
      </Svg>
    );
  }

  if (fw === "astro") {
    return (
      <Svg width="18" height="18" viewBox="0 0 24 24" fill="#FF5D01">
        <Path d={siAstro.path} />
      </Svg>
    );
  }

  if (fw === "vue" || fw === "vuepress" || fw === "vitepress") {
    return (
      <Svg width="18" height="18" viewBox="0 0 24 24" fill="#42B883">
        <Path d={siVuedotjs.path} />
      </Svg>
    );
  }

  if (fw === "nuxt" || fw === "nuxtjs" || fw === "nuxt3") {
    return (
      <Svg width="18" height="18" viewBox="0 0 24 24" fill="#00DC82">
        <Path d={siNuxt.path} />
      </Svg>
    );
  }

  if (fw === "svelte" || fw === "sveltekit" || fw.includes("svelte")) {
    return (
      <Svg width="18" height="18" viewBox="0 0 24 24" fill="#FF3E00">
        <Path d={siSvelte.path} />
      </Svg>
    );
  }

  if (fw === "remix") {
    return (
      <Svg width="18" height="18" viewBox="0 0 24 24" fill={themeText}>
        <Path d={siRemix.path} />
      </Svg>
    );
  }

  if (fw === "angular") {
    return (
      <Svg width="18" height="18" viewBox="0 0 24 24" fill="#DD0031">
        <Path d={siAngular.path} />
      </Svg>
    );
  }

  if (fw === "expo") {
    return (
      <Svg width="18" height="18" viewBox="0 0 24 24" fill={themeText}>
        <Path d={siExpo.path} />
      </Svg>
    );
  }

  if (fw.includes("node") || fw === "express") {
    return (
      <Svg width="18" height="18" viewBox="0 0 24 24" fill="#5FA04E">
        <Path d={siNodedotjs.path} />
      </Svg>
    );
  }

  if (fw.includes("python") || fw === "flask" || fw === "django") {
    return (
      <Svg width="18" height="18" viewBox="0 0 24 24" fill="#3776AB">
        <Path d={siPython.path} />
      </Svg>
    );
  }

  // Default Vercel triangle icon
  return (
    <Svg width="18" height="18" viewBox="0 0 24 24" fill={themeText}>
      <Path d={siVercel.path} />
    </Svg>
  );
};

const COUNTRY_NAMES: Record<string, { name: string; flag: string }> = {
  US: { name: "United States", flag: "🇺🇸" },
  IN: { name: "India", flag: "🇮🇳" },
  GB: { name: "United Kingdom", flag: "🇬🇧" },
  DE: { name: "Germany", flag: "🇩🇪" },
  CA: { name: "Canada", flag: "🇨🇦" },
  FR: { name: "France", flag: "🇫🇷" },
  JP: { name: "Japan", flag: "🇯🇵" },
  AU: { name: "Australia", flag: "🇦🇺" },
  BR: { name: "Brazil", flag: "🇧🇷" },
  NL: { name: "Netherlands", flag: "🇳🇱" },
  SG: { name: "Singapore", flag: "🇸🇬" },
  SE: { name: "Sweden", flag: "🇸🇪" },
  CH: { name: "Switzerland", flag: "🇨🇭" },
  ES: { name: "Spain", flag: "🇪🇸" },
  IT: { name: "Italy", flag: "🇮🇹" },
  KR: { name: "South Korea", flag: "🇰🇷" },
  ID: { name: "Indonesia", flag: "🇮🇩" },
  AE: { name: "United Arab Emirates", flag: "🇦🇪" },
  CN: { name: "China", flag: "🇨🇳" },
  RU: { name: "Russia", flag: "🇷🇺" },
};

function getCountryDisplay(code: string): { name: string; flag: string } {
  if (!code || code === "Others" || code === "Unknown") {
    return { name: "Other / Direct", flag: "🌐" };
  }
  const upper = code.toUpperCase();
  if (COUNTRY_NAMES[upper]) return COUNTRY_NAMES[upper];
  return { name: upper, flag: "🌍" };
}

export default function AnalyticsScreen() {
  const theme = useTheme();
  const { activeScope } = useUserContext();

  // State: selectedProjectId is null by default so user sees project list
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectSearch, setProjectSearch] = useState("");

  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [metricView, setMetricView] = useState<"pageviews" | "visitors">("pageviews");
  const [activeTab, setActiveTab] = useState<DimensionTab>("pages");

  // Loading & Error States
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isNotEnabled, setIsNotEnabled] = useState(false);

  // Analytics Data
  const [pageviewCounts, setPageviewCounts] = useState<PageviewCountData | null>(null);
  const [customEventCounts, setCustomEventCounts] = useState<CustomEventCountData | null>(null);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesPoint[]>([]);
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);

  // Breakdown Data
  const [topPages, setTopPages] = useState<BreakdownItem[]>([]);
  const [topReferrers, setTopReferrers] = useState<BreakdownItem[]>([]);
  const [topCountries, setTopCountries] = useState<BreakdownItem[]>([]);
  const [topDevices, setTopDevices] = useState<BreakdownItem[]>([]);
  const [topEvents, setTopEvents] = useState<BreakdownItem[]>([]);

  // Toast
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

  const selectedProject = useMemo(() => {
    return projects.find((p) => p.id === selectedProjectId) || null;
  }, [projects, selectedProjectId]);

  // Fetch Projects on Mount or Scope Change
  const fetchProjects = useCallback(async () => {
    setLoadingProjects(true);
    const teamId = activeScope?.type === "team" ? activeScope.id : undefined;

    try {
      const projsResult = await vercel.projects.getProjects({
        limit: "100",
        teamId,
      });

      const list: any[] =
        (projsResult as any)?.projects ||
        (projsResult as any)?.object?.projects ||
        projsResult ||
        [];

      const mapped: ProjectItem[] = list.map((p) => ({
        id: p.id || p.projectId || p.name,
        name: p.name,
        framework: p.framework,
        updatedAt: p.updatedAt,
      }));

      setProjects(mapped);
    } catch (err: any) {
      console.error("Error fetching projects for analytics:", err);
      showToast("Failed to load projects", "error");
    } finally {
      setLoadingProjects(false);
    }
  }, [activeScope]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Fetch Web Analytics Data for Selected Project
  const fetchAnalyticsData = useCallback(
    async (isPull = false) => {
      if (!selectedProjectId) return;

      if (isPull) {
        setRefreshing(true);
      } else {
        setLoadingAnalytics(true);
      }

      setIsNotEnabled(false);

      const teamId = activeScope?.type === "team" ? activeScope.id : undefined;

      const daysBack =
        timeRange === "24h" ? 1 : timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
      const granularity = timeRange === "24h" ? "hour" : "day";
      const since = Date.now() - daysBack * 24 * 60 * 60 * 1000;
      const until = Date.now();

      try {
        // 1. Fetch Counts
        const [pvCountRes, eventCountRes] = await Promise.allSettled([
          vercel.webAnalytics.countPageviews({
            projectId: selectedProjectId,
            since,
            until,
            teamId,
          }),
          vercel.webAnalytics.countEvents({
            projectId: selectedProjectId,
            since,
            until,
            teamId,
          }),
        ]);

        if (pvCountRes.status === "rejected") {
          const errMsg = pvCountRes.reason?.message || String(pvCountRes.reason);
          if (errMsg.includes("web_analytics_not_enabled")) {
            setIsNotEnabled(true);
            setLoadingAnalytics(false);
            setRefreshing(false);
            return;
          }
          throw pvCountRes.reason;
        }

        const pvData = (pvCountRes.value as any)?.data || pvCountRes.value || { visitors: 0, pageviews: 0 };
        setPageviewCounts({
          visitors: Number(pvData.visitors || 0),
          pageviews: Number(pvData.pageviews || 0),
        });

        if (eventCountRes.status === "fulfilled") {
          const evData = (eventCountRes.value as any)?.data || eventCountRes.value || { visitors: 0, count: 0 };
          setCustomEventCounts({
            visitors: Number(evData.visitors || 0),
            count: Number(evData.count || 0),
          });
        } else {
          setCustomEventCounts(null);
        }

        // 2. Fetch Time Series Aggregates
        const timeSeriesRes = await vercel.webAnalytics.aggregatePageviews({
          projectId: selectedProjectId,
          by: [granularity],
          since,
          until,
          teamId,
        });

        const rawTimeSeriesList: any[] = (timeSeriesRes as any)?.data || [];
        const parsedTimeSeries: TimeSeriesPoint[] = rawTimeSeriesList.map((pt) => {
          const d = new Date(pt.timestamp || pt.date);
          const label =
            timeRange === "24h"
              ? d.toLocaleTimeString([], { hour: "numeric", hour12: true })
              : d.toLocaleDateString([], { month: "short", day: "numeric" });

          const pv = Number(pt.pageviews ?? pt.additionalProperties?.pageviews ?? 0);
          const vis = Number(pt.visitors ?? pt.additionalProperties?.visitors ?? 0);

          return {
            date: pt.timestamp || pt.date,
            label,
            pageviews: pv,
            visitors: vis,
          };
        });

        setTimeSeries(parsedTimeSeries);
        setSelectedPointIndex(null);

        // 3. Fetch Dimension Breakdowns
        const [pagesRes, refRes, countryRes, deviceRes, eventsRes] = await Promise.allSettled([
          vercel.webAnalytics.aggregatePageviews({
            projectId: selectedProjectId,
            by: ["requestPath"],
            since,
            until,
            limit: 6,
            teamId,
          }),
          vercel.webAnalytics.aggregatePageviews({
            projectId: selectedProjectId,
            by: ["referrerHostname"],
            since,
            until,
            limit: 6,
            teamId,
          }),
          vercel.webAnalytics.aggregatePageviews({
            projectId: selectedProjectId,
            by: ["country"],
            since,
            until,
            limit: 6,
            teamId,
          }),
          vercel.webAnalytics.aggregatePageviews({
            projectId: selectedProjectId,
            by: ["deviceType"],
            since,
            until,
            limit: 6,
            teamId,
          }),
          vercel.webAnalytics.aggregateEvents({
            projectId: selectedProjectId,
            by: ["eventName"],
            since,
            until,
            limit: 6,
            teamId,
          }),
        ]);

        const totalPvs = Number(pvData.pageviews || 0);

        const parseBreakdown = (res: PromiseSettledResult<any>, keyField: string): BreakdownItem[] => {
          if (res.status !== "fulfilled") return [];
          const list: any[] = (res.value as any)?.data || [];
          return list.map((item) => {
            const rawKey = String(item[keyField] || "Direct / Unknown");
            const pv = Number(
              item.pageviews ??
                item.additionalProperties?.pageviews ??
                item.count ??
                item.additionalProperties?.count ??
                0,
            );
            const vis = Number(item.visitors ?? item.additionalProperties?.visitors ?? 0);
            const pct = totalPvs > 0 ? Math.min(100, Math.round((pv / totalPvs) * 100)) : 0;

            return {
              key: rawKey,
              label: rawKey,
              pageviews: pv,
              visitors: vis,
              percentage: pct,
            };
          });
        };

        setTopPages(parseBreakdown(pagesRes, "requestPath"));
        setTopReferrers(parseBreakdown(refRes, "referrerHostname"));
        setTopCountries(parseBreakdown(countryRes, "country"));
        setTopDevices(parseBreakdown(deviceRes, "deviceType"));
        setTopEvents(parseBreakdown(eventsRes, "eventName"));

        if (isPull) {
          showToast("Web Analytics updated", "success");
        }
      } catch (err: any) {
        console.error("Error fetching web analytics:", err);
        const msg = err.message || "Failed to load Web Analytics data";
        if (msg.includes("web_analytics_not_enabled")) {
          setIsNotEnabled(true);
        } else {
          showToast("Error loading analytics", "error");
        }
      } finally {
        setLoadingAnalytics(false);
        setRefreshing(false);
      }
    },
    [selectedProjectId, timeRange, activeScope],
  );

  useEffect(() => {
    if (selectedProjectId) {
      fetchAnalyticsData(false);
    }
  }, [selectedProjectId, timeRange, fetchAnalyticsData]);

  // Filtered Projects for List
  const filteredProjects = useMemo(() => {
    if (!projectSearch.trim()) return projects;
    return projects.filter((p) =>
      p.name.toLowerCase().includes(projectSearch.toLowerCase().trim()),
    );
  }, [projects, projectSearch]);

  // Chart Calculations
  const maxChartValue = useMemo(() => {
    if (!timeSeries || timeSeries.length === 0) return 10;
    const values = timeSeries.map((pt) =>
      metricView === "pageviews" ? pt.pageviews : pt.visitors,
    );
    const max = Math.max(...values, 5);
    return Math.ceil(max * 1.25);
  }, [timeSeries, metricView]);

  const selectedPoint = useMemo(() => {
    if (selectedPointIndex !== null && timeSeries[selectedPointIndex]) {
      return timeSeries[selectedPointIndex];
    }
    return timeSeries[timeSeries.length - 1] || null;
  }, [selectedPointIndex, timeSeries]);

  const viewsPerVisitor = useMemo(() => {
    if (!pageviewCounts || pageviewCounts.visitors === 0) return "0.0";
    return (pageviewCounts.pageviews / pageviewCounts.visitors).toFixed(1);
  }, [pageviewCounts]);

  // ==========================================
  // VIEW 1: PROJECT SELECTION SCREEN (Exact Mockup Match)
  // ==========================================
  if (!selectedProjectId) {
    return (
      <View style={[styles.staticPageContainer, { backgroundColor: theme.background }]}>
        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast((t) => ({ ...t, visible: false }))}
        />

        <View style={styles.projectPickerWrapper}>
          {/* Top Analytics Box Icon */}
          <View
            style={[
              styles.topIconBox,
              {
                borderColor: theme.border,
                backgroundColor: theme.surface,
              },
            ]}
          >
            <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2">
              <Path d="M3 3v18h18" />
              <Path d="m19 9-5 5-4-4-3 3" />
            </Svg>
          </View>

          {/* Title and Subtitle */}
          <GeistText weight="bold" style={styles.mainTitle}>
            Continue to Analytics
          </GeistText>
          <GeistText secondary style={styles.mainSubtitle}>
            Choose a project to continue
          </GeistText>

          {/* Static Find Project Search Input */}
          <View
            style={[
              styles.searchBarWrapper,
              {
                borderColor: theme.border,
                backgroundColor: theme.card,
              },
            ]}
          >
            <TextInput
              placeholder="Find Project..."
              placeholderTextColor={theme.textSecondary}
              value={projectSearch}
              onChangeText={setProjectSearch}
              style={[styles.searchBarInput, { color: theme.text }]}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Scrollable Projects List with Bottom Fade Overlay */}
          <View style={styles.scrollListContainer}>
            {loadingProjects ? (
              <View style={{ paddingVertical: 40, alignItems: "center" }}>
                <GeistSpinner size={20} color={theme.text} />
                <GeistText secondary style={{ marginTop: 12, fontSize: 13 }}>
                  Loading projects...
                </GeistText>
              </View>
            ) : (
              <ScrollView
                style={styles.projectsScrollView}
                contentContainerStyle={styles.scrollContentList}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={async () => {
                      setRefreshing(true);
                      await fetchProjects();
                      setRefreshing(false);
                    }}
                    tintColor={theme.text}
                  />
                }
              >
                {filteredProjects.length === 0 ? (
                  <View style={{ paddingVertical: 32, alignItems: "center" }}>
                    <GeistText secondary style={{ fontSize: 13 }}>
                      No matching projects found.
                    </GeistText>
                  </View>
                ) : (
                  filteredProjects.map((p, idx) => {
                    const isFirst = idx === 0;
                    return (
                      <TouchableOpacity
                        key={p.id}
                        style={[
                          styles.projectRowItem,
                          isFirst && {
                            backgroundColor: theme.surface,
                          },
                        ]}
                        onPress={() => setSelectedProjectId(p.id)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.projectRowIcon}>
                          <FrameworkIcon framework={p.framework} themeText={theme.text} />
                        </View>
                        <GeistText weight="500" style={styles.projectRowName}>
                          {p.name}
                        </GeistText>
                      </TouchableOpacity>
                    );
                  })
                )}
              </ScrollView>
            )}

            {/* Bottom Gradient Fade Overlay */}
            <View style={styles.bottomFadeOverlay} pointerEvents="none">
              <Svg width="100%" height="100%" preserveAspectRatio="none">
                <Defs>
                  <SvgGradient id="bottomFadeGrad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor={theme.background} stopOpacity="0" />
                    <Stop offset="0.25" stopColor={theme.background} stopOpacity="0.2" />
                    <Stop offset="0.55" stopColor={theme.background} stopOpacity="0.65" />
                    <Stop offset="0.8" stopColor={theme.background} stopOpacity="0.9" />
                    <Stop offset="1" stopColor={theme.background} stopOpacity="1" />
                  </SvgGradient>
                </Defs>
                <Rect x="0" y="0" width="100%" height="100%" fill="url(#bottomFadeGrad)" />
              </Svg>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // ==========================================
  // VIEW 2: FULL ANALYTICS DASHBOARD FOR SELECTED PROJECT
  // ==========================================
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetchAnalyticsData(true)}
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

      {/* Top Header with Back Navigation & Project Selector */}
      <View style={styles.dashboardHeader}>
        <TouchableOpacity
          style={[
            styles.backToProjectsBtn,
            { borderColor: theme.border, backgroundColor: theme.surface },
          ]}
          onPress={() => setSelectedProjectId(null)}
          activeOpacity={0.7}
        >
          <ChevronLeft size={16} color={theme.text} />
          <GeistText weight="600" style={{ fontSize: 13, marginLeft: 2 }}>
            Projects
          </GeistText>
        </TouchableOpacity>

        <View style={styles.projectTitleRow}>
          <View style={styles.headerIconWrap}>
            <FrameworkIcon framework={selectedProject?.framework} themeText={theme.text} />
          </View>
          <View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <GeistText weight="bold" style={{ fontSize: 20 }}>
                {selectedProject?.name}
              </GeistText>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <GeistText style={styles.liveText}>Live</GeistText>
              </View>
            </View>
            <GeistText secondary style={{ fontSize: 12 }}>
              Web Analytics & Visitor Performance
            </GeistText>
          </View>
        </View>

        {/* Change Project Quick Button */}
        <TouchableOpacity
          style={[
            styles.switchProjectPill,
            { borderColor: theme.border, backgroundColor: theme.surface },
          ]}
          onPress={() => setSelectedProjectId(null)}
          activeOpacity={0.7}
        >
          <Layers size={13} color={theme.textSecondary} style={{ marginRight: 5 }} />
          <GeistText secondary style={{ fontSize: 12, fontWeight: "500" }}>
            Change
          </GeistText>
        </TouchableOpacity>
      </View>

      {/* Time Range and Metric Controls */}
      <View style={styles.controlRow}>
        <View
          style={[
            styles.timeRangeSelector,
            { borderColor: theme.border, backgroundColor: theme.surface },
          ]}
        >
          {(["24h", "7d", "30d", "90d"] as TimeRange[]).map((r) => {
            const isSelected = timeRange === r;
            return (
              <TouchableOpacity
                key={r}
                onPress={() => setTimeRange(r)}
                style={[
                  styles.timeRangeBtn,
                  isSelected && {
                    backgroundColor: theme.text,
                  },
                ]}
                activeOpacity={0.7}
              >
                <GeistText
                  weight="600"
                  style={{
                    fontSize: 12,
                    color: isSelected ? theme.background : theme.textSecondary,
                  }}
                >
                  {r.toUpperCase()}
                </GeistText>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Metric Toggle for Chart */}
        <View
          style={[
            styles.metricToggle,
            { borderColor: theme.border, backgroundColor: theme.surface },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.metricToggleBtn,
              metricView === "pageviews" && { backgroundColor: theme.card },
            ]}
            onPress={() => setMetricView("pageviews")}
          >
            <GeistText
              weight="600"
              style={{
                fontSize: 12,
                color: metricView === "pageviews" ? theme.text : theme.textSecondary,
              }}
            >
              Pageviews
            </GeistText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.metricToggleBtn,
              metricView === "visitors" && { backgroundColor: theme.card },
            ]}
            onPress={() => setMetricView("visitors")}
          >
            <GeistText
              weight="600"
              style={{
                fontSize: 12,
                color: metricView === "visitors" ? theme.text : theme.textSecondary,
              }}
            >
              Visitors
            </GeistText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Loading / Disabled / Active */}
      {loadingAnalytics && !refreshing ? (
        <View style={styles.loadingContainer}>
          <GeistSpinner size={28} color={theme.text} />
        </View>
      ) : isNotEnabled ? (
        /* Web Analytics Not Enabled State */
        <GeistCard style={styles.disabledCard}>
          <View style={[styles.disabledIconWrap, { backgroundColor: theme.surface }]}>
            <Activity size={32} color={theme.textSecondary} />
          </View>
          <GeistText weight="bold" style={{ fontSize: 18, marginTop: 16 }}>
            Web Analytics is not enabled
          </GeistText>
          <GeistText
            secondary
            style={{
              textAlign: "center",
              maxWidth: 440,
              marginTop: 8,
              lineHeight: 20,
              fontSize: 13,
            }}
          >
            Web Analytics is currently not active on &ldquo;{selectedProject?.name}&rdquo;.
            Enable the Web Analytics package in your project or switch to another project to view metrics.
          </GeistText>

          <View style={{ flexDirection: "row", gap: 10, marginTop: 20 }}>
            <GeistButton
              title="Choose Another Project"
              onPress={() => setSelectedProjectId(null)}
              prefix={<ChevronLeft size={14} color={theme.primaryText} style={{ marginRight: 4 }} />}
              style={{ minHeight: 38 }}
            />
          </View>
        </GeistCard>
      ) : (
        /* Active Web Analytics Content */
        <View style={styles.content}>
          {/* Key Metric Cards */}
          <View style={styles.metricsGrid}>
            {/* 1. Unique Visitors */}
            <GeistCard style={styles.metricCard}>
              <View style={styles.metricHeaderRow}>
                <GeistText secondary style={{ fontSize: 13, fontWeight: "500" }}>
                  Unique Visitors
                </GeistText>
                <View style={[styles.iconCircle, { backgroundColor: "rgba(0, 112, 243, 0.1)" }]}>
                  <Users size={14} color="#0070F3" />
                </View>
              </View>
              <GeistText weight="bold" style={{ fontSize: 26, marginVertical: 4 }}>
                {pageviewCounts ? pageviewCounts.visitors.toLocaleString() : "0"}
              </GeistText>
              <GeistText secondary style={{ fontSize: 11 }}>
                In the selected {timeRange} period
              </GeistText>
            </GeistCard>

            {/* 2. Total Pageviews */}
            <GeistCard style={styles.metricCard}>
              <View style={styles.metricHeaderRow}>
                <GeistText secondary style={{ fontSize: 13, fontWeight: "500" }}>
                  Total Pageviews
                </GeistText>
                <View style={[styles.iconCircle, { backgroundColor: "rgba(16, 185, 129, 0.1)" }]}>
                  <Eye size={14} color="#10B981" />
                </View>
              </View>
              <GeistText weight="bold" style={{ fontSize: 26, marginVertical: 4 }}>
                {pageviewCounts ? pageviewCounts.pageviews.toLocaleString() : "0"}
              </GeistText>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <TrendingUp size={12} color="#10B981" />
                <GeistText style={{ color: "#10B981", fontSize: 11, fontWeight: "600" }}>
                  {viewsPerVisitor} Views / Visitor
                </GeistText>
              </View>
            </GeistCard>

            {/* 3. Views per Visitor */}
            <GeistCard style={styles.metricCard}>
              <View style={styles.metricHeaderRow}>
                <GeistText secondary style={{ fontSize: 13, fontWeight: "500" }}>
                  Avg. Views / Visitor
                </GeistText>
                <View style={[styles.iconCircle, { backgroundColor: "rgba(168, 85, 247, 0.1)" }]}>
                  <MousePointerClick size={14} color="#A855F7" />
                </View>
              </View>
              <GeistText weight="bold" style={{ fontSize: 26, marginVertical: 4 }}>
                {viewsPerVisitor}
              </GeistText>
              <GeistText secondary style={{ fontSize: 11 }}>
                Engagement depth
              </GeistText>
            </GeistCard>

            {/* 4. Custom Events */}
            <GeistCard style={styles.metricCard}>
              <View style={styles.metricHeaderRow}>
                <GeistText secondary style={{ fontSize: 13, fontWeight: "500" }}>
                  Custom Events
                </GeistText>
                <View style={[styles.iconCircle, { backgroundColor: "rgba(245, 158, 11, 0.1)" }]}>
                  <Sparkles size={14} color="#F59E0B" />
                </View>
              </View>
              <GeistText weight="bold" style={{ fontSize: 26, marginVertical: 4 }}>
                {customEventCounts ? customEventCounts.count.toLocaleString() : "0"}
              </GeistText>
              <GeistText secondary style={{ fontSize: 11 }}>
                {customEventCounts
                  ? `${customEventCounts.visitors} unique users`
                  : "Requires Pro plan"}
              </GeistText>
            </GeistCard>
          </View>

          {/* Time Series Traffic Chart */}
          <GeistCard style={styles.chartCard}>
            <View style={styles.chartCardHeader}>
              <View>
                <GeistText weight="bold" style={{ fontSize: 16 }}>
                  {metricView === "pageviews" ? "Pageviews Over Time" : "Unique Visitors Over Time"}
                </GeistText>
                <GeistText secondary style={{ fontSize: 12, marginTop: 2 }}>
                  {timeRange === "24h" ? "Hourly" : "Daily"} distribution of visitor activity
                </GeistText>
              </View>

              {selectedPoint && (
                <View
                  style={[
                    styles.selectedTooltipPill,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                  ]}
                >
                  <GeistText secondary style={{ fontSize: 11 }}>
                    {selectedPoint.label}:
                  </GeistText>
                  <GeistText weight="bold" style={{ fontSize: 12, marginLeft: 4 }}>
                    {(metricView === "pageviews"
                      ? selectedPoint.pageviews
                      : selectedPoint.visitors
                    ).toLocaleString()}{" "}
                    {metricView === "pageviews" ? "views" : "visitors"}
                  </GeistText>
                </View>
              )}
            </View>

            {timeSeries.length === 0 ? (
              <View style={{ padding: 40, alignItems: "center" }}>
                <GeistText secondary style={{ fontSize: 13 }}>
                  No traffic recorded in this timeframe.
                </GeistText>
              </View>
            ) : (
              <View style={styles.chartWrapper}>
                <Svg width="100%" height="190" viewBox="0 0 500 190">
                  <Defs>
                    <SvgGradient id="chartBarGradient" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0" stopColor="#0070F3" stopOpacity="1" />
                      <Stop offset="1" stopColor="#0070F3" stopOpacity="0.3" />
                    </SvgGradient>
                    <SvgGradient id="chartSelectedGradient" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0" stopColor="#38BDF8" stopOpacity="1" />
                      <Stop offset="1" stopColor="#0070F3" stopOpacity="0.8" />
                    </SvgGradient>
                  </Defs>

                  {/* Horizontal Guideline 1 */}
                  <Line
                    x1="0"
                    y1="30"
                    x2="500"
                    y2="30"
                    stroke={theme.border}
                    strokeDasharray="4,4"
                    strokeWidth="1"
                  />
                  {/* Horizontal Guideline 2 */}
                  <Line
                    x1="0"
                    y1="85"
                    x2="500"
                    y2="85"
                    stroke={theme.border}
                    strokeDasharray="4,4"
                    strokeWidth="1"
                  />
                  {/* Horizontal Guideline 3 */}
                  <Line
                    x1="0"
                    y1="140"
                    x2="500"
                    y2="140"
                    stroke={theme.border}
                    strokeDasharray="4,4"
                    strokeWidth="1"
                  />

                  {/* Bars */}
                  {timeSeries.map((pt, idx) => {
                    const totalBars = timeSeries.length;
                    const availableWidth = 480;
                    const barWidth = Math.max(
                      3,
                      Math.min(16, (availableWidth / totalBars) * 0.65),
                    );
                    const spacing = availableWidth / totalBars;
                    const x = 10 + idx * spacing + (spacing - barWidth) / 2;

                    const val = metricView === "pageviews" ? pt.pageviews : pt.visitors;
                    const height = (val / maxChartValue) * 120;
                    const y = 145 - height;
                    const isSelected = selectedPointIndex === idx;

                    return (
                      <Rect
                        key={pt.date + idx}
                        x={x}
                        y={Math.max(20, y)}
                        width={barWidth}
                        height={Math.max(3, height)}
                        rx={barWidth > 6 ? 3 : 1}
                        fill={
                          isSelected
                            ? "url(#chartSelectedGradient)"
                            : "url(#chartBarGradient)"
                        }
                        onPress={() => setSelectedPointIndex(idx)}
                      />
                    );
                  })}
                </Svg>

                <View style={styles.chartXLabels}>
                  {timeSeries.length > 0 && (
                    <GeistText secondary style={{ fontSize: 11 }}>
                      {timeSeries[0].label}
                    </GeistText>
                  )}
                  {timeSeries.length > 2 && (
                    <GeistText secondary style={{ fontSize: 11 }}>
                      {timeSeries[Math.floor(timeSeries.length / 2)].label}
                    </GeistText>
                  )}
                  {timeSeries.length > 1 && (
                    <GeistText secondary style={{ fontSize: 11 }}>
                      {timeSeries[timeSeries.length - 1].label}
                    </GeistText>
                  )}
                </View>
              </View>
            )}
          </GeistCard>

          {/* Breakdown Section with Segmented Tabs */}
          <View style={styles.breakdownSection}>
            <View style={styles.breakdownHeader}>
              <GeistText weight="bold" style={{ fontSize: 18 }}>
                Traffic Breakdown
              </GeistText>
              <GeistText secondary style={{ fontSize: 12 }}>
                Dimensions and visitor attributes
              </GeistText>
            </View>

            {/* Segmented Dimension Tabs */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabsContainer}
            >
              {[
                { id: "pages", label: "Top Pages", icon: Compass },
                { id: "referrers", label: "Referrers", icon: ArrowUpRight },
                { id: "countries", label: "Countries", icon: Globe },
                { id: "devices", label: "Devices", icon: Smartphone },
                { id: "events", label: "Custom Events", icon: Sparkles },
              ].map((t) => {
                const isSelected = activeTab === t.id;
                const IconComp = t.icon;
                return (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => setActiveTab(t.id as DimensionTab)}
                    style={[
                      styles.tabBtn,
                      {
                        backgroundColor: isSelected ? theme.text : theme.surface,
                        borderColor: isSelected ? theme.text : theme.border,
                      },
                    ]}
                    activeOpacity={0.7}
                  >
                    <IconComp
                      size={13}
                      color={isSelected ? theme.background : theme.textSecondary}
                      style={{ marginRight: 6 }}
                    />
                    <GeistText
                      weight="600"
                      style={{
                        fontSize: 12,
                        color: isSelected ? theme.background : theme.textSecondary,
                      }}
                    >
                      {t.label}
                    </GeistText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Dimension Breakdown Card */}
            <GeistCard style={{ padding: 0, overflow: "hidden" }}>
              {activeTab === "pages" && (
                <BreakdownList
                  items={topPages}
                  emptyMessage="No pageview paths recorded yet."
                  theme={theme}
                  renderLabel={(item) => (
                    <GeistText weight="500" style={{ fontSize: 13 }} numberOfLines={1}>
                      {item.label}
                    </GeistText>
                  )}
                />
              )}

              {activeTab === "referrers" && (
                <BreakdownList
                  items={topReferrers}
                  emptyMessage="No referrers recorded yet (most visits may be direct)."
                  theme={theme}
                  renderLabel={(item) => (
                    <GeistText weight="500" style={{ fontSize: 13 }} numberOfLines={1}>
                      {item.label || "Direct / None"}
                    </GeistText>
                  )}
                />
              )}

              {activeTab === "countries" && (
                <BreakdownList
                  items={topCountries}
                  emptyMessage="No country locations recorded."
                  theme={theme}
                  renderLabel={(item) => {
                    const country = getCountryDisplay(item.label);
                    return (
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <GeistText style={{ fontSize: 14 }}>{country.flag}</GeistText>
                        <GeistText weight="500" style={{ fontSize: 13 }} numberOfLines={1}>
                          {country.name}
                        </GeistText>
                      </View>
                    );
                  }}
                />
              )}

              {activeTab === "devices" && (
                <BreakdownList
                  items={topDevices}
                  emptyMessage="No device data recorded."
                  theme={theme}
                  renderLabel={(item) => {
                    const dev = (item.label || "").toLowerCase();
                    const DevIcon =
                      dev.includes("mobile") || dev.includes("phone")
                        ? Smartphone
                        : dev.includes("desktop")
                        ? Monitor
                        : Laptop;
                    return (
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <DevIcon size={14} color={theme.textSecondary} />
                        <GeistText weight="500" style={{ fontSize: 13, textTransform: "capitalize" }}>
                          {item.label || "Unknown"}
                        </GeistText>
                      </View>
                    );
                  }}
                />
              )}

              {activeTab === "events" && (
                <BreakdownList
                  items={topEvents}
                  emptyMessage="No custom events recorded. Custom Events tracking is available on Pro/Enterprise plans."
                  theme={theme}
                  renderLabel={(item) => (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Sparkles size={13} color="#F59E0B" />
                      <GeistText weight="500" style={{ fontSize: 13 }}>
                        {item.label}
                      </GeistText>
                    </View>
                  )}
                />
              )}
            </GeistCard>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

// Subcomponent for rendering breakdown rows with proportional progress bars
function BreakdownList({
  items,
  emptyMessage,
  theme,
  renderLabel,
}: {
  items: BreakdownItem[];
  emptyMessage: string;
  theme: any;
  renderLabel: (item: BreakdownItem) => React.ReactNode;
}) {
  if (items.length === 0) {
    return (
      <View style={{ padding: 32, alignItems: "center" }}>
        <GeistText secondary style={{ fontSize: 13, textAlign: "center" }}>
          {emptyMessage}
        </GeistText>
      </View>
    );
  }

  const maxVal = Math.max(...items.map((i) => i.pageviews), 1);

  return (
    <View>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        const relativeFillPct = Math.round((item.pageviews / maxVal) * 100);

        return (
          <View
            key={item.key + idx}
            style={[
              styles.breakdownRow,
              {
                borderBottomColor: theme.border,
                borderBottomWidth: isLast ? 0 : 1,
              },
            ]}
          >
            {/* Background Relative Fill Bar */}
            <View
              style={[
                styles.relativeProgressFill,
                {
                  width: `${relativeFillPct}%`,
                  backgroundColor: "rgba(0, 112, 243, 0.07)",
                },
              ]}
            />

            {/* Left Info */}
            <View style={{ flex: 1, paddingRight: 12 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <GeistText secondary style={{ fontSize: 11, width: 18, fontWeight: "600" }}>
                  #{idx + 1}
                </GeistText>
                {renderLabel(item)}
              </View>
            </View>

            {/* Right Counts */}
            <View style={{ alignItems: "flex-end" }}>
              <GeistText weight="bold" style={{ fontSize: 13 }}>
                {item.pageviews.toLocaleString()}
              </GeistText>
              <GeistText secondary style={{ fontSize: 11 }}>
                {item.visitors} {item.visitors === 1 ? "visitor" : "visitors"}
              </GeistText>
            </View>
          </View>
        );
      })}
    </View>
  );
}


