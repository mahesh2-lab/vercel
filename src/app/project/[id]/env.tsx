import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, TouchableOpacity, TextInput, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { GeistText, GeistCard, useTheme } from '../../../components/GeistUI';
import { Plus, Lock, Edit2, Trash2, EyeOff, Eye } from 'lucide-react-native';
import { vercel } from '../../../api/vercel';

export default function EnvScreen() {
  const { id } = useLocalSearchParams();
  const theme = useTheme();

  const [variables, setVariables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchEnvs() {
      try {
        if (!process.env.EXPO_PUBLIC_VERCEL_TOKEN) return;
        const result = await vercel.projects.filterProjectEnvs({ idOrName: id as string });
        const list = (result as any)?.envs || (result as any)?.object?.envs || result || [];
        setVariables(list);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchEnvs();
  }, [id]);

  const [showValues, setShowValues] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [showNewValue, setShowNewValue] = useState(false);

  const handleAdd = () => {
    if (newKey && newValue) {
      setVariables([{ key: newKey, value: newValue }, ...variables]);
      setNewKey('');
      setNewValue('');
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <GeistText weight="bold" style={{ fontSize: 24, marginBottom: 4 }}>Environment Variables</GeistText>
        <GeistText secondary>In order to provide your Deployment with Environment Variables at Build and Runtime, you may enter them right here.</GeistText>
      </View>

      <GeistCard style={{ padding: 24, marginBottom: 32 }}>
        <GeistText weight="600" style={{ fontSize: 18, marginBottom: 16 }}>Add New</GeistText>
        <View style={styles.formGrid}>
          <View style={styles.formCol}>
            <GeistText weight="500" style={{ fontSize: 14, marginBottom: 8 }}>Key</GeistText>
            <TextInput 
              placeholder="e.g. NEXT_PUBLIC_API_URL"
              placeholderTextColor={theme.textSecondary + '80'}
              value={newKey}
              onChangeText={setNewKey}
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              autoCapitalize="none"
            />
          </View>
          <View style={styles.formCol}>
            <GeistText weight="500" style={{ fontSize: 14, marginBottom: 8 }}>Value</GeistText>
            <View style={{ position: 'relative', justifyContent: 'center' }}>
              <TextInput 
                placeholder="e.g. https://api.example.com"
                placeholderTextColor={theme.textSecondary + '80'}
                value={newValue}
                onChangeText={setNewValue}
                secureTextEntry={!showNewValue}
                style={[styles.input, { borderColor: theme.border, color: theme.text, paddingRight: 40 }]}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                style={{ position: 'absolute', right: 12 }}
                onPress={() => setShowNewValue(!showNewValue)}
              >
                {showNewValue ? <EyeOff  size={18} color={theme.textSecondary} /> : <Eye  size={18} color={theme.textSecondary} />}
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 }}>
          <TouchableOpacity 
            style={[styles.saveBtn, { backgroundColor: theme.text }]}
            onPress={handleAdd}
          >
            <Plus size={18} color={theme.background} style={{ marginRight: 6 }} />
            <GeistText weight="500" style={{ color: theme.background }}>Save</GeistText>
          </TouchableOpacity>
        </View>
      </GeistCard>

      <GeistCard style={{ padding: 0, overflow: 'hidden' }}>
        <View style={[styles.listHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <GeistText weight="500" style={{ fontSize: 14 }}>{variables.length} Variables</GeistText>
          <TouchableOpacity onPress={() => setShowValues(!showValues)} style={styles.toggleBtn}>
            {showValues ? <EyeOff  size={16} color={theme.textSecondary} style={{ marginRight: 6 }} /> : <Eye  size={16} color={theme.textSecondary} style={{ marginRight: 6 }} />}
            <GeistText secondary style={{ fontSize: 14 }}>{showValues ? 'Hide Values' : 'Reveal Values'}</GeistText>
          </TouchableOpacity>
        </View>
        
        {loading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={theme.text} />
          </View>
        ) : variables.length === 0 ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <GeistText secondary>No environment variables found.</GeistText>
          </View>
        ) : (
          <View>
            {variables.map((v, i) => (
              <View key={i} style={[styles.envRow, { borderBottomColor: theme.border, borderBottomWidth: i === variables.length - 1 ? 0 : 1 }]}>
                <View style={{ flex: 1 }}>
                  <GeistText mono weight="500" style={{ marginBottom: 4 }}>{v.key}</GeistText>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Lock color={theme.textSecondary} size={14} style={{ marginRight: 6 }} />
                    <GeistText secondary mono={showValues} style={{ fontSize: 14, letterSpacing: showValues ? 0 : 2 }}>{showValues ? v.value : '••••••••••••••••••••••••'}</GeistText>
                  </View>
                </View>
                
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity style={styles.actionIconBtn}>
                    <Edit2 size={18} color={theme.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionIconBtn}>
                    <Trash2 size={18} color={theme.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </GeistCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  formGrid: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 16,
  },
  formCol: {
    flex: 1,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  envRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  actionIconBtn: {
    padding: 6,
    borderRadius: 4,
  }
});
