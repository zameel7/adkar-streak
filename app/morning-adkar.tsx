import { ThemedView } from "@/components/ThemedView";
import MorningAdkarData from "@/assets/adkars/morning.json";
import { Colors } from "@/constants/Colors";

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
import AdkarCard from "@/components/AdkarCard";

const MorningAdkar = () => {
    const [adkars, setAdkars] = useState<Adkar[]>([]);
    const [loading, setLoading] = useState(true);
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? "light"];

    const isDarkMode = colorScheme === "dark";
    const width = Dimensions.get("window").width;

    type Adkar = {
        title: string;
        adkar: string[];
        translation: string[];
        repeat: string;
    };

    useEffect(() => {
        const adkarsArray: Adkar[] = Object.keys(MorningAdkarData).map(
            (key) => {
                const adkarData =
                    MorningAdkarData[key as keyof typeof MorningAdkarData];
                return {
                    title: adkarData.title,
                    adkar: adkarData.adkar,
                    translation: adkarData.translation,
                    repeat: adkarData.repeat,
                };
            }
        );

        setAdkars(adkarsArray);
        setLoading(false);
    }, []);

    const renderAdkarCard = ({ item }: { item: Adkar }) => {
        return (
            <AdkarCard
                item={item}
                index={adkars.indexOf(item)}
                type="morning"
            />
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
            color: colors.tint,
            textAlign: "center",
            marginBottom: 10,
        },
        adkarText: {
            fontSize: 18,
            marginBottom: 8,
            color: colors.text,
        },
        translationText: {
            fontSize: 16,
            marginBottom: 8,
            color: colors.tint,
        },
        repeatText: {
            fontSize: 16,
            fontWeight: "bold",
            color: colors.tint,
        },
    });

    return (
        <SafeAreaProvider>
            <View style={{ flex: 2 }}>
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

export default MorningAdkar;
