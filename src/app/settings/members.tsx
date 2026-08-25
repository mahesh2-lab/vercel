import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { GeistText, GeistCard, useTheme, GeistButton, GeistInput, GeistRow } from '../../components/GeistUI';
import { useUserContext } from '../../context/UserContext';
import { styles } from "@/styles/settings/members.styles";

export default function AccountMembersScreen() {
  const theme = useTheme();
  const { user, activeScope } = useUserContext();
  const [email, setEmail] = useState('');

  const ownerName = user?.name || user?.username || 'Account Owner';
  const ownerEmail = user?.email || 'owner@example.com';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <GeistText weight="bold" style={{ fontSize: 24 }}>Members</GeistText>
        <GeistText secondary style={{ marginTop: 4 }}>
          {activeScope?.type === 'team' ? `Manage members of team "${activeScope.name}".` : 'Manage team members and their roles.'}
        </GeistText>
      </View>

      <GeistCard style={{ marginBottom: 24 }}>
        <GeistText weight="600" style={{ marginBottom: 16 }}>Invite Member</GeistText>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <GeistInput 
            value={email}
            onChangeText={setEmail}
            placeholder="Email Address"
            style={{ flex: 1 }}
            autoCapitalize="none"
          />
          <GeistButton title="Invite" onPress={() => setEmail('')} />
        </View>
      </GeistCard>

      <GeistText weight="600" style={{ marginBottom: 12 }}>Team Members</GeistText>
      <GeistCard style={{ padding: 0, overflow: 'hidden' }}>
        <View style={{ paddingHorizontal: 16 }}>
          <GeistRow label={ownerName} description={ownerEmail} value="Owner" />
        </View>
      </GeistCard>
    </ScrollView>
  );
}


