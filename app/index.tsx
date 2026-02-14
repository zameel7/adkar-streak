import { ThemedView } from '@/components/ThemedView';
import { ActivityIndicator } from 'react-native';

// Auth routing is handled by _layout.tsx — this screen only shows a loading spinner.
export default function Index() {
  return (
    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#2196F3" />
    </ThemedView>
  );
}
