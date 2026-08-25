import { StyleSheet, Platform } from "react-native";
import { spacing, radii, typography } from '../../styles/theme';

export const styles = StyleSheet.create({
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
    borderRadius: radii.md,
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
