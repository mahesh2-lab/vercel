import React, { useState, useEffect, useCallback } from "react";
import {
  ScrollView,
  View,
  Alert,
  TouchableOpacity,
  Platform,
  RefreshControl,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import {
  User,
  Mail,
  Check,
  Copy,
  LogOut,
  Users,
  Settings,
  Layers,
} from "lucide-react-native";
import {
  GeistText,
  GeistCard,
  useTheme,
  GeistSpinner,
} from "../../components/GeistUI";
import { Toast, ToastType } from "../../components/Toast";
import { vercel } from "../../api/vercel";
import { useUserContext, VercelTeam } from "../../context/UserContext";
import { getCachedVercelToken } from '@/lib/vercel-token';
import { styles } from "../../styles/(tabs)/profile.styles";

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user, teams, activeScope, setActiveScope, refreshUser, logout } =
    useUserContext();

  const [fullUser, setFullUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const fetchProfileData = useCallback(
    async (isPull = false) => {
      const token = getCachedVercelToken();

      if (!token) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (isPull) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const { getUser } = require('../../lib/vercel-api');
        const userRes = await getUser();

        if (userRes.ok) {
          const userData = await userRes.json();
          setFullUser(userData.user || userData);
        }

        await refreshUser();

        if (isPull) {
          showToast("Profile refreshed", "success");
        }
      } catch (err: any) {
        console.error("Profile fetch error:", err);
        showToast("Failed to refresh profile", "error");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [refreshUser],
  );

  useEffect(() => {
    let isMounted = true;
    async function load() {
      if (isMounted) {
        await fetchProfileData(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [fetchProfileData]);

  const handleCopy = async (text: string, label: string) => {
    await Clipboard.setStringAsync(text);
    showToast(`${label} copied to clipboard!`, "success");
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out of Vercel?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          showToast("Signed out", "success");
          router.replace("/auth");
        },
      },
    ]);
  };

  const activeUser = fullUser || user;
  const username = activeUser?.username || "user";
  const displayName = activeUser?.name || username;
  const email = activeUser?.email || "No email available";
  const userId = activeUser?.id || "N/A";
  const plan = activeUser?.billing?.plan
    ? String(activeUser.billing.plan).toUpperCase()
    : "HOBBY";
  const avatarHash = activeUser?.avatar;
  const avatarUrl = avatarHash
    ? `https://vercel.com/api/www/avatar/${avatarHash}`
    : `https://github.com/${username}.png`;

  const memberSince = activeUser?.createdAt
    ? new Date(activeUser.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Active Member";

  const initial = (
    displayName.trim()[0] ||
    username[0] ||
    "V"
  ).toUpperCase();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetchProfileData(true)}
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
        <View style={{ flex: 1, paddingRight: 16 }}>
          <GeistText weight="bold" style={{ fontSize: 28, marginBottom: 4 }}>
            Profile & Account
          </GeistText>
          <GeistText secondary>
            Your live Vercel account identity, personal details, and workspaces.
          </GeistText>
        </View>

        <TouchableOpacity
          style={[
            styles.settingsBtn,
            { borderColor: theme.border, backgroundColor: theme.surface },
          ]}
          onPress={() => router.push("/settings")}
          activeOpacity={0.7}
        >
          <Settings size={16} color={theme.text} style={{ marginRight: 6 }} />
          <GeistText weight="500" style={{ fontSize: 13 }}>
            Settings
          </GeistText>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={{ padding: 60, alignItems: "center" }}>
          <GeistSpinner size={28} color={theme.text} />
          <GeistText secondary style={{ marginTop: 14 }}>
            Loading account details...
          </GeistText>
        </View>
      ) : (
        <View style={styles.grid}>

          <GeistCard style={[styles.profileCard, { borderColor: theme.border }]}>
            <View style={styles.profileCardTop}>
              <View style={styles.avatarContainer}>
                <Image
                  source={{ uri: avatarUrl }}
                  style={styles.avatarImage}
                  contentFit="cover"
                  transition={150}
                  cachePolicy="memory-disk"
                />
                <View
                  style={[
                    styles.avatarFallback,
                    { backgroundColor: theme.primary },
                  ]}
                >
                  <GeistText
                    weight="bold"
                    style={{ fontSize: 28, color: theme.primaryText }}
                  >
                    {initial}
                  </GeistText>
                </View>
              </View>

              <View style={{ flex: 1, justifyContent: "center" }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <GeistText weight="bold" style={{ fontSize: 20 }}>
                    {displayName}
                  </GeistText>
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: theme.text,
                        borderColor: theme.text,
                      },
                    ]}
                  >
                    <GeistText
                      style={{
                        fontSize: 11,
                        color: theme.background,
                        fontWeight: "600",
                      }}
                    >
                      {plan}
                    </GeistText>
                  </View>
                </View>

                <GeistText
                  secondary
                  mono
                  style={{ fontSize: 13, marginTop: 2 }}
                >
                  @{username}
                </GeistText>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 8,
                    gap: 6,
                  }}
                >
                  <Mail size={13} color={theme.textSecondary} />
                  <GeistText secondary style={{ fontSize: 13 }}>
                    {email}
                  </GeistText>
                </View>
              </View>
            </View>

            <View
              style={[
                styles.profileMetaBar,
                {
                  borderTopColor: theme.border,
                  backgroundColor: theme.surface,
                },
              ]}
            >
              <TouchableOpacity
                style={styles.metaItem}
                onPress={() => handleCopy(userId, "User ID")}
                activeOpacity={0.7}
              >
                <GeistText secondary style={{ fontSize: 12 }}>
                  USER ID
                </GeistText>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                    marginTop: 2,
                  }}
                >
                  <GeistText mono weight="500" style={{ fontSize: 12 }}>
                    {userId.substring(0, 12)}...
                  </GeistText>
                  <Copy size={12} color={theme.textSecondary} />
                </View>
              </TouchableOpacity>

              <View
                style={[styles.metaDivider, { backgroundColor: theme.border }]}
              />

              <View style={styles.metaItem}>
                <GeistText secondary style={{ fontSize: 12 }}>
                  MEMBER SINCE
                </GeistText>
                <GeistText weight="500" style={{ fontSize: 12, marginTop: 2 }}>
                  {memberSince}
                </GeistText>
              </View>

              <View
                style={[styles.metaDivider, { backgroundColor: theme.border }]}
              />

              <View style={styles.metaItem}>
                <GeistText secondary style={{ fontSize: 12 }}>
                  STATUS
                </GeistText>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                    marginTop: 2,
                  }}
                >
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: "#10B981",
                    }}
                  />
                  <GeistText
                    weight="500"
                    style={{ fontSize: 12, color: "#10B981" }}
                  >
                    Active
                  </GeistText>
                </View>
              </View>
            </View>
          </GeistCard>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <Users size={18} color={theme.text} />
                <GeistText weight="600" style={{ fontSize: 18 }}>
                  Workspaces & Teams
                </GeistText>
              </View>
              <GeistText secondary style={{ fontSize: 13 }}>
                {1 + teams.length} available
              </GeistText>
            </View>

            <GeistCard style={{ padding: 0, overflow: "hidden" }}>

              <TouchableOpacity
                style={[
                  styles.scopeRow,
                  {
                    borderBottomColor: theme.border,
                    borderBottomWidth: teams.length > 0 ? 1 : 0,
                    backgroundColor:
                      activeScope?.type === "personal"
                        ? theme.surface
                        : "transparent",
                  },
                ]}
                onPress={() => {
                  setActiveScope({
                    id: activeUser.id,
                    type: "personal",
                    name: activeUser.username,
                    slug: activeUser.username,
                    avatar: activeUser.avatar,
                  });
                  showToast("Switched to Personal workspace", "success");
                }}
                activeOpacity={0.7}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    flex: 1,
                  }}
                >
                  <View
                    style={[
                      styles.teamAvatarBadge,
                      {
                        backgroundColor: theme.text,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <User size={14} color={theme.background} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <GeistText weight="600" style={{ fontSize: 15 }}>
                        {username}
                      </GeistText>
                      <GeistText secondary style={{ fontSize: 12 }}>
                        (Personal Account)
                      </GeistText>
                    </View>
                    <GeistText secondary mono style={{ fontSize: 12 }}>
                      /{username}
                    </GeistText>
                  </View>
                </View>

                {activeScope?.type === "personal" ? (
                  <View
                    style={[
                      styles.activePill,
                      {
                        backgroundColor: theme.text,
                      },
                    ]}
                  >
                    <Check size={12} color={theme.background} />
                    <GeistText
                      style={{
                        fontSize: 11,
                        color: theme.background,
                        fontWeight: "600",
                        marginLeft: 4,
                      }}
                    >
                      Active
                    </GeistText>
                  </View>
                ) : (
                  <GeistText secondary style={{ fontSize: 12 }}>
                    Switch
                  </GeistText>
                )}
              </TouchableOpacity>

              {teams.map((team: VercelTeam, idx: number) => {
                const isActive =
                  activeScope?.type === "team" && activeScope.id === team.id;
                const isLast = idx === teams.length - 1;

                return (
                  <TouchableOpacity
                    key={team.id}
                    style={[
                      styles.scopeRow,
                      {
                        borderBottomColor: theme.border,
                        borderBottomWidth: isLast ? 0 : 1,
                        backgroundColor: isActive
                          ? theme.surface
                          : "transparent",
                      },
                    ]}
                    onPress={() => {
                      setActiveScope({
                        id: team.id,
                        type: "team",
                        name: team.name,
                        slug: team.slug,
                        avatar: team.avatar,
                      });
                      showToast(`Switched to team "${team.name}"`, "success");
                    }}
                    activeOpacity={0.7}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                        flex: 1,
                      }}
                    >
                      <View
                        style={[
                          styles.teamAvatarBadge,
                          {
                            backgroundColor: theme.surface,
                            borderColor: theme.border,
                          },
                        ]}
                      >
                        <Layers size={14} color={theme.text} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <GeistText weight="600" style={{ fontSize: 15 }}>
                          {team.name}
                        </GeistText>
                        <GeistText secondary mono style={{ fontSize: 12 }}>
                          /{team.slug}
                        </GeistText>
                      </View>
                    </View>

                    {isActive ? (
                      <View
                        style={[
                          styles.activePill,
                          {
                            backgroundColor: theme.text,
                          },
                        ]}
                      >
                        <Check size={12} color={theme.background} />
                        <GeistText
                          style={{
                            fontSize: 11,
                            color: theme.background,
                            fontWeight: "600",
                            marginLeft: 4,
                          }}
                        >
                          Active
                        </GeistText>
                      </View>
                    ) : (
                      <GeistText secondary style={{ fontSize: 12 }}>
                        Switch
                      </GeistText>
                    )}
                  </TouchableOpacity>
                );
              })}
            </GeistCard>
          </View>

          <View
            style={[
              styles.section,
              {
                borderTopWidth: 1,
                borderTopColor: theme.border,
                paddingTop: 32,
              },
            ]}
          >
            <GeistText
              weight="bold"
              style={{ color: theme.error, fontSize: 18, marginBottom: 16 }}
            >
              Danger Zone
            </GeistText>

            <View
              style={[
                styles.dangerBox,
                {
                  borderColor: theme.error + "50",
                  backgroundColor: theme.error + "08",
                  marginBottom: 16,
                },
              ]}
            >
              <View
                style={{
                  flex: 1,
                  marginRight: 16,
                  marginBottom: Platform.OS === "web" ? 0 : 12,
                }}
              >
                <GeistText
                  weight="600"
                  style={{ fontSize: 15, marginBottom: 2 }}
                >
                  Sign Out
                </GeistText>
                <GeistText secondary style={{ fontSize: 13 }}>
                  Sign out of this session on this device.
                </GeistText>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleSignOut}
                style={[
                  styles.dangerBtn,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                  },
                ]}
              >
                <LogOut
                  size={14}
                  color={theme.text}
                  style={{ marginRight: 6 }}
                />
                <GeistText weight="500" style={{ fontSize: 13 }}>
                  Sign Out
                </GeistText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

