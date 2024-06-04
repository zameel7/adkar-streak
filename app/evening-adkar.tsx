import { ThemedView } from "@/components/ThemedView";
import EveningAdkarData from "@/assets/adkars/evening.json";
import { Colors } from "@/constants/Colors";
import AdkarCard from "@/components/AdkarCard";

import { useEffect, useState, useRef, useContext } from "react";
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Carousel from "react-native-reanimated-carousel";
import { Ionicons } from "@expo/vector-icons";
import ThemeContext from "@/context/ThemeContext";
import { Button } from "react-native-elements";
import ProgressBar from "react-native-progress/Bar";

const EveningAdkar = () => {
    const [adkars, setAdkars] = useState<Adkar[]>([]);
    const [counter, setCounter] = useState(1);
    const [index, setIndex] = useState<number>(0);
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
        repeatCount: number;
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
                    repeatCount: adkarData.repeatCount,
                };
            }
        );

        setAdkars(adkarsArray);
    }, []);

    useEffect(() => {
        if (adkars && index && adkars[index]) {
            setCounter(adkars[index].repeatCount);
        }
    }, [index, adkars]);

    const renderAdkarCard = ({ item }: { item: Adkar }) => {
        return (
            <AdkarCard
                item={item}
                index={adkars.indexOf(item)}
                type="evening"
                setIndex={setIndex}
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
        repeatCounter: {
            position: "static",
            bottom: 20, // Adjust as needed
            alignSelf: "center",
            borderRadius: 25,
            backgroundColor: colors.primary,
            width: 50,
            height: 50,
            alignItems: "center",
            justifyContent: "center",
        },
        repeatCounterText: {
            color: "#FFFFFF",
            fontSize: 16,
            fontWeight: "bold",
            marginHorizontal: "auto",
        },
    });

    return (
        <SafeAreaProvider>
            <ThemedView style={{ flex: 1 }}>
                <ProgressBar
                    progress={index / adkars.length || 0}
                    width={Dimensions.get("window").width}
                    color={colors.primary}
                    borderColor={colors.border}
                    height={3}
                />
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
                        <ThemedView
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
                                onSnapToItem={(index) => {
                                    setIndex(index);
                                }}
                                style={{ alignSelf: "center" }}
                                panGestureHandlerProps={{
                                    activeOffsetX: [-10, 10],
                                }}
                            />
                        </ThemedView>
                    </ThemedView>
                </ScrollView>
                <ThemedView style={styles.repeatCounter}>
                    <Button
                        title={counter?.toString()}
                        onPress={() => {
                            if (counter === 1) {
                                handleNext();
                            } else {
                                setCounter(counter - 1);
                            }
                        }}
                        buttonStyle={{
                            backgroundColor: "transparent",
                            width: "100%",
                            height: "100%",
                            borderRadius: 25,
                        }}
                        titleStyle={styles.repeatCounterText}
                    />
                </ThemedView>
            </ThemedView>
        </SafeAreaProvider>
    );
};

export default EveningAdkar;
