import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import EveningAdkarData from "@/assets/adkars/evening.json";
import { Colors } from "@/constants/Colors";

import Ionicons from "@expo/vector-icons/Ionicons";
import { Card } from "@rneui/themed";

import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Carousel from "react-native-reanimated-carousel";

const EveningAdkar = () => {
    const [adkars, setAdkars] = useState<Adkar[]>([]);
    const [loading, setLoading] = useState(true);
    const colorScheme = useColorScheme();

    const isDarkMode = colorScheme === "dark";

    type Adkar = {
        title: string;
        adkar: string[];
        translation: string[];
        repeat: string;
    };

    useEffect(() => {
        const adkarsArray: Adkar[] = Object.keys(EveningAdkarData).map((key) => {
            const adkarData = EveningAdkarData[key as keyof typeof EveningAdkarData];
            return {
                title: adkarData.title,
                adkar: adkarData.adkar,
                translation: adkarData.translation,
                repeat: adkarData.repeat,
            };
        });

        setAdkars(adkarsArray);
        setLoading(false);
    }, []);

    const renderAdkarCard = ({ item }: { item: Adkar }) => {
        return (
            <ThemedView style={styles.cardContainer}>
                <Card containerStyle={styles.card}>
                    <Card.Title style={styles.cardTitle}>{adkars.indexOf(item) + 1}) {item.title}</Card.Title>
                    <Card.Divider />
                    <ScrollView style={styles.scrollViewContent}>
                        <ThemedText style={styles.adkarText}>{item.adkar}</ThemedText>
                        <ThemedText style={styles.translationText}>{item.translation}</ThemedText>
                        <ThemedText style={styles.repeatText}>Repeat: {item.repeat}</ThemedText>
                    </ScrollView>
                </Card>
            </ThemedView>
        );
    };

    const styles = StyleSheet.create({
        dayNightIcon: {
            color: "#808080",
            bottom: 0,
            left: 10,
            position: "absolute",
        },
        titleContainer: {
            padding: 16,
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
            height: 400, // Adjust the height as needed
        },
        cardTitle: {
            fontSize: 20,
            fontWeight: "bold",
            color: isDarkMode ? "#FF9800" : "#F44336",
            textAlign: "center",
            marginBottom: 10,
        },
        scrollViewContent: {
            minHeight: 300, // Adjust the height as needed
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
            <ParallaxScrollView
                headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
                headerImage={
                    <Ionicons
                        size={200}
                        name="moon"
                        style={styles.dayNightIcon}
                    />
                }
            >
                <ThemedView style={styles.titleContainer}>
                    <ThemedText type="title">Evening Adkar</ThemedText>
                    {loading ? (
                        <ActivityIndicator size="large" color={colorScheme === 'dark' ? Colors.light.tint : Colors.dark.tint} />
                    ) : (
                        <Carousel
                            width={320}
                            height={450}
                            loop
                            data={adkars}
                            renderItem={renderAdkarCard}
                        />
                    )}
                </ThemedView>
            </ParallaxScrollView>
        </SafeAreaProvider>
    );
};

export default EveningAdkar;
