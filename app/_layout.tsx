import { ThemedView } from "@/components/ThemedView";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { localDateString } from "@/lib/date";
import { registerForPushNotificationsAsync, schedulePushNotification } from "@/lib/notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { router, Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SQLiteDatabase, SQLiteProvider } from "expo-sqlite";
import React, { Component, Suspense, useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import "react-native-reanimated";

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
    initialRouteName: '(tabs)',
};

// Root Error Boundary: catches uncaught JS errors and shows a recoverable screen instead of crashing
type ErrorBoundaryState = { hasError: boolean; error: Error | null };

class RootErrorBoundary extends Component<
    { children: React.ReactNode },
    ErrorBoundaryState
> {
    state: ErrorBoundaryState = { hasError: false, error: null };

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("RootErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError && this.state.error) {
            return (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorTitle}>Something went wrong</Text>
                    <Text style={styles.errorMessage}>
                        We encountered an unexpected error. Please try again.
                    </Text>
                    <TouchableOpacity
                        style={styles.errorButton}
                        onPress={() => this.setState({ hasError: false, error: null })}
                    >
                        <Text style={styles.errorButtonText}>Try again</Text>
                    </TouchableOpacity>
                </View>
            );
        }
        return this.props.children;
    }
}

const styles = StyleSheet.create({
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        backgroundColor: "#fff",
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: "600",
        marginBottom: 12,
        color: "#000",
    },
    errorMessage: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 24,
        color: "#333",
    },
    errorButton: {
        backgroundColor: "#2196F3",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    errorButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});

// Move notification observer outside the main component to avoid hook issues
function useNotificationObserver() {
    const router = useRouter();

    useEffect(() => {
        let isMounted = true;

        function redirect(notification: Notifications.Notification) {
            const url = notification.request.content.data?.url;
            if (url && typeof url === 'string') {
                router.push(url as any);
            }
        }

        Notifications.getLastNotificationResponseAsync()
            .then((response) => {
                if (!isMounted || !response?.notification) {
                    return;
                }
                redirect(response.notification);
            })
            .catch((error) => {
                console.warn("getLastNotificationResponse failed:", error);
            });

        const subscription =
            Notifications.addNotificationResponseReceivedListener(
                (response) => {
                    redirect(response.notification);
                }
            );

        return () => {
            isMounted = false;
            subscription.remove();
        };
    }, [router]);
}


// Root component that wraps everything with AuthProvider
const RootLayout = () => {
    return (
        <AuthProvider>
            <AuthenticatedApp />
        </AuthProvider>
    );
};

// Component that handles auth routing and renders the app
const AuthenticatedApp = () => {
    const { initialized } = useAuth();
    const today = localDateString();

    // Always call all hooks first
    useNotificationObserver();

    // Read onboarding state on mount. If first-run, redirect to /onboarding
    // before hiding the splash so the user never sees (tabs) flash.
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const done = await AsyncStorage.getItem('onboardingComplete');
                if (cancelled) return;
                if (!done) {
                    router.replace('/onboarding' as any);
                }
            } catch (e) {
                console.warn('Failed to read onboarding state:', e);
            }
            if (cancelled) return;
            SplashScreen.hideAsync();
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!initialized) return;

        const updateStreakData = async () => {
            const streakData = await AsyncStorage.getItem("streakData");
            if (
                (streakData && JSON.parse(streakData).date !== today) ||
                !streakData
            ) {
                await AsyncStorage.setItem(
                    "streakData",
                    JSON.stringify({ date: today, morning: {}, evening: {} })
                );
            }
        };

        (async () => {
            try {
                const status = await registerForPushNotificationsAsync();
                if (status !== "granted") return;

                Notifications.setNotificationHandler({
                    handleNotification: async () => ({
                        shouldShowBanner: true,
                        shouldShowList: true,
                        shouldPlaySound: false,
                        shouldSetBadge: false,
                    }),
                });
                await schedulePushNotification();
            } catch (error) {
                console.error("Notification setup error:", error);
            }
        })();

        updateStreakData();
    }, [initialized, today]);


    // Database initialization function
    async function insertMissingDays(db: SQLiteDatabase) {
        const DATABASE_VERSION = 1;

        try {
            // Run all pragmas in a single batch — under New Architecture on
            // Android, splitting them across multiple execAsync calls before
            // the connection has fully settled can race and surface as
            // "database connection error".
            await db.execAsync(
                `PRAGMA journal_mode = WAL;
                 PRAGMA busy_timeout = 10000;
                 PRAGMA synchronous = NORMAL;
                 PRAGMA temp_store = MEMORY;`
            );

            const userVersion = await db.getFirstAsync<{ user_version: number }>(
                "PRAGMA user_version"
            );

            if (userVersion?.user_version === 0) {
                await db.execAsync(`
                    CREATE TABLE IF NOT EXISTS adkarStreaks (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        morning BOOLEAN NOT NULL DEFAULT FALSE,
                        evening BOOLEAN NOT NULL DEFAULT FALSE,
                        date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP UNIQUE
                    );
                    PRAGMA user_version = ${DATABASE_VERSION};
                `);
            }
        } catch (error) {
            console.error("Error initializing database:", error);
            // Do not re-throw: allow the app to render so it doesn't crash (e.g. on Android production)
        }
    }

    // Always render the Stack - no conditional rendering of the navigator
    return (
        <Suspense
            fallback={
                <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#2196F3" />
                </ThemedView>
            }
        >
            <SQLiteProvider
                databaseName="adkar.db"
                onInit={insertMissingDays}
            >
                <ThemeProvider>
                    <Stack
                        screenOptions={{
                            headerShown: false,
                            animation: 'fade'
                        }}
                    >
                        <Stack.Screen name="onboarding" />
                        <Stack.Screen name="auth" />
                        <Stack.Screen name="(tabs)" />
                        <Stack.Screen
                            name="morning-adkar"
                            options={{
                                headerShown: true,
                                title: "Morning Adkar",
                                headerBackTitle: "Home",
                                headerTintColor: '#2196F3',
                            }}
                        />
                        <Stack.Screen
                            name="evening-adkar"
                            options={{
                                headerShown: true,
                                title: "Evening Adkar",
                                headerBackTitle: "Home",
                                headerTintColor: '#1976D2',
                            }}
                        />
                    </Stack>
                </ThemeProvider>
            </SQLiteProvider>
        </Suspense>
    );
};

export default function AppWithErrorBoundary() {
    return (
        <RootErrorBoundary>
            <RootLayout />
        </RootErrorBoundary>
    );
}
