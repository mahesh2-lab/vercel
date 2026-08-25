import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { GeistText, GeistCard, useTheme, GeistButton, GeistInput } from '../../../../components/GeistUI';
import { styles } from "@/styles/project/[id]/settings/build.styles";

export default function ProjectBuildScreen() {
  const theme = useTheme();
  const [buildCommand, setBuildCommand] = useState('npm run build');
  const [outputDir, setOutputDir] = useState('.next');
  const [installCommand, setInstallCommand] = useState('npm install');

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <GeistText weight="bold" style={{ fontSize: 24 }}>Build & Development</GeistText>
        <GeistText secondary style={{ marginTop: 4 }}>Configure how your project is built.</GeistText>
      </View>

      <GeistCard style={{ marginBottom: 24 }}>
        <GeistText weight="600" style={{ marginBottom: 16 }}>Build Command</GeistText>
        <GeistInput 
          value={buildCommand}
          onChangeText={setBuildCommand}
          mono
          style={{ marginBottom: 16 }}
        />
        
        <GeistText weight="600" style={{ marginBottom: 16 }}>Output Directory</GeistText>
        <GeistInput 
          value={outputDir}
          onChangeText={setOutputDir}
          mono
          style={{ marginBottom: 16 }}
        />

        <GeistText weight="600" style={{ marginBottom: 16 }}>Install Command</GeistText>
        <GeistInput 
          value={installCommand}
          onChangeText={setInstallCommand}
          mono
          style={{ marginBottom: 16 }}
        />
        
        <GeistButton title="Save" onPress={() => {}} />
      </GeistCard>
    </ScrollView>
  );
}


