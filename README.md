# Vercel App

A beautiful, responsive Vercel dashboard application built with **React Native**, **Expo Router**, and the **Vercel API SDK**. Monitor your deployments, manage project settings, and view activity across your Vercel teams right from your iOS, Android, or Web device.

## 🚀 Features

- **Cross-Platform**: Runs seamlessly on iOS, Android, and Web using Expo.
- **Vercel SDK Integration**: Direct integration with the `@vercel/sdk` to securely fetch projects, deployments, logs, and environments.
- **Beautiful UI**: Uses custom theming, animations with `react-native-reanimated`, and Lucide/Simple icons.
- **File-Based Routing**: Leverages Expo Router for scalable, typed navigation across tabs and nested screens.
- **Responsive Layout**: Designed with `react-native-safe-area-context` to adapt to various screen sizes and notches.

## 📦 Tech Stack

- [Expo](https://expo.dev/) (~57.0.15)
- [Expo Router](https://docs.expo.dev/router/introduction/) for routing
- [React Native](https://reactnative.dev/) (0.86.2)
- [Vercel SDK](https://sdk.vercel.ai/docs/reference/ai-sdk-core)
- [Reanimated](https://docs.swmansion.com/react-native-reanimated/) for fluid animations
- [Lucide React Native](https://lucide.dev/) for iconography

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- `npm` or `yarn` installed on your machine
- [Expo Go](https://expo.dev/go) app on your physical device, or an iOS Simulator / Android Emulator.

### Installation

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone https://github.com/mahesh2-lab/vercel-app.git
   cd vercel-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   Create a `.env` file in the root of your project and add your Vercel Access Token (this file is gitignored to keep your token secure):
   ```env
   VERCEL_TOKEN=your_vercel_access_token_here
   ```

### Running the App

To start the Expo development server, run:

```bash
npx expo start
```

In the terminal output, you can press:
- `i` to open the iOS simulator
- `a` to open the Android emulator
- `w` to open the app in a web browser
- Or scan the QR code with your phone's camera (iOS) or the Expo Go app (Android).

## 🗂️ Project Structure

The source code resides inside the `src/` directory, following Expo Router conventions:

- `src/app/`: The core app navigation. Includes tabs (`(tabs)/`), nested project views, deployment logs, etc.
- `src/components/`: Reusable UI components like headers, themed texts, collapsing sections, and animated icons.
- `src/api/`: Vercel SDK interactions and API wrappers (`vercel.ts`).
- `src/hooks/`: Custom React hooks for theme and color-scheme management.
- `src/theme/`: Shared constants and color palettes for Dark/Light mode support.
- `src/constants/`: Shared app constants.

## 🛡️ Security

> [!WARNING]
> **Never commit your Vercel Access Tokens.** The `.env` file has been added to `.gitignore` to prevent accidental leaks. If you ever accidentally commit a token, revoke it immediately from your Vercel dashboard.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an Issue.

## 📄 License

This project is open-source and available under the standard MIT License.
