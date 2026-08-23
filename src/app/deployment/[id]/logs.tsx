import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { GeistText, useTheme } from "../../../components/GeistUI";
import { ArrowLeft, Download, Copy } from "lucide-react-native";
import { vercel } from "../../../api/vercel";

export default function BuildLogsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const theme = useTheme();

  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        if (!process.env.EXPO_PUBLIC_VERCEL_TOKEN) return;
        const result = await vercel.deployments.getDeploymentEvents({
          idOrUrl: id as string,
          direction: "forward",
          limit: 100,
        });
        const events = (result as any) || [];
        
        const list = Array.isArray(events) ? events : events.events || [];

        // Let's map them to our UI format
        const formattedLogs = list.map((event: any) => ({
          time: new Date(
            event.date || event.created || Date.now(),
          ).toLocaleTimeString("en-US", { hour12: false }),
          text: event.payload?.text || event.text || JSON.stringify(event),
          type: event.type,
        }));

        setLogs(formattedLogs);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, [id]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View style={{ width: "100%" }}>
          <GeistText weight="bold" style={{ fontSize: 24, marginBottom: 4 }}>
            Build Logs
          </GeistText>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <GeistText secondary mono style={{ fontSize: 13 }}>
              Deployment:{" "}
            </GeistText>
            <GeistText
              secondary
              mono
              style={{ fontSize: 13, flexShrink: 1 }}
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {id}
            </GeistText>
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: theme.border }]}
          >
            <Download size={16} color={theme.text} style={{ marginRight: 8 }} />
            <GeistText weight="500">Download</GeistText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: theme.border }]}
          >
            <Copy size={16} color={theme.text} style={{ marginRight: 8 }} />
            <GeistText weight="500">Copy</GeistText>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.terminalContainer}>
        <ScrollView
          style={styles.terminal}
          contentContainerStyle={{ padding: 16 }}
          indicatorStyle="white"
        >
          {loading ? (
            <View style={{ padding: 40, alignItems: "center" }}>
              <ActivityIndicator size="small" color="#888" />
              <GeistText
                mono
                style={{ color: "#888", marginTop: 12, fontSize: 12 }}
              >
                Connecting to deployment logs...
              </GeistText>
            </View>
          ) : logs.length === 0 ? (
            <View style={{ padding: 40, alignItems: "center" }}>
              <GeistText mono style={{ color: "#888", fontSize: 12 }}>
                No logs available for this deployment.
              </GeistText>
            </View>
          ) : (
            logs.map((line, index) => (
              <View
                key={index}
                style={{ flexDirection: "row", marginBottom: 4, gap: 16 }}
              >
                <GeistText
                  mono
                  style={{
                    color: "#888888",
                    width: 24,
                    textAlign: "right",
                    fontSize: 11,
                    lineHeight: 16,
                  }}
                >
                  {index + 1}
                </GeistText>
                <GeistText
                  mono
                  style={{ color: "#3399FF", fontSize: 11, lineHeight: 16 }}
                >
                  [{line.time}]
                </GeistText>
                <GeistText
                  mono
                  style={{
                    color: "#EDEDED",
                    flex: 1,
                    fontSize: 11,
                    lineHeight: 16,
                  }}
                >
                  {line.text}
                </GeistText>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxWidth: 1200,
    width: "100%",
    alignSelf: "center",
  },
  header: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginBottom: 24,
    gap: 16,
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 6,
  },
  terminalContainer: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    borderTopWidth: 1,
    borderColor: "#333333",
  },
  terminal: {
    flex: 1,
  },
});
