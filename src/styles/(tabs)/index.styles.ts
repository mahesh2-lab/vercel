import { StyleSheet } from 'react-native';
import { spacing, radii, typography } from '../../styles/theme';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';

export const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(40),
    maxWidth: scale(1100),
    width: "100%",
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(20),
  },
  cardWrapper: {
    marginBottom: verticalScale(14),
    width: "100%",
  },
  card: {
    padding: scale(16),
    borderRadius: radii.md,
    width: "100%",
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(12),
  },
  cardTopLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: scale(12),
    gap: scale(12),
  },
  projectInfoCol: {
    flex: 1,
    justifyContent: "center",
  },
  projectName: {
    fontSize: moderateScale(16),
    lineHeight: moderateScale(20),
  },
  projectDomain: {
    fontSize: moderateScale(13),
    marginTop: verticalScale(2),
    lineHeight: moderateScale(16),
  },
  cardTopRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
  },
  cardMiddleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
    marginBottom: verticalScale(8),
  },
  commitMessage: {
    fontSize: moderateScale(13),
    lineHeight: moderateScale(18),
    flex: 1,
  },
  cardBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
  },
  repoMetaText: {
    fontSize: moderateScale(12),
    lineHeight: moderateScale(16),
    flex: 1,
  },
  footerLoader: {
    paddingVertical: scale(20),
    alignItems: "center",
    justifyContent: "center",
  },
  centerLoading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: scale(40),
  },
  emptyContainer: {
    padding: scale(40),
    alignItems: "center",
    justifyContent: "center",
  },
});
