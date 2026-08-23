import React, { useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { GeistText, GeistCard, useTheme, GeistButton, GeistInput } from '../../components/GeistUI';
import { useUserContext } from '../../context/UserContext';

export default function AccountGeneralScreen() {
  const theme = useTheme();
  const { user, activeScope } = useUserContext();

  const [teamName, setTeamName] = useState<string | null>(null);
  const [teamSlug, setTeamSlug] = useState<string | null>(null);

  const activeName = teamName !== null ? teamName : (activeScope?.name || user?.name || user?.username || '');
  const activeSlug = teamSlug !== null ? teamSlug : (activeScope?.slug || user?.username || '');

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <GeistText weight="bold" style={{ fontSize: 24 }}>General Settings</GeistText>
        <GeistText secondary style={{ marginTop: 4 }}>{"Manage your workspace details."}</GeistText>
      </View>

      <GeistCard style={{ marginBottom: 24 }}>
        <GeistText weight="600" style={{ marginBottom: 16 }}>Workspace Name</GeistText>
        <GeistInput 
          value={activeName}
          onChangeText={setTeamName}
          placeholder="e.g. My Workspace"
          style={{ marginBottom: 16 }}
        />
        <GeistButton title="Save" onPress={() => {}} />
      </GeistCard>

      <GeistCard style={{ marginBottom: 24 }}>
        <GeistText weight="600" style={{ marginBottom: 16 }}>Workspace Slug</GeistText>
        <GeistInput 
          value={activeSlug}
          onChangeText={setTeamSlug}
          placeholder="e.g. my-workspace"
          style={{ marginBottom: 16 }}
        />
        <GeistButton title="Save" onPress={() => {}} />
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
