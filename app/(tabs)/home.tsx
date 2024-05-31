import { SafeAreaProvider } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useContext, useEffect, useState } from "react";
import { Button } from "@rneui/themed";
import LinearGradient from "react-native-linear-gradient";
import { router } from "expo-router";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { HelloWave } from "@/components/HelloWave";
import { useSQLiteContext } from "expo-sqlite";
import { Colors } from "@/constants/Colors";
import ThemeContext from "@/context/ThemeContext";

function adkarTime() {
    const hours = new Date().getHours();
    return hours >= 5 && hours < 7
        ? "morning"
        : hours >= 16 && hours < 19
        ? "evening"
        : "night";
}

type Row = {
    id: number;
    morning: boolean;
    evening: boolean;
    date: string;
};

const Home = () => {
    const [name, setName] = useState("Hero" as string);
    const [morningStreak, setMorningStreak] = useState(false);
    const [eveningStreak, setEveningStreak] = useState(false);
    const [streak, setStreak] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    const db = useSQLiteContext();
    const { theme: colorScheme } = useContext(ThemeContext);
    const colors = Colors[colorScheme as keyof typeof Colors];

    const time = adkarTime();

    useEffect(() => {
        AsyncStorage.getItem("name").then((name) => {
            if (name) {
                setName(name);
            }
        });

        async function insertMissingDays() {
            const result = await db.getAllAsync(
                "SELECT * FROM adkarStreaks WHERE date = CURRENT_DATE"
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

            let startDate, endDate;
            if (lastDate < today) {
                startDate = lastDate;
                endDate = today;
            } else {
                startDate = today;
                endDate = lastDate;
            }

            const diff = Math.abs(endDate.getDate() - startDate.getDate());
            for (let i = 1; i < diff; i++) {
                const dateToInsert = new Date(startDate);
                dateToInsert.setDate(startDate.getDate() - i);

                await statement.executeAsync({
                    $value: dateToInsert.toISOString().slice(0, 10),
                });
                console.log(
                    `Inserted missing day: ${dateToInsert
                        .toISOString()
                        .slice(0, 10)}`
                );
            }
        }

        async function getStreak() {
            await insertMissingDays();

            const result = await db.getFirstAsync<{
                morning: boolean;
                evening: boolean;
            }>(
                "SELECT morning, evening FROM adkarStreaks WHERE date = CURRENT_DATE"
            );

            if (result) {
                setMorningStreak(result.morning);
                setEveningStreak(result.evening);
            }
        }

        async function calculateStreak() {
            const records = await db.getAllAsync(
                "SELECT id, date, morning, evening FROM adkarStreaks ORDER BY date ASC"
            );
            const today = new Date().toISOString().slice(0, 10);

            let currentStreak = 0;

            for (let i = 0; i < records.length; i++) {
                const { date, morning, evening } = records[i] as Row;

                if (morning && evening) {
                    currentStreak++;
                } else {
                    if (date !== today) {
                        currentStreak = 0; // Reset streak if activities are not completed for the day
                    }
                }
            }

            setStreak(currentStreak);
        }

        getStreak();
        calculateStreak();
    }, [refreshing]);

    function getDayNightIcon() {
        const hours = new Date().getHours();
        return hours >= 6 && hours < 16
            ? hours >= 8
                ? "sunny"
                : "partly-sunny"
            : "moon";
    }

    const styles = StyleSheet.create({
        headerImage: {
            color: "#808080",
            bottom: -90,
            left: -35,
            position: "absolute",
        },
        dayNightIcon: {
            color: "#808080",
            bottom: 0,
            left: 10,
            position: "absolute",
        },
        titleContainer: {
            flexDirection: "column",
            alignItems: "center",
            padding: 16,
            marginVertical: 12,
        },
        buttonContainer: {
            flexDirection: "column",
            paddingHorizontal: 16,
            marginTop: 24,
        },
        button: {
            marginVertical: 10,
            borderRadius: 8,
        },
        footer: {
            flex: 1,
            alignItems: "center",
        },
        streak: {
            fontSize: 18,
            fontWeight: "bold",
        },
        streakContainer: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.border,
            padding: 16,
            borderRadius: 8,
            shadowColor: colors.shadow,
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 1.84,
            elevation: 3,
            marginTop: 16,
        },
        streakLabel: {
            fontSize: 20,
            fontWeight: "bold",
            color: colors.text,
        },
        streakValue: {
            fontSize: 22,
            fontWeight: "bold",
            color: colors.streakValue,
            marginRight: 8,
        },
        streakIcon: {
            color: colors.streakValue,
        },
    });

    return (
        <SafeAreaProvider>
            <ParallaxScrollView
                headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
                headerImage={
                    <Ionicons
                        size={200}
                        name={getDayNightIcon()}
                        style={styles.dayNightIcon}
                    />
                }
                setRefreshingAPI={setRefreshing}
            >
                <ThemedView style={styles.titleContainer}>
                    <ThemedText type="title">
                        Hey there {name}! <HelloWave />
                    </ThemedText>

                    {time == "morning" && !morningStreak ? (
                        <ThemedText style={styles.streak}>
                            Complete your morning adkar
                        </ThemedText>
                    ) : time === "evening" && !eveningStreak ? (
                        <ThemedText style={styles.streak}>
                            Complete your evening adkar
                        </ThemedText>
                    ) : time === "morning" ? (
                        <ThemedText style={styles.streak}>
                            You have completed your morning adkar!
                        </ThemedText>
                    ) : time === "evening" ? (
                        <ThemedText style={styles.streak}>
                            You have completed your evening adkar!
                        </ThemedText>
                    ) : null}
                </ThemedView>
                <ThemedView style={styles.streakContainer}>
                    {streak > 0 ? (
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                            }}
                        >
                            <Ionicons
                                name="flame"
                                size={24}
                                style={styles.streakIcon}
                            />
                            <ThemedText style={styles.streakValue}>
                                {streak}
                            </ThemedText>
                            <ThemedText style={styles.streakLabel}>
                                day streak
                            </ThemedText>
                        </View>
                    ) : (
                        <ThemedText style={styles.streakLabel}>
                            No current streak{" "}
                            <Ionicons
                                name="sad"
                                size={18}
                                style={styles.streakIcon}
                            />
                        </ThemedText>
                    )}
                </ThemedView>
                <ThemedView style={styles.buttonContainer}>
                    <Button
                        ViewComponent={LinearGradient}
                        linearGradientProps={{
                            colors: [colors.primary, colors.secondary],
                            start: { x: 0, y: 0.5 },
                            end: { x: 1, y: 0.5 },
                        }}
                        buttonStyle={styles.button}
                        onPress={() => {
                            router.push("/morning-adkar");
                        }}
                    >
                        Morning Adkar
                    </Button>
                    <Button
                        ViewComponent={LinearGradient}
                        linearGradientProps={{
                            colors: [colors.primary, colors.secondary],
                            start: { x: 0, y: 0.5 },
                            end: { x: 1, y: 0.5 },
                        }}
                        buttonStyle={styles.button}
                        onPress={() => {
                            router.push("/evening-adkar");
                        }}
                    >
                        Evening Adkar
                    </Button>
                </ThemedView>
                <ThemedView style={styles.footer}>
                    <View
                        style={{
                            borderBottomColor: colors.tint,
                            borderBottomWidth: 1,
                            width: "100%",
                            marginVertical: 16,
                        }}
                    />
                    <ThemedText type="default">
                        "Remember Allah in times of ease and He will remember
                        you in times of difficulty."
                    </ThemedText>
                    <ThemedText
                        type="default"
                        style={{
                            color: "#808080",
                        }}
                    >
                        - Prophet Muhammed ﷺ
                    </ThemedText>
                    <View
                        style={{
                            borderBottomColor: colors.tint,
                            borderBottomWidth: 1,
                            width: "100%",
                            marginVertical: 16,
                        }}
                    />
                </ThemedView>
            </ParallaxScrollView>
        </SafeAreaProvider>
    );
};

export default Home;
