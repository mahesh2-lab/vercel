import { StyleSheet } from 'react-native';
import { spacing, radii, typography } from '../../../styles/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  urlChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 99,
    borderWidth: 1,
    marginBottom: 40,
  },
  previewCard: {
    width: '100%',
    aspectRatio: 16/9,
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 40,
  },
  browserBar: {
    height: 24,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 6,
  },
  browserDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EAEAEA', // Will be subtle on both themes
  },
  previewContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  mockSkeleton: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  actions: {
    width: '100%',
  }
});
