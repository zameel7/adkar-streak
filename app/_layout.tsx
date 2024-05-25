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

            type Row = {
                id: number;
                morning: boolean;
                evening: boolean;
                date: string;
            };

            const result = await db.getAllAsync(
                "SELECT * FROM adkarStreaks ORDER BY date DESC LIMIT 1"
            );


            if (result.length === 0) {
                await db.execAsync(`
                    INSERT INTO adkarStreaks (date) VALUES (date('now'))
                `);
                return;
            }

            const lastRow = result[0] as Row;
            if (!lastRow || !lastRow.date) {
                console.error("Invalid data format in adkarStreaks table.");
                return;
            }

            const lastDate = new Date(lastRow.date);
            const today = new Date();

            const statement = await db.prepareAsync(
                "INSERT INTO adkarStreaks (date) VALUES ($value)"
            );
            if (lastDate.getDate() !== today.getDate()) {
                const diff = Math.abs(today.getDate() - lastDate.getDate());

                for (let i = 1; i < diff; i++) {
                    await statement.executeAsync({
                        $value: `date('now', '-${i} day')`,
                    });
                }
            }
        } catch (error) {
            console.error("Error inserting missing days:", error);
        }
    }

    useEffect(() => {
        const updateStreakData = async () => {
            const streakData = await AsyncStorage.getItem('streakData');
            if (streakData && JSON.parse(streakData).date !== today || !streakData) {
                AsyncStorage.setItem('streakData', JSON.stringify({ date: today, morning: {}, evening: {} }));
            }
        };

        updateStreakData();
    }, [])

    return (
        <Suspense fallback={
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
        }>
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
