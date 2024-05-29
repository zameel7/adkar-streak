import { ThemedView } from "@/components/ThemedView";
import EveningAdkarData from "@/assets/adkars/evening.json";
import { Colors } from "@/constants/Colors";
import AdkarCard from "@/components/AdkarCard";

import { useEffect, useState, useRef } from "react";
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    useColorScheme,
    View,
    TouchableOpacity,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Carousel from "react-native-reanimated-carousel";
import { Ionicons } from "@expo/vector-icons";

const EveningAdkar = () => {
    const [adkars, setAdkars] = useState<Adkar[]>([]);
    const carouselRef = useRef(null);
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? "light"];
    const width = Dimensions.get("window").width;

    type Adkar = {
        title: string;
        adkar: string[];
        translation: string[];
        repeat: string;
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
                };
            }
        );

        setAdkars(adkarsArray);
    }, []);

    const renderAdkarCard = ({ item }: { item: Adkar }) => {
        return (
            <AdkarCard
                item={item}
                index={adkars.indexOf(item)}
                type="evening"
            />
        );
    };

    const handleNext = () => {
        if (carouselRef.current) {
            // @ts-ignore
            carouselRef.current.next();
        }
    };

    const handlePrev = () => {
        if (carouselRef.current) {
            // @ts-ignore
            carouselRef.current.prev();
        }
    };

    const styles = StyleSheet.create({
        titleContainer: {
            padding: 16,
            flex: 1,
        },
        arrow: {
            position: "absolute",
            top: "50%",
            width: 40,
            height: 40,
            backgroundColor: colors.tabIconSelected,
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1,
            opacity: 0.4,
        },
        leftArrow: {
            left: 2,
        },
        rightArrow: {
            right: 2,
        },
        arrowText: {
            fontSize: 24,
            color: colors.background,
        },
    });

    return (
        <SafeAreaProvider>
            <View style={{ flex: 1 }}>
                <TouchableOpacity
                    style={[styles.arrow, styles.leftArrow]}
                    onPress={handlePrev}
                >
                    <Ionicons name="chevron-back" style={styles.arrowText} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.arrow, styles.rightArrow]}
                    onPress={handleNext}
                >
                    <Ionicons name="chevron-forward" style={styles.arrowText} />
                </TouchableOpacity>
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <ThemedView style={styles.titleContainer}>
                        <View
                            style={{
                                flex: 1,
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <Carousel
                                ref={carouselRef}
                                width={width}
                                height={width * 4}
                                loop
                                data={adkars}
                                renderItem={renderAdkarCard}
                                scrollAnimationDuration={100}
                                style={{ alignSelf: "center" }}
                                panGestureHandlerProps={{
                                    activeOffsetX: [-10, 10],
                                  }}
                            />
                        </View>
                    </ThemedView>
                </ScrollView>
            </View>
        </SafeAreaProvider>
    );
};

export default EveningAdkar;
