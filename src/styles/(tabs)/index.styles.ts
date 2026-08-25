import { StyleSheet } from 'react-native';
import { spacing, radii, typography } from '../../styles/theme';

export const styles = StyleSheet.create({
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
    borderRadius: radii.md,
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
