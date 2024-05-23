import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Carousel from "react-native-reanimated-carousel";
import { Card } from "@rneui/themed";
import EveningAdkarData from "@/assets/adkars/evening.json";
import { Colors } from "@/constants/Colors";

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
        console.log(adkars);
    }, [EveningAdkarData]);

    const renderAdkarCard = ({ item }: { item: Adkar }) => {
        return (
            <ThemedView>
                <Card>
                    <Card.Title>{adkars.indexOf(item)+1}) {item.title}</Card.Title>
                    <Card.Divider />
                    <ThemedText style={styles.adkarText}>{item.adkar}</ThemedText>
                    <ThemedText style={styles.adkarText}>{item.translation}</ThemedText>
                    <ThemedText style={styles.adkarText}>{item.repeat}</ThemedText>
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
        adkarText: {
            fontSize: 18,
            marginBottom: 8,
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
                            width={300}
                            height={400}
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
