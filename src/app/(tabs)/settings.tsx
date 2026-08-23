import { ScrollView, View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { GeistText, GeistCard, GeistRow, useTheme } from '../../components/GeistUI';

export default function GlobalSettingsScreen() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <GeistText weight="bold" style={{ fontSize: 24 }}>Account Settings</GeistText>
        <GeistText secondary style={{ marginTop: 4 }}>Manage your global account and team preferences.</GeistText>
      </View>

      <GeistCard style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
        <View style={{ paddingHorizontal: 16 }}>
          <GeistRow 
            label="General" 
            description="Team Name, Slug, Logo" 
            chevron 
            onPress={() => router.push('/settings/general')} 
          />
          <GeistRow 
            label="Billing" 
            description="Plan, Invoices, Payment Methods" 
            chevron 
            onPress={() => router.push('/settings/billing')} 
          />
          <GeistRow 
            label="Members" 
            description="Invite team members and manage roles" 
            chevron 
            onPress={() => router.push('/settings/members')} 
          />
          <GeistRow 
            label="Security" 
            description="SSO, 2FA, and access policies" 
            chevron 
            onPress={() => router.push('/settings/security')} 
          />
          <GeistRow 
            label="Tokens" 
            description="Manage personal access tokens" 
            chevron 
            onPress={() => router.push('/settings/tokens')} 
          />
        </View>
      </GeistCard>

      <View style={[styles.dangerZone, { borderColor: theme.error }]}>
        <View style={styles.dangerHeader}>
          <GeistText weight="600" style={{ color: theme.error }}>Danger Zone</GeistText>
        </View>
        <View style={styles.dangerContent}>
          <View style={{ flex: 1, paddingRight: 16 }}>
            <GeistText weight="500">Delete Account</GeistText>
            <GeistText secondary style={{ marginTop: 4, fontSize: 13 }}>
              Permanently delete your account and all associated projects.
            </GeistText>
          </View>
          <TouchableOpacity 
            activeOpacity={0.7}
            onPress={() => {
              Alert.alert('Delete Account', 'Are you sure you want to delete your account? This action is irreversible.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive' },
              ]);
            }}
            style={[styles.deleteButton, { borderColor: theme.error, backgroundColor: theme.error + '10' }]}
          >
            <GeistText style={{ color: theme.error, fontWeight: '500' }}>Delete</GeistText>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
