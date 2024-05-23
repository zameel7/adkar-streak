import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import MorningAdkarData from "@/assets/adkars/morning.json";
import { Colors } from "@/constants/Colors";

import { Card } from "@rneui/themed";

import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    StyleSheet,
    useColorScheme,
    View
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Carousel from "react-native-reanimated-carousel";

const MorningAdkar = () => {
    const [adkars, setAdkars] = useState<Adkar[]>([]);
    const [loading, setLoading] = useState(true);
    const colorScheme = useColorScheme();

    const isDarkMode = colorScheme === "dark";
    const width = Dimensions.get("window").width;

    type Adkar = {
        title: string;
        adkar: string[];
        translation: string[];
        repeat: string;
    };

    useEffect(() => {
        const adkarsArray: Adkar[] = Object.keys(MorningAdkarData).map((key) => {
            const adkarData = MorningAdkarData[key as keyof typeof MorningAdkarData];
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
                    <Card.Title style={styles.cardTitle}>
                        {adkars.indexOf(item) + 1}) {item.title}
                    </Card.Title>
                    <Card.Divider />
                    <ThemedText style={styles.adkarText}>
                        {item.adkar}
                    </ThemedText>
                    <ThemedText style={styles.translationText}>
                        {item.translation}
                    </ThemedText>
                    <ThemedText style={styles.repeatText}>
                        Repeat: {item.repeat}
                    </ThemedText>
                </Card>
            </ThemedView>
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
                <ThemedView style={styles.titleContainer}>
                    <ThemedText type="title">Morning Adkar</ThemedText>
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
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Carousel
                                width={width}
                                height={width * 2}
                                loop
                                data={adkars}
                                renderItem={renderAdkarCard}
                                style={{ alignSelf: 'center' }}
                            />
                        </View>
                    )}
                </ThemedView>
            </View>
        </SafeAreaProvider>
    );
};

export default MorningAdkar;
