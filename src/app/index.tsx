import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { authClient } from '../lib/auth-client';

export default function Index() {
  const { data: session, isPending } = authClient.useSession();

  // While the persisted session is being loaded from SecureStore, show a spinner
  if (isPending) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  // Session found — go straight to the app
  if (session?.user) {
    return <Redirect href="/(tabs)" />;
  }

  // No session — show the sign-in screen
  return <Redirect href="/auth" />;
}

