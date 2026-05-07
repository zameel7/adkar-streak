import { ThemedView } from '@/components/ThemedView';
import { isPWA } from '@/lib/pwa';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';

type Target = '/(tabs)/home' | '/onboarding' | '/pwa';

export default function Index() {
    const [target, setTarget] = useState<Target | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const done = await AsyncStorage.getItem('onboardingComplete');
                if (cancelled) return;
                if (!done) {
                    setTarget('/onboarding');
                    return;
                }
                setTarget(isPWA() ? '/pwa' : '/(tabs)/home');
            } catch (e) {
                console.warn('Failed to read onboarding state:', e);
                if (!cancelled) setTarget(isPWA() ? '/pwa' : '/(tabs)/home');
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    if (!target) {
        return (
            <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#2196F3" />
            </ThemedView>
        );
    }

    return <Redirect href={target as any} />;
}
