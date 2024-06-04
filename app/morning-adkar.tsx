import { ThemedView } from "@/components/ThemedView";
import MorningAdkarData from "@/assets/adkars/morning.json";
import { Colors } from "@/constants/Colors";
import AdkarCard from "@/components/AdkarCard";

import { useEffect, useState, useRef, useContext } from "react";
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    View,
    TouchableOpacity,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Carousel from "react-native-reanimated-carousel";
import { Ionicons } from "@expo/vector-icons";
import ThemeContext from "@/context/ThemeContext";

const MorningAdkar = () => {
    const [adkars, setAdkars] = useState<Adkar[]>([]);
    const carouselRef = useRef(null);
    const scrollViewRef = useRef(null); // Add a ref for the ScrollView
    const { theme: colorScheme } = useContext(ThemeContext);
    const colors = Colors[colorScheme as keyof typeof Colors];
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

    const handleNext = () => {
        if (carouselRef.current) {
            // @ts-ignore
            carouselRef.current.next();
            // Scroll to the top of the ScrollView
            if (scrollViewRef.current) {
                // @ts-ignore
                scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: true });
            }
        }
    };

    const handlePrev = () => {
        if (carouselRef.current) {
            // @ts-ignore
            carouselRef.current.prev();
            // Scroll to the top of the ScrollView
            if (scrollViewRef.current) {
                // @ts-ignore
                scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: true });
            }
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
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    ref={scrollViewRef} // Add the ref to the ScrollView
                >
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

export default MorningAdkar;
