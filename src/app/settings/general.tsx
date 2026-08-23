import React, { useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { GeistText, GeistCard, useTheme, GeistButton, GeistInput } from '../../components/GeistUI';

export default function AccountGeneralScreen() {
  const theme = useTheme();
  const [teamName, setTeamName] = useState('My Workspace');
  const [teamSlug, setTeamSlug] = useState('my-workspace');

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <GeistText weight="bold" style={{ fontSize: 24 }}>General Settings</GeistText>
        <GeistText secondary style={{ marginTop: 4 }}>Manage your team's details.</GeistText>
      </View>

      <GeistCard style={{ marginBottom: 24 }}>
        <GeistText weight="600" style={{ marginBottom: 16 }}>Team Name</GeistText>
        <GeistInput 
          value={teamName}
          onChangeText={setTeamName}
          placeholder="e.g. Acme Corp"
          style={{ marginBottom: 16 }}
        />
        <GeistButton title="Save" onPress={() => {}} />
      </GeistCard>

      <GeistCard style={{ marginBottom: 24 }}>
        <GeistText weight="600" style={{ marginBottom: 16 }}>Team Slug</GeistText>
        <GeistInput 
          value={teamSlug}
          onChangeText={setTeamSlug}
          placeholder="e.g. acme-corp"
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
