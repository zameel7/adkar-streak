import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import EveningAdkarData from "@/assets/adkars/evening.json";
import { Colors } from "@/constants/Colors";

import { Button, Card } from "@rneui/themed";

import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    ScrollView,
    StyleSheet,
    useColorScheme,
    View,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Carousel from "react-native-reanimated-carousel";
import { useSQLiteContext } from "expo-sqlite";
import Ionicons from "@expo/vector-icons/Ionicons";
import AdkarCard from "@/components/AdkarCard";

const EveningAdkar = () => {
    const [adkars, setAdkars] = useState<Adkar[]>([]);
    const [loading, setLoading] = useState(true);
    const [eveningStreak, setEveningStreak] = useState(false);
    const colorScheme = useColorScheme();
    const db = useSQLiteContext();

    const isDarkMode = colorScheme === "dark";
    const width = Dimensions.get("window").width;

    type Adkar = {
        title: string;
        adkar: string[];
        translation: string[];
        repeat: string;
        read: boolean;
    };

    useEffect(() => {
        const adkarsArray: Adkar[] = Object.keys(EveningAdkarData).map(
            (key) => {
                const adkarData =
                    EveningAdkarData[key as keyof typeof EveningAdkarData];
                return {
                    title: adkarData.title,
                    adkar: adkarData.adkar,
                    translation: adkarData.translation,
                    repeat: adkarData.repeat,
                    read: false,
                };
            }
        );
        async function getEveningStreakBool() {
            const result = await db.getFirstAsync<{ evening: boolean }>(
                "SELECT evening FROM adkarStreaks ORDER BY date DESC LIMIT 1"
            );
            result && setEveningStreak(result.evening);
        }

        getEveningStreakBool();
        setAdkars(adkarsArray);
        setLoading(false);
    }, []);

    useEffect(() => {
        const count = adkars.filter((adkar) => adkar.read).length;
        if (count === adkars.length && !eveningStreak) {
            const currentDate = new Date().toISOString().split('T')[0];
            db.execSync(`UPDATE adkarStreaks SET evening = TRUE WHERE date = '${currentDate}'`);
        }
    }, [adkars]);

    const renderAdkarCard = ({ item }: { item: Adkar }) => {
        return (
            <AdkarCard item={item} index={adkars.indexOf(item)} />
        );
    };

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
            fontSize: 18,
            marginBottom: 8,
            color: isDarkMode ? "#FFFFFF" : "#000000",
        },
        translationText: {
            fontSize: 16,
            marginBottom: 8,
            color: isDarkMode ? "#BDBDBD" : "#757575",
        },
        repeatText: {
            fontSize: 16,
            fontWeight: "bold",
            color: isDarkMode ? "#FF9800" : "#F44336",
        },
    });

    return (
        <SafeAreaProvider>
            <View style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <ThemedView style={styles.titleContainer}>
                        {loading ? (
                            <ActivityIndicator
                                size="large"
                                color={
                                    colorScheme === "dark"
                                        ? Colors.light.tint
                                        : Colors.dark.tint
                                }
                            />
                        ) : (
                            <View
                                style={{
                                    flex: 1,
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <Carousel
                                    width={width}
                                    height={width * 3}
                                    loop
                                    data={adkars}
                                    renderItem={renderAdkarCard}
                                    style={{ alignSelf: "center" }}
                                />
                            </View>
                        )}
                    </ThemedView>
                </ScrollView>
            </View>
        </SafeAreaProvider>
    );
};

export default EveningAdkar;
