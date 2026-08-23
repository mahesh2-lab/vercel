import { Redirect } from 'expo-router';

export default function Index() {
  // Bypassing auth screen to use env variable for authentication
  return <Redirect href="/(tabs)" />;
}
