import { ThemedView } from "@/components/ThemedView";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SQLiteDatabase, SQLiteProvider } from "expo-sqlite";
import React, { Suspense, useEffect, useState } from "react";
import { ActivityIndicator, Platform } from "react-native";
import "react-native-reanimated";

SplashScreen.preventAutoHideAsync();

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

        Notifications.getLastNotificationResponseAsync().then((response) => {
            if (!isMounted || !response?.notification) {
                return;
            }
            redirect(response?.notification);
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
    const { initialized, session } = useAuth();
    const today = new Date().toISOString().split("T")[0];
    const router = useRouter();
    const segments = useSegments();
    const [isMounted, setIsMounted] = useState(false);

    // Always call all hooks first
    useNotificationObserver();

    // Track when the component is mounted
    useEffect(() => {
        const timeout = setTimeout(() => {
            setIsMounted(true);
            SplashScreen.hideAsync();
        }, 500); // Give time for Stack to mount
        return () => clearTimeout(timeout);
    }, []);

    // Handle navigation based on auth state changes (after mount)
    useEffect(() => {
        if (!initialized || !isMounted) return;

        const inAuthGroup = segments[0] === 'auth';
        
        if (session && inAuthGroup) {
            // User is logged in but on auth screen, redirect to home
            router.replace('/(tabs)/home');
        } else if (!session && !inAuthGroup) {
            // User is logged out but not on auth screen, redirect to auth
            router.replace('/auth');
        }
    }, [initialized, session, isMounted, segments, router]);

    useEffect(() => {
        if (!initialized) return;

        const updateStreakData = async () => {
            const streakData = await AsyncStorage.getItem("streakData");
            if (
                (streakData && JSON.parse(streakData).date !== today) ||
                !streakData
            ) {
                AsyncStorage.setItem(
                    "streakData",
                    JSON.stringify({ date: today, morning: {}, evening: {} })
                );
            }
        };

        (async () => {
            try {
                const status = await registerForPushNotificationsAsync();
                if (status !== "granted") return;

                if (Platform.OS === "android") {
                    Notifications.getNotificationChannelsAsync();
                    Notifications.setNotificationHandler({
                        handleNotification: async () => ({
                            shouldShowBanner: true,
                            shouldShowList: true,
                            shouldPlaySound: false,
                            shouldSetBadge: false,
                        }),
                    });
                } else {
                    Notifications.setNotificationHandler({
                        handleNotification: async () => ({
                            shouldShowBanner: true,
                            shouldShowList: true,
                            shouldPlaySound: false,
                            shouldSetBadge: false,
                        }),
                    });
                }
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
            // Set WAL mode first for better concurrency and reduce locks
            await db.execAsync("PRAGMA journal_mode = WAL;");
            // Increase timeout to 10 seconds for better reliability
            await db.execAsync("PRAGMA busy_timeout = 10000;");
            // Optimize for mobile - reduce lock duration while maintaining integrity
            await db.execAsync("PRAGMA synchronous = NORMAL;");
            // Keep temporary data in memory to reduce file locks
            await db.execAsync("PRAGMA temp_store = MEMORY;");
            
            let user_version = await db.getFirstAsync<{ user_version: number }>(
                "PRAGMA user_version"
            );

            if (user_version?.user_version === 0) {
                await db.execAsync(`
                    CREATE TABLE IF NOT EXISTS adkarStreaks (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        morning BOOLEAN NOT NULL DEFAULT FALSE,
                        evening BOOLEAN NOT NULL DEFAULT FALSE,
                        date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP UNIQUE
                    );
                `);
                await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
            }
        } catch (error) {
            console.error("Error initializing database:", error);
            // Re-throw to let SQLiteProvider handle it
            throw error;
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
                useSuspense
            >
                <ThemeProvider>
                    <Stack
                        screenOptions={{
                            headerShown: false,
                            animation: 'fade'
                        }}
                    >
                        <Stack.Screen name="auth" />
                        <Stack.Screen name="index" />
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

// Define a type for the time object
interface TimeObject {
    hour: number;
    minute: number;
}

// Helper function to parse ISO date string
const parseTime = (timeString: string | null): TimeObject => {
    if (timeString) {
        const date = new Date(timeString);
        const hour = date.getHours();
        const minute = date.getMinutes();
        return { hour, minute };
    }
    return { hour: 5, minute: 30 }; // Default values
};

// Function to schedule notifications
async function schedulePushNotification(): Promise<void> {
    try {
        await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
        console.error("Error cancelling scheduled notifications:", error);
    }

    // Retrieve stored notification times
    const morningTime = await AsyncStorage.getItem("morningTime");
    const eveningTime = await AsyncStorage.getItem("eveningTime");

    // Helper function to schedule a notification
    const scheduleNotification = async (
        title: string,
        body: string,
        time: string | null,
        defaultHour: number,
        defaultMinute: number
    ): Promise<void> => {
        const { hour, minute } = parseTime(time);

        if (Platform.OS === 'android') {
            // Use daily trigger for Android
            await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                },
                trigger: {
                    hour,
                    minute,
                    repeats: true,
                } as any,
            });
        } else {
            // Use calendar trigger for iOS
            await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                },
                trigger: {
                    hour,
                    minute,
                    repeats: true,
                } as any,
            });
        }
    };

    // Schedule morning notification
    await scheduleNotification(
        "Time for morning Adkar! 🌞",
        "Jābir (raḍiy Allāhu ʿanhū) relates that after Allah’s Messenger ﷺ would perform Fajr, he used to remain seated in his place of prayer until the sun had fully risen (Muslim).",
        morningTime,
        5,
        30
    );

    // Schedule evening notification
    await scheduleNotification(
        "Time for evening Adkar!",
        "'Believers, remember Allah often and glorify Him morning and evening' (33:41-42).",
        eveningTime,
        16,
        30
    );
}

type PermissionStatus = "granted" | "denied" | "undetermined";

async function registerForPushNotificationsAsync(): Promise<PermissionStatus> {
    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#FF231F7C",
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } =
            await Notifications.getPermissionsAsync();
        let finalStatus: PermissionStatus = existingStatus;
        if (existingStatus !== "granted") {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        return finalStatus;
    }

    alert("Must use physical device for Push Notifications");
    return "denied";
}

export default RootLayout;
