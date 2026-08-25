import { StyleSheet, Platform } from "react-native";
import { spacing, radii, typography } from '../../styles/theme';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';

export const styles = StyleSheet.create({
  container: {
    padding: scale(24),
    maxWidth: scale(900),
    width: "100%",
    alignSelf: "center",
    paddingBottom: verticalScale(48),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: verticalScale(28),
  },
  settingsBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: scale(12),
    paddingVertical: scale(8),
    borderRadius: scale(6),
  },
  grid: {
    gap: scale(28),
  },
  profileCard: {
    padding: 0,
    overflow: "hidden",
    borderRadius: radii.md,
  },
  profileCardTop: {
    padding: scale(20),
    flexDirection: Platform.OS === "web" ? "row" : "column",
    alignItems: Platform.OS === "web" ? "center" : "flex-start",
    gap: scale(20),
  },
  avatarContainer: {
    width: scale(72),
    height: verticalScale(72),
    borderRadius: scale(36),
    overflow: "hidden",
    position: "relative",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: scale(36),
    zIndex: 2,
  },
  avatarFallback: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  badge: {
    paddingHorizontal: scale(8),
    paddingVertical: scale(2),
    borderRadius: scale(999),
    borderWidth: 1,
  },
  profileMetaBar: {
    borderTopWidth: 1,
    flexDirection: "row",
    paddingVertical: scale(12),
    paddingHorizontal: scale(20),
    justifyContent: "space-around",
    alignItems: "center",
  },
  metaItem: {
    alignItems: "center",
    paddingHorizontal: scale(8),
  },
  metaDivider: {
    width: scale(1),
    height: verticalScale(24),
  },
  section: {
    gap: scale(12),
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scopeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: scale(18),
    paddingVertical: scale(14),
  },
  teamAvatarBadge: {
    width: scale(32),
    height: verticalScale(32),
    borderRadius: scale(16),
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  activePill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: scale(999),
  },
  dangerBox: {
    borderWidth: 1,
    borderRadius: scale(10),
    padding: scale(18),
    flexDirection: Platform.OS === "web" ? "row" : "column",
    alignItems: Platform.OS === "web" ? "center" : "flex-start",
    justifyContent: "space-between",
  },
  dangerBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(14),
    paddingVertical: scale(8),
    borderRadius: scale(6),
    borderWidth: 1,
    borderColor: "transparent",
  },
});
