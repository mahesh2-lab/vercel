import { StyleSheet, Platform } from "react-native";
import { spacing, radii, typography } from '../../styles/theme';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';

export const styles = StyleSheet.create({
  container: {
    padding: scale(24),
    maxWidth: scale(1200),
    width: "100%",
    alignSelf: "center",
    paddingBottom: verticalScale(40),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: verticalScale(32),
    flexWrap: "wrap",
    gap: scale(16),
  },
  urlButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  visitButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(16),
    paddingVertical: scale(8),
    borderWidth: 1,
    borderRadius: scale(6),
  },
  grid: {
    flexDirection: Platform.OS === "web" ? "row" : "column",
    gap: scale(24),
  },
  leftCol: {
    flex: Platform.OS === "web" ? 2 : undefined,
  },
  rightCol: {
    flex: Platform.OS === "web" ? 1 : undefined,
  },
  deploymentBox: {
    borderWidth: 1,
    borderRadius: scale(8),
    padding: scale(16),
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: scale(16),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: scale(16),
  },
  modalCard: {
    width: "100%",
    maxWidth: scale(440),
    borderRadius: radii.md,
    borderWidth: 1,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: scale(20),
    paddingVertical: scale(16),
    borderBottomWidth: 1,
  },
  targetOption: {
    flex: 1,
    paddingVertical: scale(8),
    alignItems: "center",
    borderRadius: scale(6),
    borderWidth: 1,
  },
  cacheToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: scale(12),
    borderRadius: scale(6),
    borderWidth: 1,
  },
  checkbox: {
    width: scale(20),
    height: verticalScale(20),
    borderRadius: scale(4),
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelBtn: {
    borderWidth: 1,
    borderRadius: scale(6),
    paddingHorizontal: scale(16),
    paddingVertical: scale(8),
  },
  modalSubmitBtn: {
    borderRadius: scale(6),
    paddingHorizontal: scale(18),
    paddingVertical: scale(8),
    minWidth: scale(80),
    alignItems: "center",
    justifyContent: "center",
  },
});
