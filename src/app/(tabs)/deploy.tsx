import { ScrollView, View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { GeistText, GeistCard, useTheme, GeistButton, GeistInput } from '../../components/GeistUI';
import { useState } from 'react';
import Svg, { Path } from 'react-native-svg';
import { siGithub } from 'simple-icons';
import { Search, Lock, ChevronDown, Terminal, Folder } from 'lucide-react-native';

const MOCK_REPOS = [
  { id: '1', name: 'portfolio-v2', private: false, updated: '2d ago' },
  { id: '2', name: 'internal-api', private: true, updated: '1w ago' },
  { id: '3', name: 'e-commerce-store', private: false, updated: '5h ago' },
  { id: '4', name: 'marketing-site', private: false, updated: 'Just now' },
];

export default function DeployScreen() {
  const router = useRouter();
  const theme = useTheme();

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRepo, setSelectedRepo] = useState(MOCK_REPOS[0]);
  
  // Step 2 state
  const [projectName, setProjectName] = useState('portfolio-v2');
  const [framework, setFramework] = useState('Next.js');
  const [command, setCommand] = useState('npm run build');
  const [output, setOutput] = useState('.next');
  const [deploying, setDeploying] = useState(false);

  const handleSelectRepo = (repo: typeof MOCK_REPOS[0]) => {
    setSelectedRepo(repo);
    setProjectName(repo.name);
    setStep(2);
  };

  const handleDeploy = () => {
    setDeploying(true);
    setTimeout(() => {
      setDeploying(false);
      const fakeId = Math.random().toString(16).substring(2, 8);
      router.push(`/deployment/${fakeId}`);
    }, 1500);
  };

  if (step === 1) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <GeistText weight="bold" style={{ fontSize: 28, marginBottom: 8 }}>Import Git Repository</GeistText>
            <GeistText secondary>Select a repository to deploy to your personal account.</GeistText>
          </View>

          <GeistCard style={{ padding: 0, overflow: 'hidden', marginBottom: 24, borderWidth: 1, borderColor: theme.border }}>
            <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: theme.border, flexDirection: 'row', alignItems: 'center' }}>
              <Search size={20} color={theme.textSecondary} style={{ marginRight: 12 }} />
              <GeistInput 
                placeholder="Search..."
                style={{ borderWidth: 0, backgroundColor: 'transparent', paddingVertical: 0, paddingHorizontal: 0, flex: 1, fontSize: 16 }}
              />
            </View>
            
            <View>
              {MOCK_REPOS.map((repo, index) => (
                <View key={repo.id} style={{ borderBottomWidth: index === MOCK_REPOS.length - 1 ? 0 : 1, borderBottomColor: theme.border }}>
                  <TouchableOpacity 
                    style={styles.repoRow} 
                    activeOpacity={0.7}
                    onPress={() => handleSelectRepo(repo)}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ marginRight: 16 }}>
                        <Path d={siGithub.path} fill={theme.text} />
                      </Svg>
                      <View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <GeistText weight="500" style={{ fontSize: 16 }}>{repo.name}</GeistText>
                          {repo.private && (
                            <Lock size={14} color={theme.textSecondary} style={{ marginLeft: 6 }} />
                          )}
                        </View>
                        <GeistText secondary style={{ fontSize: 13, marginTop: 4 }}>Updated {repo.updated}</GeistText>
                      </View>
                    </View>
                    <View style={[styles.importButton, { borderColor: theme.border }]}>
                      <GeistText weight="500" style={{ fontSize: 14 }}>Import</GeistText>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </GeistCard>
        </ScrollView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setStep(1)} style={{ marginBottom: 16 }}>
            <GeistText secondary>← Back</GeistText>
          </TouchableOpacity>
          <GeistText weight="bold" style={{ fontSize: 24 }}>Configure Project</GeistText>
        </View>

        <GeistCard style={{ marginBottom: 24, padding: 24 }}>
          <View style={styles.field}>
            <GeistText secondary style={styles.label}>Project Name</GeistText>
            <GeistInput 
              value={projectName}
              onChangeText={setProjectName}
            />
          </View>
          <View style={styles.field}>
            <GeistText secondary style={styles.label}>Framework Preset</GeistText>
            <GeistInput 
              value={framework}
              onChangeText={setFramework}
            />
          </View>
        </GeistCard>

        <GeistCard style={{ marginBottom: 24, padding: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <GeistText weight="500" style={{ fontSize: 16 }}>Build and Output Settings</GeistText>
            <ChevronDown size={20} color={theme.text} />
          </View>
          
          <View style={styles.field}>
            <GeistText secondary style={styles.label}>Build Command</GeistText>
            <View style={{ position: 'relative' }}>
              <Terminal size={18} color={theme.textSecondary} style={{ position: 'absolute', left: 12, top: 11, zIndex: 1 }} />
              <GeistInput 
                value={command}
                onChangeText={setCommand}
                mono
                style={{ paddingLeft: 40 }}
              />
            </View>
          </View>

          <View style={styles.field}>
            <GeistText secondary style={styles.label}>Output Directory</GeistText>
            <View style={{ position: 'relative' }}>
              <Folder size={18} color={theme.textSecondary} style={{ position: 'absolute', left: 12, top: 11, zIndex: 1 }} />
              <GeistInput 
                value={output}
                onChangeText={setOutput}
                mono
                style={{ paddingLeft: 40 }}
              />
            </View>
          </View>
        </GeistCard>

        <GeistCard style={{ marginBottom: 24, padding: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <GeistText weight="500" style={{ fontSize: 16 }}>Environment Variables</GeistText>
            <ChevronDown size={20} color={theme.text} />
          </View>
        </GeistCard>

        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
          <GeistButton title="Cancel" secondary onPress={() => setStep(1)} style={{ paddingHorizontal: 24 }} />
          <GeistButton 
            title={deploying ? "Deploying..." : "Deploy"} 
            onPress={handleDeploy}
            loading={deploying}
            style={{ paddingHorizontal: 24 }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 64,
  },
  header: {
    marginBottom: 32,
  },
  repoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  importButton: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
  }
});
