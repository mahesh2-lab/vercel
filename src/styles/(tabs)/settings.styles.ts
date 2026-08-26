import { StyleSheet } from 'react-native';
import { spacing, radii, typography } from '../../styles/theme';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';

export const styles = StyleSheet.create({
  container: {
    padding: scale(16),
    paddingBottom: verticalScale(40),
  },
  header: {
    marginBottom: verticalScale(24),
  },
  dangerZone: {
    borderWidth: 1,
    borderRadius: scale(8),
    overflow: 'hidden',
  },
  dangerHeader: {
    padding: scale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#EF444420',
    backgroundColor: '#EF444405',
  },
  dangerContent: {
    padding: scale(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deleteButton: {
    borderWidth: 1,
    borderRadius: scale(6),
    paddingHorizontal: scale(12),
    paddingVertical: scale(8),
  }
});

