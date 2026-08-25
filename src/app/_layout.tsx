import { Stack, ThemeProvider, DarkTheme, DefaultTheme } from 'expo-router';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { UserProvider } from '../context/UserContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  return (
    <UserProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colorScheme === 'dark' ? '#000000' : '#FFFFFF' },
            headerStyle: { backgroundColor: colorScheme === 'dark' ? '#000000' : '#FFFFFF' },
            headerTintColor: colorScheme === 'dark' ? '#EDEDED' : '#171717',
            headerShadowVisible: false,
            headerTitleStyle: { fontWeight: '600' },
          }}
        >
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="social-sign-in" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen 
            name="project/[id]" 
            options={{ headerShown: true, title: '', headerBackTitle: 'Back' }} 
          />
          <Stack.Screen 
            name="project/[id]/deployments" 
            options={{ headerShown: true, title: 'Deployments', headerBackTitle: 'Back' }} 
          />
          <Stack.Screen 
            name="project/[id]/settings" 
            options={{ headerShown: true, title: 'Project Settings', headerBackTitle: 'Back' }} 
          />
          <Stack.Screen 
            name="project/[id]/env" 
            options={{ headerShown: true, title: 'Environment Variables', headerBackTitle: 'Back' }} 
          />
          <Stack.Screen 
            name="project/[id]/previews" 
            options={{ headerShown: true, title: 'Previews', headerBackTitle: 'Back' }} 
          />
          <Stack.Screen 
            name="deployment/[id]" 
            options={{ headerShown: true, title: 'Deployment', headerBackTitle: 'Back' }} 
          />
          <Stack.Screen 
            name="deployment/[id]/logs" 
            options={{ headerShown: true, title: 'Build Logs', headerBackTitle: 'Back' }} 
          />
          
          {/* Global Settings */}
          <Stack.Screen name="settings/general" options={{ headerShown: true, title: 'General', headerBackTitle: 'Back' }} />
          <Stack.Screen name="settings/billing" options={{ headerShown: true, title: 'Billing', headerBackTitle: 'Back' }} />
          <Stack.Screen name="settings/members" options={{ headerShown: true, title: 'Members', headerBackTitle: 'Back' }} />
          <Stack.Screen name="settings/security" options={{ headerShown: true, title: 'Security', headerBackTitle: 'Back' }} />
          <Stack.Screen name="settings/tokens" options={{ headerShown: true, title: 'Tokens', headerBackTitle: 'Back' }} />

          {/* Project Settings */}
          <Stack.Screen name="project/[id]/settings/general" options={{ headerShown: true, title: 'General', headerBackTitle: 'Back' }} />
          <Stack.Screen name="project/[id]/settings/git" options={{ headerShown: true, title: 'Git', headerBackTitle: 'Back' }} />
          <Stack.Screen name="project/[id]/settings/build" options={{ headerShown: true, title: 'Build & Development', headerBackTitle: 'Back' }} />
        </Stack>
      </ThemeProvider>
    </UserProvider>
  );
}
