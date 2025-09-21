import { Stack, router } from "expo-router";
import "react-native-reanimated";
import { SQLiteDatabase, SQLiteProvider } from "expo-sqlite";
import { Suspense, useContext, useEffect } from "react";
import { ActivityIndicator, Platform } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import ThemeContext, { ThemeProvider } from "@/context/ThemeContext";
import StackScreen from "./stack";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
    const today = new Date().toISOString().split("T")[0];
    const { theme: colorScheme } = useContext(ThemeContext);

    async function insertMissingDays(db: SQLiteDatabase) {
        const DATABASE_VERSION = 1;
        let user_version = await db.getFirstAsync<{ user_version: number }>(
            "PRAGMA user_version"
        );

        try {
            if (user_version?.user_version === 0) {
                // Set the journal mode to WAL
                await db.execAsync("PRAGMA journal_mode = WAL;");

                // Create the table if it does not exist
                await db.execAsync(`
                    CREATE TABLE IF NOT EXISTS adkarStreaks (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        morning BOOLEAN NOT NULL DEFAULT FALSE,
                        evening BOOLEAN NOT NULL DEFAULT FALSE,
                        date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP UNIQUE
                    );
                `);

                // Update the user_version
                await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
            }
        } catch (error) {
            console.error("Error inserting missing days:", error);
        }
    }

    useNotificationObserver();

    useEffect(() => {
        const timeout = setTimeout(() => {
            SplashScreen.hideAsync();
        }, 2000);

        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        
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

        registerForPushNotificationsAsync();

        if (Platform.OS === "android") {
            Notifications.getNotificationChannelsAsync();
            Notifications.setNotificationHandler({
                handleNotification: async () => ({
                    shouldShowAlert: true,
                    shouldPlaySound: false,
                    shouldSetBadge: false,
                }),
            });
            schedulePushNotification();
        }

        updateStreakData();
    }, [colorScheme]);

    return (
        <Suspense
            fallback={
                <ThemedView>
                    <ActivityIndicator size="large" />
                </ThemedView>
            }
        >
            <SQLiteProvider
                databaseName="adkar.db"
                onInit={insertMissingDays}
                useSuspense
            >
                <ThemeProvider>
                    <StackScreen />
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

        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
            },
            trigger: {
                hour,
                minute,
                repeats: true,
            },
        });
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

async function registerForPushNotificationsAsync() {
    let token;

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
        let finalStatus = existingStatus;
        if (existingStatus !== "granted") {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
    } else {
        alert("Must use physical device for Push Notifications");
    }

    return token;
}

function useNotificationObserver() {
    useEffect(() => {
        let isMounted = true;

        function redirect(notification: Notifications.Notification) {
            const url = notification.request.content.data?.url;
            if (url) {
                router.push(url);
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
    }, []);
}

export default RootLayout;
