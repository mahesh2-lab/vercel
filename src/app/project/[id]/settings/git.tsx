import React, { useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { GeistText, GeistCard, useTheme, GeistButton, GeistInput, GeistRow } from '../../../../components/GeistUI';

export default function ProjectGitScreen() {
  const theme = useTheme();
  const [repo, setRepo] = useState('mahesh / web-app');

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <GeistText weight="bold" style={{ fontSize: 24 }}>Git</GeistText>
        <GeistText secondary style={{ marginTop: 4 }}>Manage Git connection and deploy hooks.</GeistText>
      </View>

      <GeistCard style={{ marginBottom: 24 }}>
        <GeistText weight="600" style={{ marginBottom: 16 }}>Connected Repository</GeistText>
        <GeistInput 
          value={repo}
          onChangeText={setRepo}
          style={{ marginBottom: 16 }}
        />
        <GeistButton title="Disconnect" secondary onPress={() => {}} />
      </GeistCard>

      <GeistText weight="600" style={{ marginBottom: 12 }}>Deploy Hooks</GeistText>
      <GeistCard style={{ padding: 0, overflow: 'hidden' }}>
        <View style={{ paddingHorizontal: 16 }}>
          <GeistRow label="Production Hook" description="Triggers a deployment to main" value="Revoke" />
          <GeistRow label="Staging Hook" description="Triggers a deployment to staging" value="Revoke" />
        </View>
      </GeistCard>
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
});
