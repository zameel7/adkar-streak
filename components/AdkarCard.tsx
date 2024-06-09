import { StyleSheet, ScrollView, View } from "react-native";
import { ThemedView } from "./ThemedView";
import { Button, Card } from "@rneui/themed";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ThemedText } from "./ThemedText";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useContext, useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { Colors } from "@/constants/Colors";
import { Collapsible } from "./Collapsible";
import ThemeContext from "@/context/ThemeContext";

type Adkar = {
    title: string;
    adkar: string[];
    translation: string[];
    repeat: string;
    repeatCount: number;
};

const AdkarCard = ({
    item,
    index,
    type,
    height,
    setIndex,
}: {
    item: Adkar;
    index: number;
    type: string;
    height: number;
    setIndex: (index: number) => void;
}) => {
    const { theme: colourScheme } = useContext(ThemeContext);
    const colors = Colors[colourScheme as keyof typeof Colors];
    const db = useSQLiteContext();

    const [read, setRead] = useState(false);
    const [translation, setTranslation] = useState(false);

    useEffect(() => {
        const checkRead = async () => {
            const streakData = await AsyncStorage.getItem("streakData");
            if (streakData) {
                const data = JSON.parse(streakData);
                if (data.morning[index] && type === "morning") {
                    setRead(!read);
                } else if (data.evening[index] && type === "evening") {
                    setRead(!read);
                }
            }
        };

        const showTranslation = async () => {
            const translation = await AsyncStorage.getItem("translations");
            if (translation) {
                setTranslation(JSON.parse(translation));
            }
        };

        showTranslation();
        checkRead();
    }, []);

    const styles = StyleSheet.create({
        body: {
            padding: 10,
            backgroundColor: colors.background,
            width: "90%",
            justifyContent: "center",
            alignSelf: "center",
        },
        header: {
            marginTop: 20,
            justifyContent: "center",
            padding: 16,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
            borderBottomWidth: 1,
        },
        title: {
            fontSize: 20,
            fontWeight: "bold",
            color: colors.primary,
        },
        adkarText: {
            fontSize: 24,
            letterSpacing: 2,
            lineHeight: 35,
            marginBottom: 8,
            color: colors.input,
            padding: 10,
            fontWeight: "bold",
        },
        translationText: {
            fontSize: 18,
            margin: 15,
            color: colors.placeholder,
        },
        repeatText: {
            fontSize: 16,
            fontWeight: "bold",
            color: colors.primary,
            marginLeft: 15,
            marginBottom: 15,
        },
        readButton: {
            backgroundColor: read ? colors.primary : colors.border,
            borderRadius: 10,
            padding: 10,
            margin: 10,
        },
        buttonIcon: {
            color: read ? "#FFFFFF" : colors.primary,
        },
        counter: {
            paddingHorizontal: 8,
            borderRadius: 20,
            borderStyle: "solid",
            borderWidth: 1,
            borderColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
            height: 30,
            marginVertical: 20,
        },
        counterText: {
            fontSize: 16,
            fontWeight: "bold",
            color: colors.primary,
            lineHeight: 20,
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
            if (Object.keys(data.evening).length === 24) {
                await db.execAsync(`
                    UPDATE adkarStreaks SET evening = true WHERE date = CURRENT_DATE
                `);
            }
        }
    };

    return (
        <ThemedView style={styles.body}>
            <ThemedView style={styles.header}>
                <ThemedText style={styles.title}>{item.title}</ThemedText>
                <ThemedView
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                    }}
                >
                    <View style={styles.counter}>
                        <ThemedText style={styles.counterText}>
                            {index + 1} / 24
                        </ThemedText>
                    </View>
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
                                        [index]: !read,
                                    };
                                } else if (type === "morning") {
                                    data.morning = {
                                        ...data.morning,
                                        [index]: !read,
                                    };
                                }
                                await AsyncStorage.setItem(
                                    "streakData",
                                    JSON.stringify(data)
                                );
                                setRead(!read);
                            }

                            await checkAndMarkStreak();
                        }}
                    />
                </ThemedView>
            </ThemedView>
            <ThemedView style={{height: height}}>
                {item.adkar.map((adkar, index) => (
                    <ThemedView key={index}>
                        <ThemedText style={styles.adkarText}>
                            {adkar}
                        </ThemedText>
                        <ThemedText style={styles.repeatText}>
                            Repeat: {item.repeat}
                        </ThemedText>
                        {translation && (
                            <ThemedText style={styles.translationText}>
                                {item.translation[index]}
                            </ThemedText>
                        )}
                    </ThemedView>
                ))}
            </ThemedView>
        </ThemedView>
    );
};

export default AdkarCard;
