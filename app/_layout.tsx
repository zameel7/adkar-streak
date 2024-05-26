import { Stack } from "expo-router";
import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { useColorScheme } from "@/hooks/useColorScheme";
import "react-native-reanimated";
import { SQLiteDatabase, SQLiteProvider } from "expo-sqlite";
import { Suspense, useEffect } from "react";
import { ActivityIndicator, Alert } from "react-native";
import { Colors } from "@/constants/Colors";
import { ThemedView } from "@/components/ThemedView";
import AsyncStorage from "@react-native-async-storage/async-storage";

const RootLayout = () => {
    const colorScheme = useColorScheme();
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
                <ThemeProvider
                    value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
                >
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
                            options={{ title: "Morning Adkar" }}
                        />
                        <Stack.Screen
                            name="evening-adkar"
                            options={{ title: "Evening Adkar" }}
                        />
                    </Stack>
                </ThemeProvider>
            </SQLiteProvider>
        </Suspense>
    );
};

export default RootLayout;
