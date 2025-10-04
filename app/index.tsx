import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator } from 'react-native';

export default function Index() {
  const { session, initialized } = useAuth();

  useEffect(() => {
    if (!initialized) return;

    // Add a small delay to ensure auth state has stabilized
    const timer = setTimeout(() => {
      if (session) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/auth');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [session, initialized]);

  // Always show loading while determining where to navigate
  return (
    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#2196F3" />
      <ThemedText style={{ marginTop: 16, textAlign: 'center' }}>
        {!initialized ? 'Initializing...' : session ? 'Redirecting to app...' : 'Redirecting to login...'}
      </ThemedText>
    </ThemedView>
  );
}