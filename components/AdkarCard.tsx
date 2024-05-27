import { StyleSheet, useColorScheme } from "react-native";
import { ThemedView } from "./ThemedView";
import { Button, Card } from "@rneui/themed";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ThemedText } from "./ThemedText";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { Colors } from "@/constants/Colors";

type Adkar = {
    title: string;
    adkar: string[];
    translation: string[];
    repeat: string;
};

const AdkarCard = ({
    item,
    index,
    type,
}: {
    item: Adkar;
    index: number;
    type: string;
}) => {
    const colourScheme = useColorScheme();
    const colors = Colors[colourScheme ?? "light"];
    const isDarkMode = colourScheme === "dark";
    const db = useSQLiteContext();

    const [read, setRead] = useState(false);

    useEffect(() => {
        const checkRead = async () => {
            const streakData = await AsyncStorage.getItem("streakData");
            if (streakData) {
                const data = JSON.parse(streakData);
                if (data.morning[index] && type === "morning") {
                    setRead(true);
                } else if (data.evening[index] && type === "evening") {
                    setRead(true);
                }
            }
        };
        checkRead();
    }, []);

    const styles = StyleSheet.create({
        titleContainer: {
            padding: 16,
            flex: 1,
        },
        cardContainer: {
            padding: 10,
        },
        card: {
            borderRadius: 10,
            padding: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 5,
            elevation: 5,
            backgroundColor: isDarkMode ? "#424242" : "#FFFFFF",
        },
        cardTitle: {
            fontSize: 20,
            fontWeight: "bold",
            color: colors.primary,
            textAlign: "center",
            marginBottom: 10,
        },
        adkarText: {
            fontSize: 24,
            letterSpacing: 2,
            lineHeight: 35,
            marginBottom: 8,
            color: isDarkMode ? "#FFFFFF" : "#000000",
            backgroundColor: isDarkMode ? "#424242" : "#FFFFFF",
            padding: 10,
        },
        translationText: {
            fontSize: 18,
            margin: 15,
            color: isDarkMode ? "#BDBDBD" : "#757575",
        },
        repeatText: {
            fontSize: 16,
            fontWeight: "bold",
            color: colors.primary,
            marginLeft: 15,
            marginBottom: 15,
        },
        readButton: {
            backgroundColor: read
                ? colors.primary
                : isDarkMode
                ? "#757575"
                : "#E0E0E0",
            borderRadius: 10,
            padding: 10,
            margin: 10,
            alignSelf: "center",
        },
        buttonIcon: {
            color: read ? "#FFFFFF" : colors.primary
        },
    });

    const checkAndMarkStreak = async () => {
        const streakData = await AsyncStorage.getItem("streakData");
        if (streakData) {
            const data = JSON.parse(streakData);

            if (Object.keys(data.morning).length === 24) {
                await db.execAsync(`
                    UPDATE adkarStreaks SET morning = true WHERE date = CURRENT_DATE
                `);
            }
            if (Object.keys(data.evening).length === 23 && type) {
                await db.execAsync(`
                    UPDATE adkarStreaks SET evening = true WHERE date = CURRENT_DATE
                `);
            }
        }
    };

    return (
        <ThemedView style={styles.cardContainer}>
            <Card containerStyle={styles.card}>
                <Card.Title style={styles.cardTitle}>
                    {index + 1}) {item.title}
                </Card.Title>
                <Button
                    icon={
                        <Ionicons
                            name="checkmark"
                            size={24}
                            style={styles.buttonIcon}
                        />
                    }
                    buttonStyle={styles.readButton}
                    onPress={async () => {
                        const streakData = await AsyncStorage.getItem(
                            "streakData"
                        );
                        if (streakData) {
                            const data = JSON.parse(streakData);
                            if (type === "evening") {
                                data.evening = {
                                    ...data.evening,
                                    [index]: true,
                                };
                            } else if (type === "morning") {
                                data.morning = {
                                    ...data.morning,
                                    [index]: true,
                                };
                            }
                            await AsyncStorage.setItem(
                                "streakData",
                                JSON.stringify(data)
                            );
                            setRead(true);
                        }
                        
                        await checkAndMarkStreak();
                    }}
                />
                <Card.Divider />
                {item.adkar.map((adkar, index) => (
                    <ThemedView key={index}>
                        <ThemedText style={styles.adkarText}>
                            {adkar}
                        </ThemedText>
                        <ThemedText style={styles.translationText}>
                            {item.translation[index]}
                        </ThemedText>
                        <ThemedText style={styles.repeatText}>
                            Repeat: {item.repeat}
                        </ThemedText>
                    </ThemedView>
                ))}
            </Card>
        </ThemedView>
    );
};

export default AdkarCard;
