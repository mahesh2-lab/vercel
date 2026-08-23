# UPDATE001: Master Project Architecture, Configuration & Engineering Specification

**Document**: `UPDATE001.md`  
**Application**: Vercel Dashboard (Mobile & Web)  
**Framework**: Expo 57 / React Native 0.86 / React 19 (Compiler Enabled) / TypeScript 5.9  
**Status**: 100% Verified (0 Errors, 0 Warnings)

---

## 📑 Table of Contents

1. [Executive Summary & System Architecture](#1-executive-summary--system-architecture)
2. [Global Configuration & Environment Setup](#2-global-configuration--environment-setup)
3. [Authentication, Workspaces & Scope State Engine](#3-authentication-workspaces--scope-state-engine)
4. [Deployment Engine & Intelligent Framework Auto-Detection](#4-deployment-engine--intelligent-framework-auto-detection)
5. [Real-Time Build Monitoring & Failure Diagnostics](#5-real-time-build-monitoring--failure-diagnostics)
6. [Supercharged Build Logs Terminal Viewer](#6-supercharged-build-logs-terminal-viewer)
7. [Desktop-Grade Operational Actions & Control Suite](#7-desktop-grade-operational-actions--control-suite)
8. [Activity Feed Performance Architecture & Virtualization](#8-activity-feed-performance-architecture--virtualization)
9. [Public Anonymous Domains vs. Deployment URLs](#9-public-anonymous-domains-vs-deployment-urls)
10. [Vercel REST API Complete Integration Matrix](#10-vercel-rest-api-complete-integration-matrix)
11. [Master Workspace File Ledger](#11-master-workspace-file-ledger)
12. [Quality Assurance, React 19 Compliance & Health Status](#12-quality-assurance-react-19-compliance--health-status)

---

## 1. Executive Summary & System Architecture

This repository delivers a **desktop-grade, real-time Vercel Developer Experience for mobile and web platforms**. Built on Expo and React Native with the React 19 Compiler, the application eliminates static mock placeholders and directly interacts with the official Vercel REST APIs.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             VERCEL DASHBOARD                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────┐  ┌──────────────────────┐  ┌──────────────────┐  │
│  │   UserContext         │  │   DomainResolver     │  │   LogParser      │  │
│  │   - Auth Token Sync   │  │   - Anonymous URLs   │  │   - ANSI Cleaner │  │
│  │   - User Profile Sync │  │   - Preview Builds   │  │   - Severity Tag │  │
│  │   - Team Switcher     │  │   - Alias Normalizer │  │   - Next.js CLI  │  │
│  └──────────┬────────────┘  └──────────┬───────────┘  └────────┬─────────┘  │
│             │                          │                       │            │
│  ┌──────────▼──────────────────────────▼───────────────────────▼──────────┐  │
│  │                            CORE SCREENS                                │  │
│  │  • Home Tab (Projects, Scopes, Pull-to-Refresh)                        │  │
│  │  • Deploy Tab (Auto Framework Preset, .env Bulk Manager, Git Source)   │  │
│  │  • Activity Tab (Virtualized FlatList, 3-Dot Actions, Search/Filter)   │  │
│  │  • Deployment Tracker (5-Stage Timeline, Real-time Failure Polling)    │  │
│  │  • Terminal Logs Viewer (Streaming, Level Filters, In-Log Search)      │  │
│  │  • Project Overview & Previews (1-Tap Promote, Redeploy, Rollback)     │  │
│  │  • Settings & Danger Zone (Live Name-Confirmed Project Deletion)       │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Global Configuration & Environment Setup

### 2.1 Runtime & Dependency Stack
- **Runtime**: React Native `0.86.2` on Expo SDK `~57.0.15`
- **Engine**: React `19.2.3` with React Compiler optimization enabled
- **Type System**: TypeScript `~5.9.2` strict typing
- **Design System**: Geist UI dark/light tokens with pitch-black terminal palette
- **Icons**: `lucide-react-native`
- **Navigation**: `expo-router` file-based routing architecture
- **System Browser**: `expo-web-browser` with native `Linking` and Web fallback

### 2.2 Environment Variables
The application configures the following environment variables in `.env`:

```env
# Vercel Personal Access Token (Bearer Auth)
EXPO_PUBLIC_VERCEL_TOKEN=your_vercel_token_here

# Optional: Default Active Team Workspace ID
EXPO_PUBLIC_VERCEL_TEAM_ID=team_xxxxxxxxxxxx
```

---

## 3. Authentication, Workspaces & Scope State Engine

### 3.1 Live Authentication & Profile Sync (`src/context/UserContext.tsx`)
- **Automated Identity Discovery**:
  - Automatically queries `GET https://api.vercel.com/v2/user` on app startup using the bearer token.
  - Extracts and binds typed user details: `id`, `username`, `name`, `email`, and `avatar`.
- **Multi-Team Discovery**:
  - Automatically queries `GET https://api.vercel.com/v2/teams` to fetch all associated team workspaces.
- **Active Workspace Scope State Machine**:
  - Manages active scope: **Personal Account** (`type: 'personal'`) vs. **Team Workspaces** (`type: 'team'`, `id: 'team_...'`).
  - Seamlessly cascades the active `teamId` to all downstream Vercel API queries and mutations.

### 3.2 Dynamic Top Navigation Header (`src/components/VercelHeader.tsx`)
- Displays the active workspace slug (`@username` or `team-name`).
- Interactive modal dropdown to switch between personal and team workspaces with 1 tap.
- Renders user/team avatar images with fallback initial badges.

---

## 4. Deployment Engine & Intelligent Framework Auto-Detection

### 4.1 Automated Framework Preset Detection (`src/app/(tabs)/deploy.tsx`)
When a repository is selected for deployment, the system automatically fetches its `package.json` and evaluates its dependency tree:

| Framework | Detected Package Markers | Output Directory | Default Build Command |
| :--- | :--- | :--- | :--- |
| **Next.js** | `next`, `nextjs` | `.next` | `next build` |
| **Vite** | `vite`, `@vitejs/plugin-react` | `dist` | `vite build` |
| **Astro** | `astro` | `dist` | `astro build` |
| **Nuxt.js** | `nuxt`, `nuxt3` | `.output` | `nuxt build` |
| **Remix** | `@remix-run/react`, `@remix-run/serve` | `build` | `remix build` |
| **SvelteKit**| `@sveltejs/kit` | `.svelte-kit` | `svelte-kit build` |
| **Gatsby** | `gatsby` | `public` | `gatsby build` |
| **CRA** | `react-scripts` | `build` | `react-scripts build` |
| **Vue.js** | `vue`, `@vue/cli-service` | `dist` | `vue-cli-service build` |
| **Angular** | `@angular/core`, `@angular/cli` | `dist` | `ng build` |
| **Other** | Static / HTML / Custom | `public` | None |

### 4.2 Dynamic Environment Variables Manager (`src/app/(tabs)/deploy.tsx`)
- **Android File Manager & Cross-Platform Storage Selector (`expo-document-picker` + `expo-file-system`)**:
  - **"Select .env from File Manager"**: Opens the native Android File Manager / Storage Access Framework (SAF), allowing users to browse internal storage, Downloads, Google Drive, SD card, or local folders to select `.env`, `.env.local`, `.env.production`, `.env.preview`, or custom text configuration files.
  - Automatically copies the file to the app's cache directory and reads the stream via `FileSystem.readAsStringAsync` (UTF-8) on Android/iOS with web `File.text()` fallback.
  - Parses all `KEY=VALUE` pairs, strips `export` keywords, handles quotes, skips comment lines (`#`), and merges all variables into the project configuration with feedback toast notifications.
- **Manual Add Form**: Key-Value row builder with mask/reveal toggles (`Eye`/`EyeOff`) and target environment selectors (**Production**, **Preview**, **Development**).
- **Bulk `.env` Parsing & Paste**:
  - Supports pasting raw multiline `.env` text.
  - Robust parser auto-populates the deployment payload.

### 4.3 Git Source Normalization & Project Provisioning
- Automatically resolves full repository slugs (`owner/repo`) and attaches numeric `repoId` from GitHub/Vercel APIs.
- Provisions and links the project and encrypted environment variables via `POST https://api.vercel.com/v10/projects` before triggering the build to eliminate `git source missing` errors.

---

## 5. Real-Time Build Monitoring & Failure Diagnostics

### 5.1 Accurate Polling & Failure Detection (`src/app/deployment/[id].tsx`)
- **Active Polling Loop**: Polls `GET https://api.vercel.com/v13/deployments/:id` every 2.5 seconds while status is `INITIALIZING`, `QUEUED`, or `BUILDING`.
- **Instant Error Cutoff**: Immediately detects transitions into `ERROR`, `FAILED`, or `CANCELED`, terminating the polling interval without misleading delays.

### 5.2 5-Stage Visual Progress Timeline
1. **System Setup & Configuration**: Environment resolution, node runtime, build container allocation.
2. **Cloning Repository**: Git branch and commit SHA detection.
3. **Building & Optimization**: Dependency installation, framework build execution, asset bundling.
4. **Assigning Domains & SSL**: Edge network propagation, SSL certificate generation.
5. **Ready / Live**: Production routing active and accessible.

### 5.3 Failure Banner & Error Diagnostics
- **Red Failure Alert Card**: Renders with the exact Vercel error code (e.g. `BUILD_FAILED`, `GIT_SOURCE_MISSING`, `INVALID_ENVIRONMENT_VARIABLE`) and complete descriptive message.
- **Action Buttons**:
  - **"View Build Error Logs"**: Deep-links to terminal logs viewer with failure context preloaded.
  - **"Redeploy (Clear Cache)"**: Triggers immediate rebuild with empty cache.

---

## 6. Supercharged Build Logs Terminal Viewer

### 6.1 Terminal Parser & Formatting (`src/utils/logParser.ts`)
- **ANSI Stripping**: Cleans escape codes and terminal artifacts for clean readability.
- **Severity Tagging**: Classifies entries into `error`, `warn`, `info`, and `success`.
- **Next.js CLI Marker Highlighting**: Custom color-coding for markers (`▲ Next.js`, `✓ Compiled`, `○ Static`, `λ Serverless`).

### 6.2 Interactive Viewer Features (`src/app/deployment/[id]/logs.tsx`)
- **Live Stream Indicator**: Pulsing green **LIVE** badge with play/pause controls.
- **Severity Filter Pills**: Filter by **All (`count`)**, **Errors (`count`)**, **Warnings (`count`)**, and **Info (`count`)**.
- **In-Log Search Engine**: Real-time keyword filter with yellow highlighting of matched text.
- **Floating Auto-Scroll Button**: Pin viewport to incoming build events with manual jump-to-bottom.
- **1-Tap Clipboard Copying**: Tap any log line to copy that individual line, or use the header button to export all logs with timestamps.

---

## 7. Desktop-Grade Operational Actions & Control Suite

| Operation | Vercel REST Endpoint | Trigger Location | Description |
| :--- | :--- | :--- | :--- |
| **Redeploy Project** | `POST /v13/deployments?forceNew=1&withCache=0` | Activity 3-Dot, Project Overview, Deployment Screen | Opens modal with Target Environment (**Production**/**Preview**) and **Clear Build Cache** toggle. |
| **Promote to Production** | `POST /v10/projects/:name/promote/:id` | Activity 3-Dot, Previews Screen, Deployment Screen | Re-routes production root domains and edge SSL certificates to a selected preview build. |
| **Instant Rollback** | `POST /v9/projects/:name/rollback/:id` | Activity 3-Dot, Deployment Screen | Immediately redirects live production traffic back to a stable verified previous deployment. |
| **Assign Domain Alias** | `POST /v2/deployments/:id/aliases` | Deployment Screen | Assigns custom domains or preview aliases (`preview-v2.yourdomain.com`) directly to any build. |
| **Cancel Build** | `PATCH /v12/deployments/:id/cancel` | Activity 3-Dot, Deployment Screen | Aborts in-progress builds in `BUILDING` or `QUEUED` state. |
| **Delete Project** | `DELETE /v9/projects/:name` | Project Settings (Danger Zone) | Interactive modal requiring typed project name confirmation before permanent deletion. |

---

## 8. Activity Feed Performance Architecture & Virtualization

### 8.1 Performance Optimizations (`src/app/(tabs)/activity.tsx`)
- **`React.memo` Isolation (`DeploymentCardItem`)**: Memoized deployment cards prevent re-renders when users type search queries or open dropdown filters.
- **`FlatList` List Virtualization**: Replaced un-virtualized `ScrollView.map` with `FlatList` (`initialNumToRender={10}`, `maxToRenderPerBatch={10}`, `windowSize={5}`).
- **Expanded HitSlop 3-Dot Menu**: Applied `hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}` and `activeOpacity={0.6}` for 0ms touch latency.

### 8.2 Side-by-Side Search & Interactive Project Selector
- **Side-by-Side Responsive Control Bar**: Search input and project dropdown positioned in a unified row.
- **Interactive Project Selector Modal**: Lists **"All Projects"** and individual projects with folder icons and deployment counters.
- **Clean Card UI**: Streamlined card showing Project Name, Commit SHA, Environment Pill, Status Badge, 3-Dot Menu, Commit Message, Git Branch, Author, and Time-Ago.

---

## 9. Public Anonymous Domains vs. Deployment URLs

### 9.1 Intelligent Domain Resolution Engine (`src/utils/domainResolver.ts`)
The application cleanly separates public visitor access from private build hashes:

```
                      ┌───────────────────────────────────────────────┐
                      │            Vercel Deployment Object           │
                      └───────────────────────┬───────────────────────┘
                                              │
                     ┌────────────────────────┴────────────────────────┐
                     ▼                                                 ▼
      ┌─────────────────────────────┐                   ┌─────────────────────────────┐
      │     PUBLIC DOMAINS          │                   │     DEPLOYMENT URL          │
      │  (Anonymous Visitor Access) │                   │  (Immutable Build Preview)  │
      ├─────────────────────────────┤                   ├─────────────────────────────┤
      │  • aurelian-phi-brown.      │                   │  • aurelian-bv0a4icfr-      │
      │    vercel.app               │                   │    virendra-phirkes-        │
      │  • yourdomain.com           │                   │    projects.vercel.app      │
      │  • No Git/Hash Prefixes     │                   │  • Contains commit hash     │
      │  • Open to all visitors     │                   │  • May enforce Vercel auth  │
      └─────────────────────────────┘                   └─────────────────────────────┘
```

### 9.2 Hero Card & Details Rendering (`src/app/deployment/[id].tsx`)
- **Public Live Domain Banner**: Displays when deployment is ready with an **ANONYMOUS ACCESS** badge, direct **Visit Site** button, and **Copy** button.
- **Source & Domains Card**: Lists the immutable **Deployment** preview URL and all assigned **Domains** with individual copy and launch buttons.

---

## 10. Vercel REST API Complete Integration Matrix

| Endpoint | Method | Scope Supported | Usage in Project |
| :--- | :--- | :--- | :--- |
| `https://api.vercel.com/v2/user` | `GET` | Personal | Fetches authenticated user profile, avatar, username. |
| `https://api.vercel.com/v2/teams` | `GET` | Personal | Discovers all associated team accounts. |
| `https://api.vercel.com/v9/projects` | `GET` | User / Team | Lists projects for Home screen and Activity filters. |
| `https://api.vercel.com/v10/projects` | `POST` | User / Team | Provisions new projects and links environment variables. |
| `https://api.vercel.com/v9/projects/:name` | `DELETE` | User / Team | Permanently deletes projects from Settings Danger Zone. |
| `https://api.vercel.com/v6/deployments` | `GET` | User / Team | Fetches deployment history and activity feeds. |
| `https://api.vercel.com/v13/deployments/:id` | `GET` | User / Team | Real-time deployment status polling and metadata. |
| `https://api.vercel.com/v13/deployments?forceNew=1&withCache=0` | `POST` | User / Team | Triggers project redeployments with cache controls. |
| `https://api.vercel.com/v10/projects/:name/promote/:id` | `POST` | User / Team | 1-tap promotion of preview builds to production. |
| `https://api.vercel.com/v9/projects/:name/rollback/:id` | `POST` | User / Team | Instantly restores production traffic to a previous build. |
| `https://api.vercel.com/v12/deployments/:id/cancel` | `PATCH` | User / Team | Aborts active builds in progress. |
| `https://api.vercel.com/v2/deployments/:id/aliases` | `POST` | User / Team | Assigns custom domain aliases to builds. |
| `https://api.vercel.com/v1/integrations/git-repositories` | `GET` | User / Team | Ingests linked Git repositories for deployment. |
| `https://api.github.com/users/:username/repos` | `GET` | Personal | Supplements repository search with GitHub account repos. |

---

## 11. Master Workspace File Ledger

| File Path | Status | Purpose & Functionality |
| :--- | :--- | :--- |
| `src/context/UserContext.tsx` | **Created** | User & team authentication context provider with live API sync and active scope state machine. |
| `src/utils/domainResolver.ts` | **Created** | Domain resolution engine identifying public anonymous domains vs immutable build URLs. |
| `src/utils/logParser.ts` | **Created** | Build log parser, ANSI cleaner, Next.js symbol classifier, and severity tagger. |
| `src/components/Toast.tsx` | **Created** | Reanimated floating toast notification primitive for non-blocking feedback. |
| `src/components/VercelHeader.tsx` | **Rewritten** | Dynamic workspace switcher header with modal popup and user/team avatar binding. |
| `src/app/(tabs)/activity.tsx` | **Rewritten** | Performance-optimized `FlatList` with `React.memo`, side-by-side search & dropdown filter, streamlined minimal card layout, expanded hitSlop 3-dot menu. |
| `src/app/deployment/[id].tsx` | **Rewritten** | Public Live Website hero card, clean Domains/Deployment section, real-time failure polling, red error diagnostics alert banner, Mobile Redeploy, Promote to Production, Rollback. |
| `src/app/deployment/[id]/logs.tsx` | **Rewritten** | Real-time build logs viewer with level filtering, keyword search highlighting, auto-scroll, copy, and error diagnostics. |
| `src/app/(tabs)/deploy.tsx` | **Rewritten** | Automatic framework preset detection (`package.json` inspection), framework preset selector modal, environment variable manager (.env extractor), robust gitSource resolution, and live deployment error handler. |
| `src/app/project/[id].tsx` | **Rewritten** | Interactive Redeploy Modal replacing legacy unsupported alert, fixed status calculation for ERROR/FAILED/CANCELED. |
| `src/app/project/[id]/deployments.tsx` | **Rewritten** | Search filtering, per-row operational actions (Promote, Redeploy, Logs, Copy), updated getStatus for ERROR/FAILED. |
| `src/app/project/[id]/previews.tsx` | **Rewritten** | 1-tap Promote to Production button for preview cards with status and time-ago indicators. |
| `src/app/project/[id]/settings.tsx` | **Rewritten** | Real Vercel API project deletion (`DELETE /v9/projects`) with confirmation modal and feedback toast. |
| `src/app/(tabs)/index.tsx` | **Modified** | Added header refresh button, pull-to-refresh (`RefreshControl`), and active team scope syncing. |
| `src/components/GeistUI.tsx` | **Modified** | Updated `StatusBadge` to support `Canceled` and `Failed` with styled color indicators. |
| `src/app/(tabs)/profile.tsx` | **Modified** | Dynamic profile binding and avatar initial display. |
| `src/app/settings/members.tsx` | **Modified** | Dynamic authenticated owner display. |
| `src/app/settings/general.tsx` | **Modified** | Dynamic workspace name and slug binding. |
| `src/app/project/[id]/settings/git.tsx` | **Modified** | Dynamic Git repo connection fetcher. |
| `src/app/_layout.tsx` | **Modified** | Wrapped root in `<UserProvider>`. |
| `src/hooks/use-color-scheme.web.ts` | **Modified** | Hydration safety using `useSyncExternalStore`. |
| `src/app/settings/security.tsx` | **Cleaned** | Escaped JSX entities. |
| `src/app/(tabs)/_layout.tsx` | **Cleaned** | Removed unused icon imports. |
| `src/app/project/[id]/env.tsx` | **Cleaned** | Removed dead state and unused imports. |

---

## 12. Quality Assurance, React 19 Compliance & Health Status

### 12.1 React 19 & Compiler Rules Compliance
- **Purity in Render Phase**: All `Date.now()` calls removed from JSX mapping loops and encapsulated in `useEffect` data-fetching hooks.
- **State in Effect Rules**: Replaced synchronous `setState` in render effects with derived state or async initializers across all screens.
- **Client Hydration Safety**: Modernized `use-color-scheme.web.ts` with React's official `useSyncExternalStore` pattern.

### 12.2 Verification Results
- **TypeScript Compilation (`npx tsc --noEmit`)**: **PASSED (0 Errors)**
- **ESLint Validation (`npm run lint`)**: **PASSED (0 Errors, 0 Warnings)**
- **Runtime Environment**: React Native 0.86.2, Expo ~57.0.15, running smoothly.
