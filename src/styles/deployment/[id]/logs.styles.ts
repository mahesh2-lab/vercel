import { StyleSheet } from 'react-native';
import { spacing, radii, typography } from '../../../styles/theme';
import { scale, verticalScale, moderateScale } from '../../../utils/responsive';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxWidth: scale(1200),
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(12),
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: verticalScale(12),
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#064E3B',
    paddingHorizontal: scale(8),
    paddingVertical: scale(3),
    borderRadius: scale(99),
  },
  livePulse: {
    width: scale(6),
    height: verticalScale(6),
    borderRadius: scale(3),
    backgroundColor: '#10B981',
    marginRight: scale(6),
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(8),
    paddingVertical: scale(3),
    borderRadius: scale(99),
    borderWidth: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: scale(8),
  },
  iconButton: {
    width: scale(36),
    height: verticalScale(36),
    borderRadius: scale(6),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(12),
    height: verticalScale(36),
    borderRadius: scale(6),
    borderWidth: 1,
    marginBottom: verticalScale(12),
  },
  searchInput: {
    flex: 1,
    fontSize: moderateScale(13),
    paddingVertical: 0,
  },
  filterRow: {
    flexDirection: 'row',
    gap: scale(8),
    flexWrap: 'wrap',
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(10),
    paddingVertical: scale(5),
    borderRadius: scale(16),
    borderWidth: 1,
  },
  terminalWrapper: {
    flex: 1,
    backgroundColor: '#000000',
    position: 'relative',
  },
  terminal: {
    flex: 1,
  },
  loadingContainer: {
    padding: scale(48),
    alignItems: 'center',
    justifyContent: 'center',
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: scale(10),
    paddingVertical: scale(2),
    borderRadius: scale(4),
  },
  floatingControls: {
    position: 'absolute',
    bottom: verticalScale(16),
    right: scale(16),
    zIndex: 10,
  },
  autoScrollButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(14),
    paddingVertical: scale(8),
    borderRadius: scale(20),
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
});

