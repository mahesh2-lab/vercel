import { ScrollView, View, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { GeistText, GeistCard, GeistRow, useTheme } from '../../components/GeistUI';
import { styles } from "../../styles/(tabs)/settings.styles";

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
    </ScrollView>
  );
}


