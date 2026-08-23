import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Share,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import {
  Download,
  Copy,
  Search,
  X,
  ArrowDown,
  Pause,
  Play,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
} from 'lucide-react-native';
import { GeistText, useTheme } from '../../../components/GeistUI';
import { Toast, ToastType } from '../../../components/Toast';
import { vercel } from '../../../api/vercel';
import {
  ParsedLogLine,
  LogLevel,
  parseRawLogs,
  MOCK_BUILD_LOGS,
  stripAnsi,
} from '../../../utils/logParser';

export default function BuildLogsScreen() {
  const { id, error } = useLocalSearchParams();
  const theme = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);

  // States
  const [logs, setLogs] = useState<ParsedLogLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(!error);
  const [autoScroll, setAutoScroll] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<LogLevel>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Toast state
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: ToastType }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ visible: true, message, type });
  };

  // Fetch real logs from Vercel API or generate live mock stream
  useEffect(() => {
    let isMounted = true;
    let pollTimer: any = null;

    async function fetchLogs() {
      if (error) {
        // Display specific error failure diagnostics
        const errStr = String(error);
        const errLogs: ParsedLogLine[] = [
          {
            id: 'err-1',
            index: 1,
            time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            rawText: `[error] Deployment failed for project: ${id}`,
            cleanText: `[error] Deployment failed for project: ${id}`,
            level: 'error',
          },
          {
            id: 'err-2',
            index: 2,
            time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            rawText: `Error: ${errStr}`,
            cleanText: `Error: ${errStr}`,
            level: 'error',
          },
          {
            id: 'err-3',
            index: 3,
            time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            rawText: `Diagnostic: Please check your Git repository permissions, project framework preset, or Vercel authentication token.`,
            cleanText: `Diagnostic: Please check your Git repository permissions, project framework preset, or Vercel authentication token.`,
            level: 'warn',
          },
        ];

        if (isMounted) {
          setLogs(errLogs);
          setLoading(false);
          setIsLive(false);
        }
        return;
      }

      try {
        if (!process.env.EXPO_PUBLIC_VERCEL_TOKEN) {
          runMockStream();
          return;
        }

        const result = await vercel.deployments.getDeploymentEvents({
          idOrUrl: id as string,
          direction: 'forward',
          limit: 200,
        });

        const events = (result as any) || [];
        const rawList = Array.isArray(events) ? events : events.events || [];

        if (rawList.length > 0) {
          const parsed = parseRawLogs(rawList);
          if (isMounted) {
            setLogs(parsed);
            setLoading(false);
          }
        } else {
          runMockStream();
        }
      } catch (err) {
        console.warn('Could not fetch remote events, using fallback stream:', err);
        runMockStream();
      }
    }

    function runMockStream() {
      if (!isMounted) return;
      setLoading(false);
      
      const accumulated: ParsedLogLine[] = [];
      MOCK_BUILD_LOGS.forEach((item, index) => {
        setTimeout(() => {
          if (!isMounted) return;
          const clean = stripAnsi(item.text);
          const line: ParsedLogLine = {
            id: `mock-${index}`,
            index: index + 1,
            time: new Date(Date.now() - (MOCK_BUILD_LOGS.length - index) * 1000).toLocaleTimeString('en-US', {
              hour12: false,
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }),
            rawText: item.text,
            cleanText: clean,
            level: clean.includes('Error')
              ? 'error'
              : clean.includes('Warn')
              ? 'warn'
              : clean.includes('✓') || clean.includes('Deployed')
              ? 'success'
              : 'info',
          };
          accumulated.push(line);
          setLogs([...accumulated]);

          if (index === MOCK_BUILD_LOGS.length - 1) {
            setIsLive(false);
          }
        }, item.delay);
      });
    }

    fetchLogs();

    return () => {
      isMounted = false;
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [id, error]);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && logs.length > 0) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [logs, autoScroll]);

  // Counts for each log level
  const counts = useMemo(() => {
    let errorCount = 0;
    let warnCount = 0;
    let infoCount = 0;

    logs.forEach((l) => {
      if (l.level === 'error') errorCount++;
      else if (l.level === 'warn') warnCount++;
      else infoCount++;
    });

    return { all: logs.length, error: errorCount, warn: warnCount, info: infoCount };
  }, [logs]);

  // Filtered and searched logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Level filter
      if (selectedFilter === 'error' && log.level !== 'error') return false;
      if (selectedFilter === 'warn' && log.level !== 'warn') return false;
      if (selectedFilter === 'info' && (log.level === 'error' || log.level === 'warn')) return false;

      // Search query
      if (searchQuery.trim()) {
        return log.cleanText.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    });
  }, [logs, selectedFilter, searchQuery]);

  // Copy all logs
  const handleCopyAll = async () => {
    const fullText = logs.map((l) => `[${l.time}] ${l.cleanText}`).join('\n');
    await Clipboard.setStringAsync(fullText);
    showToast(`Copied all ${logs.length} log lines to clipboard`);
  };

  // Copy single line
  const handleCopyLine = async (line: ParsedLogLine) => {
    await Clipboard.setStringAsync(line.cleanText);
    showToast(`Copied line #${line.index}`);
  };

  // Share logs
  const handleShare = async () => {
    const fullText = logs.map((l) => `[${l.time}] ${l.cleanText}`).join('\n');
    try {
      await Share.share({
        message: fullText,
        title: `Build Logs - ${id}`,
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Helper for rendering line text with search term highlighting
  const renderLogContent = (line: ParsedLogLine) => {
    const text = line.cleanText;

    let textColor = '#D4D4D4';
    if (line.level === 'error') textColor = '#F87171';
    else if (line.level === 'warn') textColor = '#FBBF24';
    else if (line.level === 'success') textColor = '#34D399';
    else if (text.startsWith('▲') || text.startsWith('Route (app)')) textColor = '#60A5FA';

    // If there's a search match, highlight matches
    if (searchQuery.trim()) {
      const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
      return (
        <GeistText mono style={{ fontSize: 12, lineHeight: 18 }}>
          {parts.map((part, i) =>
            part.toLowerCase() === searchQuery.toLowerCase() ? (
              <GeistText
                key={i}
                mono
                style={{
                  backgroundColor: '#F59E0B',
                  color: '#000000',
                  fontWeight: 'bold',
                  fontSize: 12,
                }}
              >
                {part}
              </GeistText>
            ) : (
              <GeistText key={i} mono style={{ color: textColor, fontSize: 12 }}>
                {part}
              </GeistText>
            )
          )}
        </GeistText>
      );
    }

    return (
      <GeistText mono style={{ color: textColor, fontSize: 12, lineHeight: 18 }}>
        {text}
      </GeistText>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      {/* Header section */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <GeistText weight="bold" style={{ fontSize: 22 }}>
                Build Logs
              </GeistText>
              {isLive ? (
                <View style={styles.liveBadge}>
                  <View style={styles.livePulse} />
                  <GeistText style={{ color: '#10B981', fontSize: 11, fontWeight: 'bold' }}>
                    LIVE
                  </GeistText>
                </View>
              ) : (
                <View style={[styles.statusBadge, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <CheckCircle2 size={12} color={theme.success} style={{ marginRight: 4 }} />
                  <GeistText secondary style={{ fontSize: 11 }}>Complete</GeistText>
                </View>
              )}
            </View>
            <GeistText secondary mono style={{ fontSize: 12 }} numberOfLines={1}>
              Deployment: {id}
            </GeistText>
          </View>

          {/* Action buttons */}
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.iconButton, { borderColor: theme.border, backgroundColor: theme.surface }]}
              onPress={() => setIsLive(!isLive)}
            >
              {isLive ? <Pause size={14} color={theme.text} /> : <Play size={14} color={theme.text} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.iconButton, { borderColor: theme.border, backgroundColor: theme.surface }]}
              onPress={handleCopyAll}
            >
              <Copy size={14} color={theme.text} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.iconButton, { borderColor: theme.border, backgroundColor: theme.surface }]}
              onPress={handleShare}
            >
              <Download size={14} color={theme.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchBar, { borderColor: theme.border, backgroundColor: theme.surface }]}>
          <Search size={16} color={theme.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search logs..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { color: theme.text }]}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={16} color={theme.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.filterPill,
              selectedFilter === 'all' && { backgroundColor: theme.text },
              { borderColor: theme.border },
            ]}
            onPress={() => setSelectedFilter('all')}
          >
            <GeistText
              weight="500"
              style={{
                fontSize: 12,
                color: selectedFilter === 'all' ? theme.background : theme.textSecondary,
              }}
            >
              All ({counts.all})
            </GeistText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPill,
              selectedFilter === 'error' && { backgroundColor: theme.error },
              { borderColor: theme.border },
            ]}
            onPress={() => setSelectedFilter('error')}
          >
            <AlertCircle
              size={12}
              color={selectedFilter === 'error' ? '#FFF' : theme.error}
              style={{ marginRight: 4 }}
            />
            <GeistText
              weight="500"
              style={{
                fontSize: 12,
                color: selectedFilter === 'error' ? '#FFF' : theme.textSecondary,
              }}
            >
              Errors ({counts.error})
            </GeistText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPill,
              selectedFilter === 'warn' && { backgroundColor: '#F5A623' },
              { borderColor: theme.border },
            ]}
            onPress={() => setSelectedFilter('warn')}
          >
            <AlertTriangle
              size={12}
              color={selectedFilter === 'warn' ? '#FFF' : '#F5A623'}
              style={{ marginRight: 4 }}
            />
            <GeistText
              weight="500"
              style={{
                fontSize: 12,
                color: selectedFilter === 'warn' ? '#FFF' : theme.textSecondary,
              }}
            >
              Warnings ({counts.warn})
            </GeistText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPill,
              selectedFilter === 'info' && { backgroundColor: theme.text },
              { borderColor: theme.border },
            ]}
            onPress={() => setSelectedFilter('info')}
          >
            <Info
              size={12}
              color={selectedFilter === 'info' ? theme.background : theme.textSecondary}
              style={{ marginRight: 4 }}
            />
            <GeistText
              weight="500"
              style={{
                fontSize: 12,
                color: selectedFilter === 'info' ? theme.background : theme.textSecondary,
              }}
            >
              Info ({counts.info})
            </GeistText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Terminal View */}
      <View style={styles.terminalWrapper}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.terminal}
          contentContainerStyle={{ paddingVertical: 12, paddingHorizontal: 12, paddingBottom: 64 }}
          indicatorStyle="white"
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#0070F3" />
              <GeistText mono style={{ color: '#888888', marginTop: 12, fontSize: 12 }}>
                Connecting to build server...
              </GeistText>
            </View>
          ) : filteredLogs.length === 0 ? (
            <View style={styles.loadingContainer}>
              <GeistText mono style={{ color: '#888888', fontSize: 12 }}>
                {searchQuery ? `No logs match "${searchQuery}"` : 'No logs found for selected filter.'}
              </GeistText>
            </View>
          ) : (
            filteredLogs.map((line) => (
              <TouchableOpacity
                key={line.id}
                activeOpacity={0.7}
                onPress={() => handleCopyLine(line)}
                style={styles.logRow}
              >
                {/* Line number gutter */}
                <GeistText
                  mono
                  style={{
                    color: '#4B5563',
                    width: 32,
                    textAlign: 'right',
                    fontSize: 11,
                    lineHeight: 18,
                  }}
                >
                  {line.index}
                </GeistText>

                {/* Timestamp */}
                <GeistText
                  mono
                  style={{
                    color: '#6B7280',
                    fontSize: 11,
                    lineHeight: 18,
                    width: 68,
                    textAlign: 'center',
                  }}
                >
                  {line.time}
                </GeistText>

                {/* Content */}
                <View style={{ flex: 1 }}>{renderLogContent(line)}</View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        {/* Floating Auto-Scroll Controls */}
        <View style={styles.floatingControls}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              setAutoScroll(!autoScroll);
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }}
            style={[
              styles.autoScrollButton,
              {
                backgroundColor: autoScroll ? '#0070F3' : '#222222',
                borderColor: autoScroll ? '#0070F3' : '#444444',
              },
            ]}
          >
            <ArrowDown size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
            <GeistText style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }}>
              {autoScroll ? 'Auto-scroll ON' : 'Scroll to Bottom'}
            </GeistText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#064E3B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
  },
  livePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
    borderWidth: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 0,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
  },
  terminalWrapper: {
    flex: 1,
    backgroundColor: '#000000',
    position: 'relative',
  },
  terminal: {
    flex: 1,
  },
  loadingContainer: {
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 2,
    borderRadius: 4,
  },
  floatingControls: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    zIndex: 10,
  },
  autoScrollButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
});
