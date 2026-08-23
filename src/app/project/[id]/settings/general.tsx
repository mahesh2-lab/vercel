import React, { useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { GeistText, GeistCard, useTheme, GeistButton, GeistInput } from '../../../../components/GeistUI';

export default function ProjectGeneralScreen() {
  const { id } = useLocalSearchParams();
  const theme = useTheme();
  const [projectName, setProjectName] = useState(id as string);
  const [framework, setFramework] = useState('Next.js');

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <GeistText weight="bold" style={{ fontSize: 24 }}>General</GeistText>
        <GeistText secondary style={{ marginTop: 4 }}>Manage project configuration.</GeistText>
      </View>

      <GeistCard style={{ marginBottom: 24 }}>
        <GeistText weight="600" style={{ marginBottom: 16 }}>Project Name</GeistText>
        <GeistInput 
          value={projectName}
          onChangeText={setProjectName}
          placeholder="Project Name"
          style={{ marginBottom: 16 }}
        />
        <GeistButton title="Save" onPress={() => {}} />
      </GeistCard>

      <GeistCard style={{ marginBottom: 24 }}>
        <GeistText weight="600" style={{ marginBottom: 16 }}>Framework Preset</GeistText>
        <GeistInput 
          value={framework}
          onChangeText={setFramework}
          placeholder="Framework"
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
