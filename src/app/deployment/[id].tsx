import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { GeistText, GeistCard, StatusBadge, useTheme, GeistButton } from '../../components/GeistUI';
import { GitCommit, CheckCircle2, Circle } from 'lucide-react-native';

export default function DeploymentScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const theme = useTheme();

  // Progress sequence: 0 = Setup, 1 = Cloning, 2 = Building, 3 = Domains
  const [progressStep, setProgressStep] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setProgressStep(1), 1500); // 1.5s -> Cloning
    const t2 = setTimeout(() => setProgressStep(2), 3500); // 3.5s -> Building
    const t3 = setTimeout(() => {
      setProgressStep(3);
    }, 6500); // 6.5s -> Domains
    const t4 = setTimeout(() => {
      router.replace(`/deployment/${id}/success`);
    }, 8500); // 8.5s -> Success/Ready

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  const overallStatus = progressStep >= 3 ? 'Ready' : (progressStep === 0 ? 'Queued' : (progressStep === 1 ? 'Installing' : 'Building'));

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1, marginRight: 16 }}>
          <GeistText weight="bold" style={{ fontSize: 24, marginBottom: 8 }}>Deployment: {id}</GeistText>
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
            <GeistText secondary mono style={{ fontSize: 13 }}>Production</GeistText>
            <GeistText secondary>·</GeistText>
            <GitCommit size={14} color={theme.textSecondary} />
            <GeistText secondary mono style={{ fontSize: 13 }}>main</GeistText>
            <GeistText secondary>·</GeistText>
            <GeistText secondary mono style={{ fontSize: 13 }}>user</GeistText>
          </View>
        </View>
        <StatusBadge status={overallStatus} />
      </View>

      <GeistCard style={{ marginBottom: 24, padding: 0, overflow: 'hidden' }}>
        <View style={{ padding: 24, borderBottomWidth: 1, borderBottomColor: theme.border }}>
          <GeistText weight="600" style={{ fontSize: 18 }}>Build Progress</GeistText>
        </View>
        
        <View style={[styles.timeline, { paddingLeft: 40 }]}>
          {/* Step 0: Setup */}
          <View style={[styles.timelineItem, { borderLeftColor: theme.border }]}>
            {progressStep > 0 ? (
              <CheckCircle2 color={theme.success} size={24} style={[styles.icon, { backgroundColor: theme.card }]} />
            ) : (
              <ActivityIndicator size="small" color={theme.info} style={[styles.icon, { backgroundColor: theme.card }]} />
            )}
            <View style={styles.timelineContent}>
              <View style={styles.timelineRow}>
                <GeistText style={{ flex: 1 }} weight={progressStep === 0 ? "500" : "normal"}>System Setup</GeistText>
                {progressStep > 0 && <GeistText secondary mono style={{ fontSize: 12 }}>1s</GeistText>}
              </View>
            </View>
          </View>
          
          {/* Step 1: Cloning */}
          <View style={[styles.timelineItem, { borderLeftColor: theme.border }]}>
            {progressStep > 1 ? (
              <CheckCircle2 color={theme.success} size={24} style={[styles.icon, { backgroundColor: theme.card }]} />
            ) : progressStep === 1 ? (
              <ActivityIndicator size="small" color={theme.info} style={[styles.icon, { backgroundColor: theme.card }]} />
            ) : (
              <Circle color={theme.textSecondary} size={24} style={[styles.icon, { backgroundColor: theme.card }]} />
            )}
            <View style={[styles.timelineContent, progressStep < 1 && { opacity: 0.5 }]}>
              <View style={styles.timelineRow}>
                <GeistText style={{ flex: 1 }} weight={progressStep === 1 ? "500" : "normal"}>Cloning Repository</GeistText>
                {progressStep > 1 && <GeistText secondary mono style={{ fontSize: 12 }}>2s</GeistText>}
              </View>
            </View>
          </View>
          
          {/* Step 2: Building */}
          <View style={[styles.timelineItem, { borderLeftColor: theme.border }]}>
            {progressStep > 2 ? (
              <CheckCircle2 color={theme.success} size={24} style={[styles.icon, { backgroundColor: theme.card }]} />
            ) : progressStep === 2 ? (
              <ActivityIndicator size="small" color={theme.info} style={[styles.icon, { backgroundColor: theme.card }]} />
            ) : (
              <Circle color={theme.textSecondary} size={24} style={[styles.icon, { backgroundColor: theme.card }]} />
            )}
            <View style={[styles.timelineContent, progressStep < 2 && { opacity: 0.5 }]}>
              <View style={styles.timelineRow}>
                <GeistText style={{ flex: 1 }} weight={progressStep === 2 ? "500" : "normal"}>Building Options</GeistText>
                {progressStep === 2 && <GeistText mono style={{ fontSize: 12, color: theme.primary }}>Running...</GeistText>}
                {progressStep > 2 && <GeistText secondary mono style={{ fontSize: 12 }}>3s</GeistText>}
              </View>
              {progressStep === 2 && <GeistText secondary style={{ marginTop: 4, fontSize: 13 }}>Running build command 'npm run build'</GeistText>}
            </View>
          </View>
          
          {/* Step 3: Domains */}
          <View style={[styles.timelineItem, { borderLeftColor: 'transparent' }]}>
            {progressStep === 3 ? (
              <ActivityIndicator size="small" color={theme.info} style={[styles.icon, { backgroundColor: theme.card }]} />
            ) : progressStep > 3 ? (
              <CheckCircle2 color={theme.success} size={24} style={[styles.icon, { backgroundColor: theme.card }]} />
            ) : (
              <Circle color={theme.textSecondary} size={24} style={[styles.icon, { backgroundColor: theme.card }]} />
            )}
            <View style={[styles.timelineContent, progressStep < 3 && { opacity: 0.5 }]}>
              <View style={styles.timelineRow}>
                <GeistText style={{ flex: 1 }} weight={progressStep >= 3 ? "500" : "normal"}>Assigning Domains</GeistText>
              </View>
            </View>
          </View>
        </View>
      </GeistCard>

      <View style={{ flexDirection: 'row', gap: 16 }}>
        <GeistButton 
          title="View Build Logs" 
          onPress={() => router.push(`/deployment/${id}/logs`)}
          secondary
          style={{ flex: 1 }}
        />
        <GeistButton 
          title="Visit URL" 
          onPress={() => {}}
          secondary
          style={{ flex: 1, opacity: 0.5 }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  timeline: {
    padding: 24,
  },
  timelineItem: {
    borderLeftWidth: 2,
    paddingLeft: 24,
    paddingBottom: 32,
    position: 'relative',
  },
  icon: {
    position: 'absolute',
    left: -13, // center the 24px icon on the 2px border
    top: 0,
  },
  timelineContent: {
    flex: 1,
    marginTop: -2, // Align with icon
  },
  timelineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  }
});
