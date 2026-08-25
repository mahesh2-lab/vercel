import { StyleSheet } from 'react-native';
import { spacing, radii, typography } from '../../styles/theme';

export const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  dangerZone: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  dangerHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EF444420',
    backgroundColor: '#EF444405',
  },
  dangerContent: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deleteButton: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  }
});
