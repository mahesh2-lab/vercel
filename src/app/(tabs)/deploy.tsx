import { getCachedVercelToken } from '@/lib/vercel-token';
import {
  ScrollView,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import {
  siGithub,
  siNextdotjs,
  siVite,
  siAstro,
  siNuxt,
  siRemix,
  siSvelte,
  siGatsby,
  siReact,
  siVuedotjs,
  siAngular,
} from 'simple-icons';
import {
  Search,
  Lock,
  ChevronDown,
  ChevronUp,
  Terminal,
  Folder,
  RefreshCw,
  Code2,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  FileCode,
  AlertTriangle,
  FolderOpen,
  Sparkles,
  Check,
  X,
  CrossIcon,
  Cross,
} from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import {
  GeistText,
  GeistCard,
  useTheme,
  GeistButton,
  GeistInput,
  GeistSpinner,
} from '../../components/GeistUI';
import { Toast, ToastType } from '../../components/Toast';
import { useUserContext } from '../../context/UserContext';
import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { styles } from "../../styles/(tabs)/deploy.styles";

export interface GitRepository {
  id: string;
  name: string;
  fullName: string;
  private: boolean;
  updated: string;
  defaultBranch: string;
  language?: string;
  description?: string;
  url?: string;
}

export interface DeployEnvVar {
  id: string;
  key: string;
  value: string;
  targets: ('production' | 'preview' | 'development')[];
  isSecret?: boolean;
}

export interface FrameworkConfig {
  name: string;
  slug: string;
  command: string;
  output: string;
  iconPath: string;
  iconColor: string;
}

export const FRAMEWORK_PRESETS: FrameworkConfig[] = [
  { name: 'Next.js',         slug: 'nextjs',           command: 'npm run build', output: '.next',       iconPath: siNextdotjs.path, iconColor: '#000000' },
  { name: 'Vite',            slug: 'vite',             command: 'npm run build', output: 'dist',        iconPath: siVite.path,      iconColor: '#646CFF' },
  { name: 'Astro',           slug: 'astro',            command: 'npm run build', output: 'dist',        iconPath: siAstro.path,     iconColor: '#FF5D01' },
  { name: 'Nuxt.js',         slug: 'nuxtjs',           command: 'npm run build', output: '.output',     iconPath: siNuxt.path,      iconColor: '#00DC82' },
  { name: 'Remix',           slug: 'remix',            command: 'npm run build', output: 'build',       iconPath: siRemix.path,     iconColor: '#000000' },
  { name: 'SvelteKit',       slug: 'sveltekit',        command: 'npm run build', output: '.svelte-kit', iconPath: siSvelte.path,    iconColor: '#FF3E00' },
  { name: 'Gatsby',          slug: 'gatsby',           command: 'npm run build', output: 'public',      iconPath: siGatsby.path,    iconColor: '#663399' },
  { name: 'Create React App',slug: 'create-react-app', command: 'npm run build', output: 'build',       iconPath: siReact.path,     iconColor: '#61DAFB' },
  { name: 'Vue.js',          slug: 'vue',              command: 'npm run build', output: 'dist',        iconPath: siVuedotjs.path,  iconColor: '#42B883' },
  { name: 'Angular',         slug: 'angular',          command: 'npm run build', output: 'dist',        iconPath: siAngular.path,   iconColor: '#DD0031' },
  { name: 'Other',           slug: 'other',            command: 'npm run build', output: 'public',      iconPath: siGithub.path,    iconColor: '#888888' },
];

/** Tiny helper that renders a framework's simple-icon SVG */
export const FrameworkSvgIcon = ({ preset, size = 20, themeText }: { preset: FrameworkConfig; size?: number; themeText: string }) => {
  const color = preset.slug === 'nextjs' || preset.slug === 'remix' ? themeText : preset.iconColor;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d={preset.iconPath} />
    </Svg>
  );
};

// Robust .env parser
export function parseDotEnv(content: string): DeployEnvVar[] {
  const lines = content.split(/\r?\n/);
  const vars: DeployEnvVar[] = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line || line.startsWith('#')) continue;

    if (line.startsWith('export ')) {
      line = line.substring(7).trim();
    }

    const eqIdx = line.indexOf('=');
    if (eqIdx <= 0) continue;

    const rawKey = line.substring(0, eqIdx).trim();
    let rawVal = line.substring(eqIdx + 1).trim();

    if (
      (rawVal.startsWith('"') && rawVal.endsWith('"')) ||
      (rawVal.startsWith("'") && rawVal.endsWith("'"))
    ) {
      rawVal = rawVal.slice(1, -1);
    }

    if (rawKey) {
      vars.push({
        id: `${rawKey}_${Date.now()}_${i}`,
        key: rawKey,
        value: rawVal,
        targets: ['production', 'preview', 'development'],
        isSecret: true,
      });
    }
  }

  return vars;
}

