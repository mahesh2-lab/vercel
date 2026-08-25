import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { GeistText, GeistCard, useTheme, GeistButton, GeistInput, GeistRow } from '../../components/GeistUI';
import { styles } from "../../styles/settings/tokens.styles";

export default function AccountTokensScreen() {
  const theme = useTheme();
  const [tokenName, setTokenName] = useState('');

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <GeistText weight="bold" style={{ fontSize: 24 }}>Personal Access Tokens</GeistText>
        <GeistText secondary style={{ marginTop: 4 }}>Manage tokens for API access.</GeistText>
      </View>

      <GeistCard style={{ marginBottom: 24 }}>
        <GeistText weight="600" style={{ marginBottom: 16 }}>Create New Token</GeistText>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <GeistInput 
            value={tokenName}
            onChangeText={setTokenName}
            placeholder="Token Name (e.g. CLI)"
            style={{ flex: 1 }}
          />
          <GeistButton title="Create" onPress={() => setTokenName('')} />
        </View>
      </GeistCard>

      <GeistText weight="600" style={{ marginBottom: 12 }}>Active Tokens</GeistText>
      <GeistCard style={{ padding: 0, overflow: 'hidden' }}>
        <View style={{ paddingHorizontal: 16 }}>
          <GeistRow label="Vercel CLI" description="Created 2 months ago" value="Revoke" />
          <GeistRow label="GitHub Actions" description="Created last week" value="Revoke" />
        </View>
      </GeistCard>
    </ScrollView>
  );
}


