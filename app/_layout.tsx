import { Stack, router } from "expo-router";
import "react-native-reanimated";
import { SQLiteDatabase, SQLiteProvider } from "expo-sqlite";
import { Suspense, useContext, useEffect } from "react";
import { ActivityIndicator, Platform } from "react-native";
import { Colors } from "@/constants/Colors";
import { ThemedView } from "@/components/ThemedView";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import ThemeContext, { ThemeProvider } from "@/context/ThemeContext";

const RootLayout = () => {
    const { theme: colorScheme } = useContext(ThemeContext);
    const today = new Date().toISOString().split("T")[0];

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
    }, []);

    return (
        <Suspense
            fallback={
                <ThemedView>
                    <ActivityIndicator
                        size="large"
                        color={
                            colorScheme === "dark"
                                ? Colors.light.tint
                                : Colors.dark.tint
                        }
                    />
                </ThemedView>
            }
        >
            <SQLiteProvider
                databaseName="adkar.db"
                onInit={insertMissingDays}
                useSuspense
            >
                <ThemeProvider>
                    <Stack>
                        <Stack.Screen
                            name="index"
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="(tabs)"
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="morning-adkar"
                            options={{
                                title: "Morning Adkar",
                                headerTitleStyle: {
                                    color: colorScheme === "dark"
                                    ? Colors.light.text
                                    : Colors.dark.text,
                                },
                                headerBackTitle: "Back",
                                headerStyle: {
                                    backgroundColor:
                                        colorScheme === "dark"
                                            ? Colors.light.background
                                            : Colors.dark.background,
                                },
                            }}
                        />
                        <Stack.Screen
                            name="evening-adkar"
                            options={{
                                title: "Evening Adkar",
                                headerTitleStyle: {
                                    color: colorScheme === "dark"
                                    ? Colors.light.text
                                    : Colors.dark.text,
                                },
                                headerBackTitle: "Back",
                                headerStyle: {
                                    backgroundColor:
                                        colorScheme === "dark"
                                            ? Colors.light.background
                                            : Colors.dark.background,
                                },
                            }}
                        />
                    </Stack>
                </ThemeProvider>
            </SQLiteProvider>
        </Suspense>
    );
};

async function schedulePushNotification() {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Time for morning Adkar! 🌞",
            body: "Jābir (raḍiy Allāhu ʿanhū) relates that after Allah’s Messenger ﷺ would perform Fajr, he used to remain seated in his place of prayer until the sun had fully risen (Muslim).",
        },
        trigger: {
            hour: 5,
            minute: 30,
            repeats: true,
        },
    });
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Time for evening Adkar! 🌙",
            body: "'Believers, remember Allah often and glorify Him morning and evening' (33:41-42).",
        },
        trigger: {
            hour: 16,
            minute: 30,
            repeats: true,
        },
    });
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