export default function DeployScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user, activeScope } = useUserContext();

  const [step, setStep] = useState<1 | 2>(1);
  const [repos, setRepos] = useState<GitRepository[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [repoPage, setRepoPage] = useState(1);
  const [hasMoreRepos, setHasMoreRepos] = useState(true);
  const [loadingMoreRepos, setLoadingMoreRepos] = useState(false);
  const loadingMoreReposRef = useRef(false);

  // Step 2 configuration state
  const [selectedRepo, setSelectedRepo] = useState<GitRepository | null>(null);
  const [projectName, setProjectName] = useState('');
  const [framework, setFramework] = useState('Next.js');
  const [command, setCommand] = useState('npm run build');
  const [output, setOutput] = useState('.next');
  const [deploying, setDeploying] = useState(false);
  const [detectingFramework, setDetectingFramework] = useState(false);
  const [autoDetectedBadge, setAutoDetectedBadge] = useState<string | null>(null);
  const [frameworkModalOpen, setFrameworkModalOpen] = useState(false);

  // Environment Variables state
  const [envAccordionOpen, setEnvAccordionOpen] = useState(false);
  const [envVars, setEnvVars] = useState<DeployEnvVar[]>([]);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newTargets, setNewTargets] = useState<('production' | 'preview' | 'development')[]>([
    'production',
    'preview',
    'development',
  ]);
  const [showRawEnvInput, setShowRawEnvInput] = useState(false);
  const [rawEnvText, setRawEnvText] = useState('');
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});

  // Deployment Error & Toast state
  const [deployError, setDeployError] = useState<{
    message: string;
    code?: string;
    details?: string;
  } | null>(null);

  const [toast, setToast] = useState<{ visible: boolean; message: string; type: ToastType }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ visible: true, message, type });
  };

  const formatTimeAgo = (dateStr: string) => {
    const time = new Date(dateStr).getTime();
    if (isNaN(time)) return 'Recently';
    const diff = Math.floor((Date.now() - time) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return `${Math.floor(diff / 604800)}w ago`;
  };

  // Fetch repositories from GitHub / Vercel
  const fetchRepositories = useCallback(async (isPullToRefresh = false, loadMore = false, query = '') => {
    if (loadMore) {
      if (loadingMoreReposRef.current || !hasMoreRepos) return;
      loadingMoreReposRef.current = true;
      setLoadingMoreRepos(true);
    } else {
      if (isPullToRefresh) setRefreshing(true);
      else setLoading(true);
      setHasMoreRepos(true);
    }

    const token = getCachedVercelToken();
    const username = user?.username;

    let loadedRepos: GitRepository[] = [];
    const targetPage = loadMore ? repoPage + 1 : 1;
    const perPage = 10;

    try {
      if (username) {
        try {
          const trimmedQuery = query.trim();
          let endpoint = '';
          
          if (trimmedQuery) {
            // Search API
            endpoint = `https://api.github.com/search/repositories?q=${encodeURIComponent(trimmedQuery)}+user:${username}&sort=updated&per_page=${perPage}&page=${targetPage}`;
          } else {
            // User Repos API
            endpoint = `https://api.github.com/users/${username}/repos?sort=updated&per_page=${perPage}&page=${targetPage}`;
          }

          const ghRes = await fetch(endpoint);
          if (ghRes.ok) {
            const ghData = await ghRes.json();
            const list = trimmedQuery ? ghData.items : ghData;
            
            if (Array.isArray(list)) {
              loadedRepos = list.map((r: any) => ({
                id: String(r.id),
                name: r.name,
                fullName: r.full_name,
                private: Boolean(r.private),
                updated: formatTimeAgo(r.pushed_at || r.updated_at),
                defaultBranch: r.default_branch || 'main',
                language: r.language,
                description: r.description,
                url: r.html_url,
              }));
            }
          }
        } catch (ghErr) {
          console.warn('GitHub repositories fetch failed:', ghErr);
        }
      }

      // If loadMore, append. Else, replace.
      if (loadMore) {
        setRepos(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const uniqueList = loadedRepos.filter(p => !existingIds.has(p.id));
          return [...prev, ...uniqueList];
        });
        setRepoPage(targetPage);
      } else {
        setRepos(loadedRepos);
        setRepoPage(1);
      }

      if (loadedRepos.length < perPage) {
        setHasMoreRepos(false);
      } else {
        setHasMoreRepos(true);
      }

    } catch (err) {
      console.error('Error fetching repositories:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMoreRepos(false);
      loadingMoreReposRef.current = false;
    }
  }, [user?.username, repoPage, hasMoreRepos]);

  // Debounced Search Effect
  useEffect(() => {
    const timer = setTimeout(() => {
      // Re-fetch when searchQuery changes (pass false for isPullToRefresh and loadMore)
      fetchRepositories(false, false, searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]); // Note: removing fetchRepositories from dependencies here to prevent loops on page change

  const onRefresh = () => {
    fetchRepositories(true, false, searchQuery);
  };

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 400;
    
    if (isCloseToBottom && !loading && !loadingMoreReposRef.current && hasMoreRepos) {
      fetchRepositories(false, true, searchQuery);
    }
  };

  const filteredRepos = useMemo(() => {
    if (!searchQuery.trim()) return repos;
    const q = searchQuery.toLowerCase();
    return repos.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.fullName.toLowerCase().includes(q) ||
        r.language?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q)
    );
  }, [repos, searchQuery]);

  // Apply a preset configuration
  const applyPreset = (preset: FrameworkConfig) => {
    setFramework(preset.name);
    setCommand(preset.command);
    setOutput(preset.output);
  };

  // Intelligent Automatic Framework Detection
  const detectFrameworkFromRepo = async (repo: GitRepository) => {
    setDetectingFramework(true);
    let detectedPreset: FrameworkConfig | null = null;
    let customBuildScript: string | null = null;

    try {
      // 1. Attempt to fetch package.json from GitHub
      const branch = repo.defaultBranch || 'main';
      const pkgUrl = `https://raw.githubusercontent.com/${repo.fullName}/${branch}/package.json`;
      
      const pkgRes = await fetch(pkgUrl);
      if (pkgRes.ok) {
        const pkg = await pkgRes.json();
        const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
        
        if (pkg.scripts?.build) {
          customBuildScript = `npm run build`;
        }

        if (deps['next']) {
          detectedPreset = FRAMEWORK_PRESETS.find((p) => p.name === 'Next.js')!;
        } else if (deps['astro']) {
          detectedPreset = FRAMEWORK_PRESETS.find((p) => p.name === 'Astro')!;
        } else if (deps['@remix-run/react'] || deps['remix']) {
          detectedPreset = FRAMEWORK_PRESETS.find((p) => p.name === 'Remix')!;
        } else if (deps['nuxt'] || deps['nuxt3']) {
          detectedPreset = FRAMEWORK_PRESETS.find((p) => p.name === 'Nuxt.js')!;
        } else if (deps['@sveltejs/kit'] || deps['svelte']) {
          detectedPreset = FRAMEWORK_PRESETS.find((p) => p.name === 'SvelteKit')!;
        } else if (deps['gatsby']) {
          detectedPreset = FRAMEWORK_PRESETS.find((p) => p.name === 'Gatsby')!;
        } else if (deps['react-scripts']) {
          detectedPreset = FRAMEWORK_PRESETS.find((p) => p.name === 'Create React App')!;
        } else if (deps['vite']) {
          detectedPreset = FRAMEWORK_PRESETS.find((p) => p.name === 'Vite')!;
        } else if (deps['vue']) {
          detectedPreset = FRAMEWORK_PRESETS.find((p) => p.name === 'Vue.js')!;
        } else if (deps['@angular/core']) {
          detectedPreset = FRAMEWORK_PRESETS.find((p) => p.name === 'Angular')!;
        }
      }
    } catch (e) {
      console.warn('Direct package.json inspection error:', e);
    }

    // 2. Fallback heuristic detection using repository name & language
    if (!detectedPreset) {
      const nameLower = repo.name.toLowerCase();
      const langLower = (repo.language || '').toLowerCase();

      if (nameLower.includes('next')) {
        detectedPreset = FRAMEWORK_PRESETS.find((p) => p.name === 'Next.js')!;
      } else if (nameLower.includes('astro')) {
        detectedPreset = FRAMEWORK_PRESETS.find((p) => p.name === 'Astro')!;
      } else if (nameLower.includes('vite') || nameLower.includes('react')) {
        detectedPreset = FRAMEWORK_PRESETS.find((p) => p.name === 'Vite')!;
      } else if (nameLower.includes('nuxt') || nameLower.includes('vue')) {
        detectedPreset = FRAMEWORK_PRESETS.find((p) => p.name === 'Nuxt.js')!;
      } else if (nameLower.includes('remix')) {
        detectedPreset = FRAMEWORK_PRESETS.find((p) => p.name === 'Remix')!;
      } else if (nameLower.includes('svelte')) {
        detectedPreset = FRAMEWORK_PRESETS.find((p) => p.name === 'SvelteKit')!;
      } else if (nameLower.includes('gatsby')) {
        detectedPreset = FRAMEWORK_PRESETS.find((p) => p.name === 'Gatsby')!;
      } else if (langLower === 'html' || langLower === 'css') {
        detectedPreset = FRAMEWORK_PRESETS.find((p) => p.name === 'Other')!;
      } else {
        detectedPreset = FRAMEWORK_PRESETS.find((p) => p.name === 'Next.js')!;
      }
    }

    // Apply auto-detected configuration
    applyPreset(detectedPreset);
    if (customBuildScript) {
      setCommand(customBuildScript);
    }
    setAutoDetectedBadge(detectedPreset.name);
    setDetectingFramework(false);
  };

  const handleSelectRepo = async (repo: GitRepository) => {
    setSelectedRepo(repo);
    setProjectName(repo.name);
    setDeployError(null);
    setStep(2);

    await detectFrameworkFromRepo(repo);
  };

  // Environment variable handlers
  const handleAddEnvVar = () => {
    if (!newKey.trim()) {
      showToast('Please specify an environment variable key', 'error');
      return;
    }
    const cleanKey = newKey.trim().toUpperCase().replace(/\s+/g, '_');
    const existing = envVars.find((v) => v.key === cleanKey);
    if (existing) {
      showToast(`Variable ${cleanKey} is already defined`, 'error');
      return;
    }

    const created: DeployEnvVar = {
      id: `${cleanKey}_${Date.now()}`,
      key: cleanKey,
      value: newValue,
      targets: newTargets.length > 0 ? newTargets : ['production', 'preview', 'development'],
      isSecret: true,
    };

    setEnvVars([created, ...envVars]);
    setNewKey('');
    setNewValue('');
    showToast(`Added ${cleanKey}`, 'success');
  };

  const handleDeleteEnvVar = (id: string) => {
    setEnvVars(envVars.filter((v) => v.id !== id));
  };

  const handleToggleTarget = (target: 'production' | 'preview' | 'development') => {
    if (newTargets.includes(target)) {
      if (newTargets.length === 1) return;
      setNewTargets(newTargets.filter((t) => t !== target));
    } else {
      setNewTargets([...newTargets, target]);
    }
  };

  const handleParseRawEnv = () => {
    if (!rawEnvText.trim()) {
      showToast('Please paste .env content', 'error');
      return;
    }

    const parsed = parseDotEnv(rawEnvText);
    if (parsed.length === 0) {
      showToast('No valid KEY=VALUE pairs found in text', 'error');
      return;
    }

    const currentKeys = new Set(envVars.map((v) => v.key));
    const toAdd = parsed.filter((v) => !currentKeys.has(v.key));

    setEnvVars([...toAdd, ...envVars]);
    setRawEnvText('');
    setShowRawEnvInput(false);
    showToast(`Extracted ${toAdd.length} environment variables`, 'success');
  };

  const handleSelectEnvFromStorage = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      let fileContent = '';

      if (Platform.OS === 'web') {
        if (asset.file) {
          fileContent = await asset.file.text();
        } else if (asset.uri) {
          const res = await fetch(asset.uri);
          fileContent = await res.text();
        }
      } else {
        // Native Android / iOS File Manager storage access
        try {
          fileContent = await FileSystem.readAsStringAsync(asset.uri, {
            encoding: FileSystem.EncodingType.UTF8,
          });
        } catch {
          const res = await fetch(asset.uri);
          fileContent = await res.text();
        }
      }

      if (!fileContent || !fileContent.trim()) {
        showToast(`Selected file (${asset.name || '.env'}) is empty`, 'error');
        return;
      }

      const parsed = parseDotEnv(fileContent);
      if (parsed.length === 0) {
        showToast(`No valid KEY=VALUE pairs found in ${asset.name || 'file'}`, 'error');
        return;
      }

      const currentKeys = new Set(envVars.map((v) => v.key));
      const toAdd = parsed.filter((v) => !currentKeys.has(v.key));

      setEnvVars([...toAdd, ...envVars]);
      showToast(`Imported ${toAdd.length} variables from ${asset.name || '.env'}`, 'success');
    } catch (err: any) {
      console.error('DocumentPicker error:', err);
      showToast(`Failed to load file: ${err.message || 'Unknown error'}`, 'error');
    }
  };

  // Real Vercel Deployment Trigger
  const handleDeploy = async () => {
    setDeploying(true);
    setDeployError(null);

    const token = getCachedVercelToken();

    if (!token) {
      setDeploying(false);
      const errMsg = 'No Vercel token found. Please sign in with Vercel.';
      setDeployError({ message: errMsg, code: 'MISSING_AUTH_TOKEN' });
      showToast('Deployment Failed: Missing Token', 'error');
      return;
    }

    if (!selectedRepo) {
      setDeploying(false);
      const errMsg = 'No Git repository selected. Please go back to step 1 and choose a repository.';
      setDeployError({ message: errMsg, code: 'GIT_SOURCE_MISSING' });
      showToast('Git repository missing', 'error');
      return;
    }

    try {
      const queryParam = activeScope?.type === 'team' ? `?teamId=${activeScope.id}` : '';
      const cleanProjectName = (projectName || selectedRepo.name)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-_]/g, '-');

      const repoFullName = selectedRepo.fullName.includes('/')
        ? selectedRepo.fullName
        : `${user?.username || 'user'}/${selectedRepo.name}`;

      const matchedConfig = FRAMEWORK_PRESETS.find((p) => p.name === framework);
      const frameworkSlug = matchedConfig ? matchedConfig.slug : framework.toLowerCase().replace(/[^a-z0-9]/g, '');

      // 1. Create or sync project on Vercel
      try {
        const { createProject } = require('../../lib/vercel-api');
        await createProject(queryParam, {
          name: cleanProjectName,
          framework: frameworkSlug === 'other' ? null : frameworkSlug,
          buildCommand: command,
          outputDirectory: output,
          gitRepository: {
            type: 'github',
            repo: repoFullName,
          },
          environmentVariables: envVars.map((v) => ({
            key: v.key,
            value: v.value,
            target: v.targets,
            type: 'encrypted',
          })),
        });
      } catch (projErr) {
        console.warn('Project creation/sync info:', projErr);
      }

      // 2. Build gitSource payload
      const gitSourcePayload: any = {
        type: 'github',
        repo: repoFullName,
        ref: selectedRepo.defaultBranch || 'main',
      };

      if (selectedRepo.id && !isNaN(Number(selectedRepo.id))) {
        gitSourcePayload.repoId = Number(selectedRepo.id);
      }

      const deploymentPayload: any = {
        name: cleanProjectName,
        projectSettings: {
          framework: frameworkSlug === 'other' ? null : frameworkSlug,
          buildCommand: command,
          outputDirectory: output,
        },
        gitSource: gitSourcePayload,
      };

      if (envVars.length > 0) {
        deploymentPayload.env = envVars.reduce((acc, item) => {
          acc[item.key] = item.value;
          return acc;
        }, {} as Record<string, string>);
      }

      // 3. Trigger Deployment via Vercel API
      const { createDeployment } = require('../../lib/vercel-api');
      const res = await createDeployment(queryParam, deploymentPayload);

      const responseData = await res.json();

      if (!res.ok) {
        let errorMsg =
          responseData?.error?.message ||
          responseData?.message ||
          `Vercel API error (${res.status}): ${res.statusText}`;

        let errorCode = responseData?.error?.code || responseData?.code || 'DEPLOYMENT_FAILED';

        if (
          errorCode.toLowerCase().includes('git') ||
          errorMsg.toLowerCase().includes('git') ||
          errorMsg.toLowerCase().includes('source')
        ) {
          errorMsg = `Git source "${repoFullName}" is not connected to Vercel. Please ensure the Vercel GitHub App has access to this repository, or connect it in your Vercel dashboard.`;
          errorCode = 'GIT_SOURCE_NOT_CONNECTED';
        }

        setDeployError({
          message: errorMsg,
          code: errorCode,
          details: JSON.stringify(responseData, null, 2),
        });

        showToast(`Deployment Failed: ${errorCode}`, 'error');
        setDeploying(false);
        return;
      }

      showToast('Deployment Initiated Successfully!', 'success');
      const deploymentId = responseData.id || responseData.uid || cleanProjectName;

      setTimeout(() => {
        setDeploying(false);
        router.push(`/deployment/${deploymentId}`);
      }, 500);
    } catch (err: any) {
      console.error('Deployment error:', err);
      const errMsg = err.message || 'An unexpected network error occurred while deploying.';
      setDeployError({
        message: errMsg,
        code: 'NETWORK_OR_CLIENT_ERROR',
      });
      showToast('Deployment Failed: Network Error', 'error');
      setDeploying(false);
    }
  };

  if (step === 1) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast((t) => ({ ...t, visible: false }))}
        />
        <ScrollView
          contentContainerStyle={styles.container}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.text}
            />
          }
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <View style={styles.header}>
            <GeistText weight="bold" style={{ fontSize: 28, marginBottom: 8 }}>
              Import Git Repository
            </GeistText>
            <GeistText secondary>
              {user?.username
                ? `Repositories connected for @${user.username}`
                : 'Select a repository to deploy to your account.'}
            </GeistText>
          </View>

          <GeistCard
            style={{
              padding: 0,
              overflow: 'hidden',
              marginBottom: 24,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            {/* Search and Refresh Bar */}
            <View
              style={{
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: theme.border,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 }}>
                <Search size={18} color={theme.textSecondary} style={{ marginRight: 10 }} />
                <GeistInput
                  placeholder="Search repositories..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={{
                    borderWidth: 0,
                    backgroundColor: 'transparent',
                    paddingVertical: 0,
                    paddingHorizontal: 0,
                    flex: 1,
                    fontSize: 15,
                  }}
                />
              </View>
              <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
                <X size={16} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Repositories List */}
            {loading ? (
              <View style={{ padding: 48, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="small" color={theme.text} />
                <GeistText secondary style={{ marginTop: 12, fontSize: 13 }}>
                  Fetching repositories...
                </GeistText>
              </View>
            ) : repos.length === 0 ? (
              <View style={{ padding: 48, alignItems: 'center', justifyContent: 'center' }}>
                <GeistText secondary style={{ fontSize: 14 }}>
                  {searchQuery ? `No repositories match "${searchQuery}"` : 'No repositories found.'}
                </GeistText>
              </View>
            ) : (
              <View>
                {repos.map((repo, idx) => (
                  <View
                    key={repo.id}
                    style={{
                      borderBottomWidth: idx === repos.length - 1 ? 0 : 1,
                      borderBottomColor: theme.border,
                    }}
                  >
                    <TouchableOpacity
                      style={styles.repoRow}
                      activeOpacity={0.7}
                      onPress={() => handleSelectRepo(repo)}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 16 }}>
                        <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ marginRight: 14 }}>
                          <Path d={siGithub.path} fill={theme.text} />
                        </Svg>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                            <GeistText weight="500" style={{ fontSize: 15 }}>
                              {repo.name}
                            </GeistText>
                            {repo.private && (
                              <Lock size={12} color={theme.textSecondary} />
                            )}
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                            {repo.language ? (
                              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Code2 size={12} color={theme.textSecondary} style={{ marginRight: 4 }} />
                                <GeistText secondary style={{ fontSize: 12 }}>
                                  {repo.language}
                                </GeistText>
                                <GeistText secondary style={{ marginHorizontal: 4 }}>·</GeistText>
                              </View>
                            ) : null}
                            <GeistText secondary style={{ fontSize: 12 }}>
                              Updated {repo.updated}
                            </GeistText>
                          </View>
                        </View>
                      </View>

                      <View style={[styles.importButton, { borderColor: theme.border, backgroundColor: theme.surface }]}>
                        <GeistText weight="500" style={{ fontSize: 13 }}>
                          Import
                        </GeistText>
                      </View>
                    </TouchableOpacity>
                  </View>
                ))}
                
                {loadingMoreRepos && (
                  <View style={{ padding: 20, alignItems: 'center' }}>
                    <ActivityIndicator size="small" color={theme.text} />
                  </View>
                )}
              </View>
            )}
          </GeistCard>
        </ScrollView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: theme.background }}
    >
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast((t) => ({ ...t, visible: false }))}
      />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setStep(1)} style={{ marginBottom: 16 }}>
            <GeistText secondary>← Back to repositories</GeistText>
          </TouchableOpacity>
          <GeistText weight="bold" style={{ fontSize: 24 }}>
            Configure Project
          </GeistText>
          {selectedRepo && (
            <GeistText secondary style={{ marginTop: 4 }}>
              Importing from {selectedRepo.fullName} (branch: {selectedRepo.defaultBranch})
            </GeistText>
          )}
        </View>

        {/* Project & Framework preset */}
        <GeistCard style={{ marginBottom: 24, padding: 24 }}>
          <View style={styles.field}>
            <GeistText secondary style={styles.label}>
              Project Name
            </GeistText>
            <GeistInput value={projectName} onChangeText={setProjectName} />
          </View>

          {/* Framework Preset with Auto-Detection & Dropdown */}
          <View style={styles.field}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <GeistText secondary style={styles.label}>
                Framework Preset
              </GeistText>
              {detectingFramework ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <ActivityIndicator size="small" color="#0070F3" />
                  <GeistText mono style={{ fontSize: 11, color: '#0070F3' }}>
                    Auto-detecting...
                  </GeistText>
                </View>
              ) : autoDetectedBadge ? (
                <View style={[styles.autoBadge, { backgroundColor: '#0070F315', borderColor: '#0070F3' }]}>
                  <Sparkles size={11} color="#0070F3" style={{ marginRight: 4 }} />
                  <GeistText weight="600" style={{ fontSize: 11, color: '#0070F3' }}>
                    Auto-Detected
                  </GeistText>
                </View>
              ) : null}
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setFrameworkModalOpen(true)}
              style={[
                styles.frameworkSelectorBtn,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {(() => {
                  const preset = FRAMEWORK_PRESETS.find((p) => p.name === framework);
                  return preset ? <FrameworkSvgIcon preset={preset} size={18} themeText={theme.text} /> : null;
                })()}
                <GeistText weight="500" style={{ fontSize: 14 }}>
                  {framework}
                </GeistText>
              </View>
              <ChevronDown size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
        </GeistCard>

        {/* Build & Output Settings */}
        <GeistCard style={{ marginBottom: 24, padding: 24 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 24,
            }}
          >
            <GeistText weight="500" style={{ fontSize: 16 }}>
              Build and Output Settings
            </GeistText>
            <ChevronDown size={20} color={theme.text} />
          </View>

          <View style={styles.field}>
            <GeistText secondary style={styles.label}>
              Build Command
            </GeistText>
            <View style={{ position: 'relative' }}>
              <Terminal
                size={18}
                color={theme.textSecondary}
                style={{ position: 'absolute', left: 12, top: 11, zIndex: 1 }}
              />
              <GeistInput
                value={command}
                onChangeText={setCommand}
                mono
                style={{ paddingLeft: 40 }}
              />
            </View>
          </View>

          <View style={styles.field}>
            <GeistText secondary style={styles.label}>
              Output Directory
            </GeistText>
            <View style={{ position: 'relative' }}>
              <Folder
                size={18}
                color={theme.textSecondary}
                style={{ position: 'absolute', left: 12, top: 11, zIndex: 1 }}
              />
              <GeistInput
                value={output}
                onChangeText={setOutput}
                mono
                style={{ paddingLeft: 40 }}
              />
            </View>
          </View>
        </GeistCard>

        {/* Environment Variables Accordion */}
        <GeistCard style={{ marginBottom: 24, padding: 0, overflow: 'hidden' }}>
          <TouchableOpacity
            style={{
              padding: 20,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: theme.surface,
            }}
            activeOpacity={0.7}
            onPress={() => setEnvAccordionOpen(!envAccordionOpen)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <FileCode size={18} color={theme.text} />
              <GeistText weight="600" style={{ fontSize: 16 }}>
                Environment Variables
              </GeistText>
              {envVars.length > 0 && (
                <View
                  style={{
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                    borderWidth: 1,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 12,
                  }}
                >
                  <GeistText weight="500" style={{ fontSize: 12 }}>
                    {envVars.length}
                  </GeistText>
                </View>
              )}
            </View>
            {envAccordionOpen ? (
              <ChevronUp size={20} color={theme.text} />
            ) : (
              <ChevronDown size={20} color={theme.text} />
            )}
          </TouchableOpacity>

          {envAccordionOpen && (
            <View style={{ padding: 20, borderTopWidth: 1, borderTopColor: theme.border }}>
              <GeistText secondary style={{ fontSize: 13, marginBottom: 16 }}>
                In order to provide your deployment with environment variables at build or runtime, specify them below.
              </GeistText>

              {/* Action Buttons: Select .env from Storage / Paste Raw Text */}
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                <TouchableOpacity
                  style={[
                    styles.envActionBtn,
                    {
                      borderColor: '#0070F3',
                      backgroundColor: '#0070F314',
                    },
                  ]}
                  onPress={handleSelectEnvFromStorage}
                  activeOpacity={0.7}
                >
                  <FolderOpen size={15} color="#0070F3" style={{ marginRight: 6 }} />
                  <GeistText weight="600" style={{ fontSize: 13, color: '#0070F3' }}>
                    Select .env from File Manager
                  </GeistText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.envActionBtn, { borderColor: theme.border, backgroundColor: theme.surface }]}
                  onPress={() => setShowRawEnvInput(!showRawEnvInput)}
                  activeOpacity={0.7}
                >
                  <FileCode size={14} color={theme.text} style={{ marginRight: 6 }} />
                  <GeistText weight="500" style={{ fontSize: 13 }}>
                    {showRawEnvInput ? 'Hide .env Box' : 'Paste .env Raw Text'}
                  </GeistText>
                </TouchableOpacity>
              </View>

              {/* Bulk .env Paste Box */}
              {showRawEnvInput && (
                <View
                  style={{
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    borderWidth: 1,
                    borderRadius: 8,
                    padding: 14,
                    marginBottom: 20,
                  }}
                >
                  <GeistText weight="600" style={{ fontSize: 13, marginBottom: 6 }}>
                    Paste .env File Content
                  </GeistText>
                  <TextInput
                    multiline
                    numberOfLines={4}
                    value={rawEnvText}
                    onChangeText={setRawEnvText}
                    placeholder={`DATABASE_URL="postgres://..."\nNEXT_PUBLIC_API_URL="https://api.example.com"`}
                    placeholderTextColor={theme.textSecondary}
                    style={[
                      styles.rawEnvInput,
                      {
                        color: theme.text,
                        borderColor: theme.border,
                        backgroundColor: theme.background,
                      },
                    ]}
                  />
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
                    <GeistButton
                      title="Extract & Add Variables"
                      onPress={handleParseRawEnv}
                      style={{ paddingHorizontal: 16 }}
                    />
                  </View>
                </View>
              )}

              {/* Manual Entry Form */}
              <View
                style={{
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  borderWidth: 1,
                  borderRadius: 8,
                  padding: 16,
                  marginBottom: 20,
                }}
              >
                <GeistText weight="600" style={{ fontSize: 14, marginBottom: 12 }}>
                  Add Variable Manually
                </GeistText>

                <View style={{ gap: 12 }}>
                  <View>
                    <GeistText secondary style={{ fontSize: 12, marginBottom: 4 }}>
                      Key
                    </GeistText>
                    <GeistInput
                      value={newKey}
                      onChangeText={setNewKey}
                      placeholder="e.g. NEXT_PUBLIC_API_URL"
                      mono
                      autoCapitalize="characters"
                    />
                  </View>

                  <View>
                    <GeistText secondary style={{ fontSize: 12, marginBottom: 4 }}>
                      Value
                    </GeistText>
                    <GeistInput
                      value={newValue}
                      onChangeText={setNewValue}
                      placeholder="e.g. https://api.example.com"
                      mono
                    />
                  </View>

                  {/* Target Environment Selectors */}
                  <View>
                    <GeistText secondary style={{ fontSize: 12, marginBottom: 6 }}>
                      Target Environments
                    </GeistText>
                    <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                      {(['production', 'preview', 'development'] as const).map((t) => {
                        const active = newTargets.includes(t);
                        return (
                          <TouchableOpacity
                            key={t}
                            activeOpacity={0.7}
                            onPress={() => handleToggleTarget(t)}
                            style={[
                              styles.targetPill,
                              {
                                backgroundColor: active ? theme.text : theme.surface,
                                borderColor: theme.border,
                              },
                            ]}
                          >
                            <GeistText
                              weight="500"
                              style={{
                                fontSize: 12,
                                color: active ? theme.background : theme.textSecondary,
                                textTransform: 'capitalize',
                              }}
                            >
                              {t}
                            </GeistText>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 4 }}>
                    <TouchableOpacity
                      style={[styles.addBtn, { backgroundColor: theme.text }]}
                      onPress={handleAddEnvVar}
                    >
                      <Plus size={14} color={theme.background} style={{ marginRight: 4 }} />
                      <GeistText weight="600" style={{ color: theme.background, fontSize: 13 }}>
                        Add Variable
                      </GeistText>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Configured Variables List */}
              {envVars.length > 0 ? (
                <View style={{ borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 16 }}>
                  <GeistText weight="600" style={{ fontSize: 14, marginBottom: 12 }}>
                    Configured Variables ({envVars.length})
                  </GeistText>

                  {envVars.map((item) => {
                    const isVisible = showValues[item.id];
                    return (
                      <View
                        key={item.id}
                        style={[
                          styles.envRow,
                          {
                            borderColor: theme.border,
                            backgroundColor: theme.surface,
                          },
                        ]}
                      >
                        <View style={{ flex: 1, marginRight: 8 }}>
                          <GeistText weight="600" mono style={{ fontSize: 13, marginBottom: 2 }}>
                            {item.key}
                          </GeistText>
                          <GeistText secondary mono style={{ fontSize: 12 }}>
                            {isVisible ? item.value : '••••••••••••••••'}
                          </GeistText>

                          <View style={{ flexDirection: 'row', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                            {item.targets.map((t) => (
                              <View
                                key={t}
                                style={{
                                  backgroundColor: theme.card,
                                  borderColor: theme.border,
                                  borderWidth: 1,
                                  paddingHorizontal: 6,
                                  paddingVertical: 1,
                                  borderRadius: 4,
                                }}
                              >
                                <GeistText secondary style={{ fontSize: 10, textTransform: 'capitalize' }}>
                                  {t}
                                </GeistText>
                              </View>
                            ))}
                          </View>
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <TouchableOpacity
                            onPress={() =>
                              setShowValues({
                                ...showValues,
                                [item.id]: !isVisible,
                              })
                            }
                            style={{ padding: 6 }}
                          >
                            {isVisible ? (
                              <EyeOff size={16} color={theme.textSecondary} />
                            ) : (
                              <Eye size={16} color={theme.textSecondary} />
                            )}
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => handleDeleteEnvVar(item.id)}
                            style={{ padding: 6 }}
                          >
                            <Trash2 size={16} color={theme.error} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </View>
              ) : null}
            </View>
          )}
        </GeistCard>

        {/* Deployment Failure Alert Banner */}
        {deployError && (
          <View
            style={[
              styles.errorCard,
              {
                borderColor: theme.error,
                backgroundColor: theme.error + '12',
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
              <AlertTriangle size={20} color={theme.error} style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <GeistText weight="bold" style={{ color: theme.error, fontSize: 15, marginBottom: 4 }}>
                  Deployment Failed {deployError.code ? `(${deployError.code})` : ''}
                </GeistText>
                <GeistText style={{ fontSize: 13, color: theme.text, marginBottom: 12 }}>
                  {deployError.message}
                </GeistText>

                <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
                  <TouchableOpacity
                    style={[styles.errorActionBtn, { borderColor: theme.error, backgroundColor: theme.surface }]}
                    onPress={() => {
                      router.push({
                        pathname: `/deployment/${projectName}/logs` as any,
                        params: { error: deployError.message },
                      });
                    }}
                  >
                    <GeistText weight="600" style={{ color: theme.error, fontSize: 12 }}>
                      View Failure Logs →
                    </GeistText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.errorActionBtn, { borderColor: theme.border, backgroundColor: theme.surface }]}
                    onPress={handleDeploy}
                  >
                    <GeistText weight="600" style={{ fontSize: 12 }}>
                      Retry Deployment
                    </GeistText>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Deploy & Cancel Action Row */}
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
          <GeistButton
            title="Cancel"
            secondary
            onPress={() => setStep(1)}
            style={{ paddingHorizontal: 24 }}
          />
          <GeistButton
            title={deploying ? 'Deploying to Vercel...' : 'Deploy'}
            onPress={handleDeploy}
            loading={deploying}
            style={{ paddingHorizontal: 24 }}
          />
        </View>
      </ScrollView>

      {/* Framework Selection Modal */}
      <Modal
        visible={frameworkModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setFrameworkModalOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setFrameworkModalOpen(false)}
        >
          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <GeistText weight="600" style={{ fontSize: 16 }}>
                Select Framework Preset
              </GeistText>
              <TouchableOpacity onPress={() => setFrameworkModalOpen(false)}>
                <X size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 360, padding: 12 }}>
              {FRAMEWORK_PRESETS.map((preset) => {
                const isSelected = framework === preset.name;
                return (
                  <TouchableOpacity
                    key={preset.name}
                    style={[
                      styles.frameworkOption,
                      {
                        backgroundColor: isSelected ? theme.surface : 'transparent',
                        borderColor: isSelected ? theme.border : 'transparent',
                      },
                    ]}
                    activeOpacity={0.7}
                    onPress={() => {
                      applyPreset(preset);
                      setAutoDetectedBadge(null);
                      setFrameworkModalOpen(false);
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                      <FrameworkSvgIcon preset={preset} size={20} themeText={theme.text} />
                       <View>
                        <GeistText weight="500" style={{ fontSize: 14 }}>
                          {preset.name}
                        </GeistText>
                        <GeistText secondary mono style={{ fontSize: 11 }}>
                          Output: {preset.output}
                        </GeistText>
                      </View>
                    </View>
                    {isSelected && <Check size={16} color={theme.success} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}


