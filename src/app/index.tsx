import { Redirect } from 'expo-router';
import { View } from 'react-native';
import { useUserContext } from '../context/UserContext';
import { GeistSpinner } from '@/components/GeistUI';

export default function Index() {
  const { user, loading } = useUserContext();

  // While the persisted session is being loaded from SecureStore, show a spinner
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <GeistSpinner size={36} color='#fff'/>
      </View>
    );
  }

  // Session found — go straight to the app
  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  // No session — show the sign-in screen
  return <Redirect href="/auth" />;
}
