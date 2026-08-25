import { Redirect } from 'expo-router';
import { View, Image } from 'react-native';
import { useUserContext } from '../context/UserContext';
import { GeistSpinner } from '@/components/GeistUI';

export default function Index() {
  const { user, loading } = useUserContext();

  // While the persisted session is being loaded from SecureStore, show a spinner
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <Image 
          source={require('@/assets/images/splash-icon.png')}
          style={{ width: 76, height: 76, marginBottom: 32 }}
          resizeMode="contain"
        />
        <GeistSpinner size={36} color='#fff'/>
      </View>
    );
  }

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/auth" />;
}
