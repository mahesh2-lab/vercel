import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { GeistText, useTheme, GeistButton } from '../../../components/GeistUI';
import { CheckCircle2, Copy } from 'lucide-react-native';
import { vercel } from '../../../api/vercel';
import * as Clipboard from 'expo-clipboard';
import { getCachedVercelToken } from '../../../lib/vercel-token';

export default function DeploymentSuccessScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const theme = useTheme();

  const [deployment, setDeployment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDeployment() {
      try {
        if (!getCachedVercelToken()) return;
        const result = await vercel.deployments.getDeployment({ idOrUrl: id as string });
        setDeployment((result as any)?.deployment || result);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchDeployment();
  }, [id]);

  const url = deployment?.url || `${id}.vercel.app`;
  const fullUrl = `https://${url}`;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: 'Success', headerShown: false }} />
      
      {loading ? (
        <View style={styles.content}>
          <ActivityIndicator size="large" color={theme.text} />
        </View>
      ) : (
        <View style={styles.content}>
          <CheckCircle2 color={theme.success} size={64} style={{ marginBottom: 24 }} />
          
          <GeistText weight="bold" style={{ fontSize: 32, marginBottom: 8, textAlign: 'center' }}>
            Congratulations!
          </GeistText>
          <GeistText secondary style={{ fontSize: 16, textAlign: 'center', marginBottom: 32 }}>
            Your project was successfully deployed.
          </GeistText>

          <TouchableOpacity 
            style={[styles.urlChip, { backgroundColor: theme.surface, borderColor: theme.border }]}
            activeOpacity={0.7}
            onPress={() => {
              Clipboard.setStringAsync(fullUrl);
            }}
          >
            <GeistText mono style={{ marginRight: 12 }}>{url}</GeistText>
            <Copy color={theme.textSecondary} size={16} />
          </TouchableOpacity>

          {/* Mock Preview Screenshot (Still useful as a visual placeholder) */}
          <View style={[styles.previewCard, { borderColor: theme.border }]}>
            <View style={[styles.browserBar, { borderBottomColor: theme.border, backgroundColor: theme.surface }]}>
              <View style={styles.browserDot} />
              <View style={styles.browserDot} />
              <View style={styles.browserDot} />
            </View>
            <View style={styles.previewContent}>
              <GeistText weight="bold" style={{ fontSize: 24, marginBottom: 8 }}>Vercel</GeistText>
              <View style={[styles.mockSkeleton, { backgroundColor: theme.border, width: '60%' }]} />
              <View style={[styles.mockSkeleton, { backgroundColor: theme.border, width: '40%' }]} />
            </View>
          </View>

          <View style={styles.actions}>
            <GeistButton 
              title="Visit" 
              onPress={() => Linking.openURL(fullUrl)} 
              style={{ marginBottom: 12 }} 
            />
            <GeistButton 
              title="Back to Dashboard" 
              secondary 
              onPress={() => router.replace('/')} 
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  urlChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 99,
    borderWidth: 1,
    marginBottom: 40,
  },
  previewCard: {
    width: '100%',
    aspectRatio: 16/9,
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 40,
  },
  browserBar: {
    height: 24,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 6,
  },
  browserDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EAEAEA', // Will be subtle on both themes
  },
  previewContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  mockSkeleton: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  actions: {
    width: '100%',
  }
});
