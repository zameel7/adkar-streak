import { StyleSheet, useColorScheme } from "react-native";
import { ThemedView } from "./ThemedView";
import { Button, Card } from "@rneui/themed";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ThemedText } from "./ThemedText";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";

type Adkar = {
    title: string;
    adkar: string[];
    translation: string[];
    repeat: string;
};

const AdkarCard = ({ item, index }: { item: Adkar; index: number }) => {
    const colourScheme = useColorScheme();
    const isDarkMode = colourScheme === "dark";

    const [read, setRead] = useState(false);

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
            color: isDarkMode ? "#FF9800" : "#F44336",
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
            color: isDarkMode ? "#FF9800" : "#F44336",
            marginLeft: 15,
            marginBottom: 15,
        },
    });

    return (
        <ThemedView style={styles.cardContainer}>
            <Card containerStyle={styles.card}>
                <Card.Title style={styles.cardTitle}>
                    {index + 1}) {item.title}
                    <Button
                        icon={
                            <Ionicons
                                name="checkmark"
                                size={24}
                                color={
                                    read
                                        ? isDarkMode
                                            ? "#FF9800"
                                            : "#F44336"
                                        : isDarkMode
                                        ? "#424242"
                                        : "#FFFFFF"
                                }
                            />
                        }
                        onPress={async () => {
                            const streakData = await AsyncStorage.getItem(
                                "streakData"
                            );
                            if (streakData) {
                                const data = JSON.parse(streakData);
                                data.morning = {
                                    ...data.morning,
                                    [item.title]: true,
                                };
                                await AsyncStorage.setItem(
                                    "streakData",
                                    JSON.stringify(data)
                                );
                            }
                        }}
                    />
                </Card.Title>
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
