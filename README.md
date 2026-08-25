# Vercel App

> A cross-platform Vercel dashboard built with **React Native + Expo Router**, allowing you to monitor and manage Vercel projects, deployments, activity, analytics, settings, and profile information from a single application.

[![Expo](https://img.shields.io/badge/Expo-57-black?logo=expo)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.86-blue?logo=react)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vercel SDK](https://img.shields.io/badge/Vercel%20SDK-1.28-black?logo=vercel)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](#license)

---

## 📖 Table of Contents

* [Overview](#-overview)
* [What Does This App Do?](#-what-does-this-app-do)
* [Key Features](#-key-features)
* [Technology Stack](#-technology-stack)
* [Architecture Overview](#-architecture-overview)
* [How the Application Works](#-how-the-application-works)
* [Authentication & Token Flow](#-authentication--token-flow)
* [Vercel API Integration](#-vercel-api-integration)
* [Application Structure](#-application-structure)
* [Routing Architecture](#-routing-architecture)
* [Data Flow](#-data-flow)
* [Folder Structure](#-folder-structure)
* [Getting Started](#-getting-started)
* [Environment Variables](#-environment-variables)
* [Running the Application](#-running-the-application)
* [Platform Support](#-platform-support)
* [Web Deployment](#-web-deployment)
* [Security](#-security)
* [Development Guide](#-development-guide)
* [Troubleshooting](#-troubleshooting)
* [Future Improvements](#-future-improvements)
* [Contributing](#-contributing)
* [License](#-license)

---

# 🌐 Overview

**Vercel App** is a mobile-first, cross-platform dashboard for interacting with the Vercel platform.

Instead of opening the Vercel dashboard in a browser every time, this application provides a native-style interface that can run on:

* 📱 iOS
* 🤖 Android
* 🌐 Web

The application communicates with Vercel through the official `@vercel/sdk`.

At a high level, the application works like this:

```text
┌──────────────────────────────────────────────┐
│                  USER                        │
│                                              │
│        iOS / Android / Web Browser           │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│              EXPO APPLICATION                │
│                                              │
│  React Native + Expo Router                  │
│                                              │
│  ┌────────────┐ ┌────────────┐ ┌──────────┐  │
│  │ Dashboard  │ │ Deployments│ │ Settings │  │
│  └────────────┘ └────────────┘ └──────────┘  │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│             APPLICATION LAYER                │
│                                              │
│  Context → Hooks → API Wrapper → SDK Client  │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│                 VERCEL API                   │
│                                              │
│       Projects • Deployments • Logs          │
│       Teams • Environments • Activity        │
└──────────────────────────────────────────────┘
```

---

# 🎯 What Does This App Do?

The application acts as a **client/dashboard for Vercel**.

It is responsible for:

1. Providing a user-friendly interface.
2. Handling application navigation.
3. Managing authentication/session information.
4. Obtaining the user's Vercel access token.
5. Creating a Vercel SDK client using that token.
6. Requesting information from Vercel.
7. Displaying Vercel data in reusable UI components.
8. Providing deployment, project, analytics, activity, profile, search, and settings screens.

The repository currently organizes the main application under `src/app`, with separate routes for tabs, projects, deployments, and settings.

---

# ✨ Key Features

## 📱 Cross-Platform

The same codebase can target:

* iOS
* Android
* Web

The project uses Expo and React Native Web to achieve this cross-platform architecture.

---

## 🧭 File-Based Navigation

Navigation is handled by **Expo Router**.

Instead of manually creating a large navigation configuration, routes are represented by files and folders.

For example:

```text
src/app/

├── index.tsx
├── auth.tsx
│
├── (tabs)/
│   ├── index.tsx
│   ├── activity.tsx
│   ├── analytics.tsx
│   ├── deploy.tsx
│   ├── profile.tsx
│   ├── search.tsx
│   └── settings.tsx
│
├── deployment/
├── project/
└── settings/
```

This makes the navigation system easier to understand and scale.

---

## ☁️ Vercel Integration

The application uses the official Vercel SDK:

```text
@vercel/sdk
```

The SDK is responsible for communicating with Vercel's APIs.

The project contains a dedicated API layer in:

```text
src/api/vercel.ts
```

That layer creates the Vercel SDK client using the currently available authentication token.

---

## 🎨 Reusable UI

Reusable components are separated from route-specific screens.

This makes it possible to build a component once and use it across:

* Dashboard
* Projects
* Deployments
* Activity
* Settings
* Profile
* Analytics

---

## 🌗 Theme Support

The project contains dedicated theme and styling directories for managing:

* Colors
* Dark mode
* Light mode
* Shared design values
* Platform-specific styling

---

# 🧰 Technology Stack

| Layer          | Technology              | Purpose                              |
| -------------- | ----------------------- | ------------------------------------ |
| Framework      | Expo                    | Cross-platform application framework |
| UI             | React Native            | User interface                       |
| Routing        | Expo Router             | File-based navigation                |
| Language       | TypeScript              | Type safety                          |
| API            | Vercel SDK              | Communication with Vercel            |
| Icons          | Lucide React Native     | Application icons                    |
| Animation      | React Native Reanimated | Animations                           |
| Lists          | Shopify Flash List      | High-performance lists               |
| Secure Storage | Expo Secure Store       | Sensitive local data                 |
| Web            | React Native Web        | Browser support                      |
| Styling        | Custom theme system     | Consistent UI                        |
| Runtime        | Node.js 22.x            | Development/build environment        |

The exact dependency versions are defined in `package.json`; notably, the current project uses Expo 57, React Native 0.86.2, React 19.2.3, Expo Router 57, and `@vercel/sdk` 1.28.x.

---

# 🏗 Architecture Overview

The application follows a **layered client architecture**.

```text
                         ┌───────────────────┐
                         │       USER        │
                         └─────────┬─────────┘
                                   │
                                   ▼
                    ┌──────────────────────────┐
                    │      PRESENTATION        │
                    │                          │
                    │ React Native Screens     │
                    │ Reusable Components      │
                    │ Theme / Styling          │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │       NAVIGATION         │
                    │                          │
                    │     Expo Router          │
                    │                          │
                    │ Tabs / Nested Routes     │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │      APPLICATION         │
                    │                          │
                    │ Context                  │
                    │ Hooks                    │
                    │ Utility Functions        │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │        API LAYER         │
                    │                          │
                    │ src/api/vercel.ts        │
                    │ Token Management         │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │       VERCEL SDK         │
                    │                          │
                    │      @vercel/sdk         │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │       VERCEL API         │
                    │                          │
                    │ Projects                 │
                    │ Deployments              │
                    │ Logs                     │
                    │ Environments             │
                    │ Analytics / Activity     │
                    └──────────────────────────┘
```

---

# 🧩 Architecture Layers Explained

## 1. Presentation Layer

The presentation layer is what the user sees.

It contains:

```text
src/components/
src/styles/
src/theme/
src/global.css
```

Responsibilities:

* Render UI.
* Display Vercel data.
* Handle buttons and user interactions.
* Display loading states.
* Display errors.
* Apply themes.
* Provide responsive layouts.

The components should ideally remain independent of direct API calls.

---

## 2. Navigation Layer

Navigation lives inside:

```text
src/app/
```

Expo Router maps the filesystem to application routes.

For example:

```text
src/app/project/
```

represents project-related navigation.

Similarly:

```text
src/app/deployment/
```

contains deployment-related screens.

The `(tabs)` directory contains the primary application tabs.

---

## 3. Context Layer

Application-wide state is handled through React Context.

Current context code includes:

```text
src/context/UserContext.tsx
```

The context layer is useful for information that needs to be shared by multiple screens.

Conceptually:

```text
                    UserContext
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼
      Dashboard       Profile        Settings
```

This avoids passing the same information through many levels of component props.

---

## 4. Hooks Layer

Custom hooks are located in:

```text
src/hooks/
```

Hooks encapsulate reusable application behavior.

Examples of responsibilities include:

* Theme handling
* Color scheme detection
* Shared UI behavior
* Reusable state logic

A hook allows multiple screens to share the same behavior without duplicating code.

---

## 5. API Layer

The API abstraction is located in:

```text
src/api/
```

The central Vercel integration is:

```text
src/api/vercel.ts
```

Its responsibility is to provide a Vercel SDK client using the current authentication token.

The implementation intentionally creates the client from the current token rather than relying on a stale module-level token.

Conceptually:

```text
Screen
  │
  ▼
API Function
  │
  ▼
getVercelClient()
  │
  ▼
Current Access Token
  │
  ▼
@vercel/sdk
  │
  ▼
Vercel API
```

This separation is important because UI code does not need to understand how authentication tokens are converted into an SDK client.

---

# 🔐 Authentication & Token Flow

Authentication is one of the most important parts of this architecture.

The application needs a Vercel access token to communicate with Vercel.

The repository uses a token-management abstraction and the Vercel API client is initialized from the current token.

A simplified flow looks like this:

```text
┌──────────────┐
│     User     │
└──────┬───────┘
       │
       │ Authenticate
       ▼
┌──────────────┐
│ Auth Screen  │
└──────┬───────┘
       │
       │ Token
       ▼
┌──────────────────────┐
│ Token Storage/Cache  │
└──────────┬───────────┘
           │
           │ get token
           ▼
┌──────────────────────┐
│ getVercelClient()    │
└──────────┬───────────┘
           │
           │ bearer token
           ▼
┌──────────────────────┐
│     Vercel SDK       │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│      Vercel API      │
└──────────────────────┘
```

### Why this design matters

The UI does not need to directly manage API authentication on every request.

Instead:

```text
UI
 ↓
API Layer
 ↓
Token Provider
 ↓
Vercel SDK
 ↓
Vercel
```

This creates a cleaner separation of responsibilities.

---

# ☁️ Vercel API Integration

The project uses:

```text
@vercel/sdk
```

The SDK is initialized with a bearer token.

The current implementation effectively follows:

```typescript
const token = getCachedVercelToken();

return new Vercel({
  bearerToken: token || "",
});
```

This means the application can obtain a fresh client using the current authentication state.

### Typical API flow

```text
User opens Projects
        │
        ▼
Project Screen
        │
        ▼
Vercel SDK request
        │
        ▼
Vercel API
        │
        ▼
Projects response
        │
        ▼
React state
        │
        ▼
UI renders project cards
```

---

# 🧭 Routing Architecture

The application uses **Expo Router's file-based routing**.

Current routes include:

```text
src/app/

├── index.tsx
├── auth.tsx
├── _layout.tsx
│
├── (tabs)/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── activity.tsx
│   ├── analytics.tsx
│   ├── deploy.tsx
│   ├── profile.tsx
│   ├── search.tsx
│   └── settings.tsx
│
├── deployment/
├── project/
└── settings/
```

The repository currently contains dedicated route groups for tabs, deployments, projects, and settings.

### Why file-based routing?

Instead of:

```text
navigate("some-manually-defined-route")
```

the application structure itself represents navigation:

```text
src/app/project/
src/app/deployment/
src/app/settings/
```

This makes large applications easier to navigate and maintain.

---

# 🔄 Data Flow

A typical data request follows this path:

```text
                 USER ACTION
                      │
                      ▼
              React Native Screen
                      │
                      ▼
               Event Handler
                      │
                      ▼
                API Function
                      │
                      ▼
             getVercelClient()
                      │
                      ▼
               Vercel SDK
                      │
                      ▼
                Vercel API
                      │
                      ▼
                 API Response
                      │
                      ▼
                React State
                      │
                      ▼
              UI Re-render
                      │
                      ▼
                    USER
```

### Example: Viewing a project

```text
1. User opens a project
          ↓
2. Project screen loads
          ↓
3. Application requests project information
          ↓
4. API layer obtains Vercel client
          ↓
5. Vercel SDK sends authenticated request
          ↓
6. Vercel returns project information
          ↓
7. Application stores the response
          ↓
8. Components render the project
```

---

# 📁 Folder Structure

The major source directories are:

```text
vercel-app/
│
├── src/
│   │
│   ├── app/
│   │   ├── (tabs)/
│   │   ├── deployment/
│   │   ├── project/
│   │   ├── settings/
│   │   ├── auth.tsx
│   │   ├── index.tsx
│   │   └── _layout.tsx
│   │
│   ├── api/
│   │   └── vercel.ts
│   │
│   ├── components/
│   │   └── Reusable UI components
│   │
│   ├── constants/
│   │   └── Application constants
│   │
│   ├── context/
│   │   └── UserContext.tsx
│   │
│   ├── hooks/
│   │   └── Custom React hooks
│   │
│   ├── lib/
│   │   └── Utility and integration logic
│   │
│   ├── styles/
│   │   └── Shared styling
│   │
│   ├── theme/
│   │   └── Theme configuration
│   │
│   ├── utils/
│   │   └── Utility functions
│   │
│   └── global.css
│
├── assets/
│   └── Images and application assets
│
├── app.json
├── eas.json
├── metro.config.js
├── package.json
├── tsconfig.json
├── eslint.config.js
├── pnpm-lock.yaml
└── README.md
```

The current repository contains `api`, `app`, `components`, `constants`, `context`, `hooks`, `lib`, `styles`, `theme`, and `utils` under `src`.

---

# 📂 Important Directories

## `src/app`

Contains application screens and routes.

Think of it as:

> **Where the user goes.**

---

## `src/components`

Contains reusable UI.

Think of it as:

> **What the user sees.**

---

## `src/api`

Contains communication with external services.

Think of it as:

> **How the application talks to Vercel.**

---

## `src/context`

Contains shared application state.

Think of it as:

> **Information shared between screens.**

---

## `src/hooks`

Contains reusable React behavior.

Think of it as:

> **Reusable application logic.**

---

## `src/theme`

Contains design and theme configuration.

Think of it as:

> **How the application looks.**

---

## `src/utils`

Contains helper functions.

Think of it as:

> **Small reusable tools used throughout the app.**

---

# 🚀 Getting Started

## Prerequisites

Install the following before starting:

* Node.js 22.x
* npm
* Expo-compatible development environment
* Expo Go, if testing on a physical device

The repository currently specifies Node.js `22.x` in `package.json`.

---

## 1. Clone the Repository

```bash
git clone https://github.com/mahesh2-lab/vercel-app.git
cd vercel-app
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
VERCEL_TOKEN=your_vercel_access_token
```

Do **not** commit the token to Git.

---

## 4. Start the Development Server

```bash
npx expo start
```

Expo will display a development server with options for different platforms.

---

# ▶️ Running the Application

After running:

```bash
npx expo start
```

you can launch the application using:

### iOS

```text
Press i
```

or:

```bash
npm run ios
```

### Android

```text
Press a
```

or:

```bash
npm run android
```

### Web

```text
Press w
```

or:

```bash
npm run web
```

The project defines all three platform scripts in `package.json`.

---

# 🔑 Environment Variables

| Variable       | Required | Description                            |
| -------------- | -------: | -------------------------------------- |
| `VERCEL_TOKEN` |      Yes | Token used to authenticate with Vercel |

Example:

```env
VERCEL_TOKEN=xxxxxxxxxxxxxxxx
```

### Important

Never hard-code credentials inside source code.

Bad:

```typescript
const token = "my-secret-token";
```

Good:

```text
Environment / secure token storage
          ↓
Token provider
          ↓
Vercel SDK
```

---

# 🌍 Platform Support

The application is designed around Expo's cross-platform model.

```text
                 Shared Codebase
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
         iOS        Android         Web
          │            │            │
          ▼            ▼            ▼
     React Native  React Native  React Native
                                  Web
```

This allows most business logic and UI to be shared between platforms.

---

# 🌐 Web Deployment

The project includes a Vercel build script:

```json
"vercel-build": "expo export --platform web"
```

Therefore the web application can be exported as a static web build.

A typical deployment flow is:

```text
GitHub Repository
       │
       ▼
     Vercel
       │
       ▼
Install dependencies
       │
       ▼
Run vercel-build
       │
       ▼
Expo Web Export
       │
       ▼
Production Web Application
```

---

# 🛡️ Security

Security is particularly important because this application communicates with a user's Vercel account.

## Never commit tokens

Do not put secrets directly into:

* `.tsx`
* `.ts`
* `.js`
* Git commits
* README files
* screenshots
* issue reports

Use environment variables or secure storage instead.

---

## Protect `.env`

Make sure your environment file remains ignored by Git.

You can verify:

```bash
git status
```

The repository's existing documentation also explicitly warns against committing Vercel access tokens.

---

## If a token is leaked

Immediately:

1. Revoke the exposed token.
2. Generate a new token.
3. Update local environment configuration.
4. Check Git history if the token was committed.
5. Remove the secret from exposed repositories/history where appropriate.

---

# 🧑‍💻 Development Guide

When adding a new feature, follow the existing architecture.

For example, if you want to add a **Deployment Details** feature:

```text
Step 1
Create route
        ↓
src/app/deployment/

Step 2
Create/reuse UI components
        ↓
src/components/

Step 3
Add API interaction
        ↓
src/api/

Step 4
Use hooks/context when shared state is required
        ↓
src/hooks/
src/context/

Step 5
Apply theme/styles
        ↓
src/theme/
src/styles/

Step 6
Test on Web / iOS / Android
```

This keeps the application modular.

---

# 🧱 Recommended Architectural Rules

## Rule 1 — Keep Screens Focused

Screens should primarily coordinate:

```text
UI
+
User interactions
+
Data loading
```

Avoid putting large amounts of reusable logic directly inside screens.

---

## Rule 2 — Keep API Logic Out of Components

Prefer:

```text
Component
   ↓
API function
   ↓
Vercel SDK
```

instead of:

```text
Component
   ↓
Direct SDK calls everywhere
```

This makes the code easier to test and maintain.

---

## Rule 3 — Reuse Components

If the same UI appears more than once, consider moving it into:

```text
src/components/
```

---

## Rule 4 — Centralize Shared State

If multiple screens need the same information, consider:

```text
src/context/
```

rather than passing the information through many components.

---

## Rule 5 — Keep Theme Logic Centralized

Do not scatter hard-coded colors throughout the application.

Prefer the project's:

```text
src/theme/
src/styles/
```

architecture.

---

# 🧪 Code Quality

Run linting with:

```bash
npm run lint
```

The project uses ESLint with the Expo configuration.

Before submitting a change, verify:

```text
✓ TypeScript compiles
✓ ESLint passes
✓ App starts successfully
✓ Authentication works
✓ Vercel API requests work
✓ iOS UI works
✓ Android UI works
✓ Web UI works
✓ No secrets are committed
```

---

# 🐛 Troubleshooting

## App does not start

Try:

```bash
npm install
npx expo start -c
```

The `-c` option clears the Expo/Metro cache.

---

## Vercel API requests fail

Check:

```text
1. Is VERCEL_TOKEN configured?
2. Is the token valid?
3. Has the token expired/revoked?
4. Does the token have the required permissions?
5. Is the application reading the correct environment?
```

---

## Android emulator does not open

Make sure:

* Android Studio is installed.
* An Android Virtual Device exists.
* The emulator is running.
* Android SDK paths are configured.

---

## iOS simulator does not open

Make sure:

* Xcode is installed.
* An iOS simulator is available.
* CocoaPods/development dependencies are correctly configured.

---

## Web version behaves differently

Remember that React Native Web translates React Native components to browser-compatible implementations.

Platform-specific behavior may therefore require platform-aware code.

---

# 🗺️ Complete Architecture Diagram

The complete system can be understood using this diagram:

```text
┌──────────────────────────────────────────────────────────────┐
│                         USER                                 │
│                                                              │
│              iOS       Android       Browser                 │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                    EXPO / REACT NATIVE                       │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                    EXPO ROUTER                         │  │
│  │                                                        │  │
│  │  Dashboard │ Activity │ Analytics │ Deploy │ Settings  │  │
│  │  Profile   │ Search   │ Projects  │ Deployment         │  │
│  └──────────────────────────┬─────────────────────────────┘  │
│                             │                                │
│                             ▼                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                 PRESENTATION LAYER                     │  │
│  │                                                        │  │
│  │       Screens + Components + Theme + Styles            │  │
│  └──────────────────────────┬─────────────────────────────┘  │
│                             │                                │
│                             ▼                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                 APPLICATION LAYER                      │  │
│  │                                                        │  │
│  │      Context + Hooks + Utilities + Shared State        │  │
│  └──────────────────────────┬─────────────────────────────┘  │
│                             │                                │
│                             ▼                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                     API LAYER                          │  │
│  │                                                        │  │
│  │                src/api/vercel.ts                       │  │
│  │                         │                              │  │
│  │                Token Management                        │  │
│  └──────────────────────────┬─────────────────────────────┘  │
└─────────────────────────────┼────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                       VERCEL SDK                             │
│                       @vercel/sdk                            │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                        VERCEL API                            │
│                                                              │
│ Projects │ Deployments │ Logs │ Environments │ Activity      │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                       API RESPONSE                           │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
                    React State / UI Update
                               │
                               ▼
                             USER
```

---

# 🔁 Example End-to-End Request

Suppose the user opens a project.

```text
USER
 │
 │ Tap project
 ▼
PROJECT SCREEN
 │
 │ Request project data
 ▼
API LAYER
 │
 │ Get current token
 ▼
TOKEN PROVIDER
 │
 │ Bearer token
 ▼
VERCEL SDK
 │
 │ HTTPS request
 ▼
VERCEL API
 │
 │ Project JSON
 ▼
VERCEL SDK
 │
 ▼
API LAYER
 │
 ▼
REACT STATE
 │
 ▼
PROJECT COMPONENTS
 │
 ▼
USER SEES PROJECT
```

This is the core interaction pattern used throughout the application.

---

# 🧠 Understanding the Project in One Minute

If you are new to the codebase, remember these five things:

### 1. `src/app` = Screens

> Where users navigate.

### 2. `src/components` = UI

> Reusable things users see.

### 3. `src/context` + `src/hooks` = Application Logic

> Shared state and reusable behavior.

### 4. `src/api` = Vercel Communication

> The bridge between the app and Vercel.

### 5. `@vercel/sdk` = Vercel Connection

> The official SDK used to communicate with Vercel.

So the simplest mental model is:

```text
          USER
           │
           ▼
       SCREENS
           │
           ▼
      COMPONENTS
           │
           ▼
   CONTEXT / HOOKS
           │
           ▼
        API LAYER
           │
           ▼
      VERCEL SDK
           │
           ▼
       VERCEL API
```

---

# 🚧 Future Improvements

Potential improvements that can make the application more production-ready include:

* [ ] Add automated unit tests.
* [ ] Add integration tests for Vercel API calls.
* [ ] Add end-to-end testing.
* [ ] Improve offline/error handling.
* [ ] Add API request caching.
* [ ] Add pagination for large datasets.
* [ ] Add pull-to-refresh throughout the dashboard.
* [ ] Improve deployment log streaming.
* [ ] Add richer deployment analytics.
* [ ] Add better authentication/session expiration handling.
* [ ] Add automated CI checks.
* [ ] Add application monitoring and crash reporting.
* [ ] Improve accessibility.
* [ ] Add comprehensive API documentation.

---

# 🤝 Contributing

Contributions are welcome.

## Development workflow

```text
Fork
  ↓
Clone
  ↓
Create feature branch
  ↓
Make changes
  ↓
Run lint/tests
  ↓
Verify Web/iOS/Android
  ↓
Commit
  ↓
Push
  ↓
Open Pull Request
```

Create a feature branch:

```bash
git checkout -b feature/my-feature
```

Install dependencies:

```bash
npm install
```

Run the application:

```bash
npx expo start
```

Run linting:

```bash
npm run lint
```

---

# 📄 License

This project is licensed under the **MIT License**.

See the repository's license file for the complete license text.

---

# 👨‍💻 Repository

GitHub repository:

**mahesh2-lab/vercel-app**

The repository is publicly available and currently contains the Expo/React Native application described above.

---

# ⭐ Final Architecture Summary

The application is essentially a **cross-platform Vercel management client**.

Its architecture can be summarized as:

```text
┌─────────────────────────────────────┐
│              CLIENTS                │
│                                     │
│       iOS │ Android │ Web           │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│         EXPO + REACT NATIVE         │
│                                     │
│        UI + Navigation              │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│       APPLICATION SERVICES          │
│                                     │
│     Context + Hooks + Utils         │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│             API LAYER               │
│                                     │
│       Authentication + SDK          │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│           VERCEL SDK                │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│            VERCEL API               │
│                                     │
│ Projects • Deployments • Logs       │
│ Analytics • Activity • Settings     │
└─────────────────────────────────────┘
```

**In one sentence:**

> **The Vercel App is a React Native/Expo client that uses Expo Router for navigation, shared application layers for state and behavior, and the official Vercel SDK to securely retrieve and manage Vercel platform data across iOS, Android, and Web.**
