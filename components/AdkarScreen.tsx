import { Ionicons } from "@expo/vector-icons";
import React, { useContext } from "react";
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from "react-native";
import ProgressBar from "react-native-progress/Bar";
import Carousel from "react-native-reanimated-carousel";
import { SafeAreaProvider } from "react-native-safe-area-context";

import AdkarCard from "@/components/AdkarCard";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useSync } from "@/context/SyncContext";
import ThemeContext from "@/context/ThemeContext";
import { Adkar, useAdkarLogic } from "@/hooks/useAdkarLogic";

interface AdkarScreenProps {
    adkarData: any;
    type: 'morning' | 'evening';
    onStreakUpdated?: () => void;
}

const AdkarScreen: React.FC<AdkarScreenProps> = ({ adkarData, type, onStreakUpdated }) => {
    const width = Dimensions.get("window").width;
    const { theme: colorScheme } = useContext(ThemeContext);
    const colors = Colors[colorScheme as keyof typeof Colors];
    
    // Use sync context if available, otherwise use the prop
    let syncFunction = onStreakUpdated;
    try {
        const { triggerSync } = useSync();
        syncFunction = triggerSync;
    } catch {
        // Sync context not available, use prop
    }

    const {
        adkars,
        counter,
        index,
        height,
        refreshTrigger,
        carouselRef,
        scrollViewRef,
        handleNext,
        handlePrev,
        handleAdkarCompleted,
        handleCounterPress,
        handleSnapToItem,
        setIndex,
    } = useAdkarLogic(adkarData, type);

    const renderAdkarCard = ({ item }: { item: Adkar }) => {
        const itemIndex = adkars.indexOf(item);
        return (
            <AdkarCard
                item={item}
                index={itemIndex}
                type={type}
                height={height}
                setIndex={setIndex}
                onAdkarCompleted={handleAdkarCompleted}
                onStreakUpdated={syncFunction}
                key={`${itemIndex}-${refreshTrigger}`}
            />
        );
    };

    const buttonColor = type === 'morning' ? '#2196F3' : '#1976D2';

    const styles = StyleSheet.create({
        titleContainer: {
            padding: 16,
            flex: 1,
        },
        arrow: {
            position: "absolute",
            top: "50%",
            width: 48,
            height: 48,
            backgroundColor: buttonColor,
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2,
            borderRadius: 24,
            shadowColor: buttonColor,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 4,
        },
        leftArrow: {
            left: 16,
        },
        rightArrow: {
            right: 16,
        },
        repeatCounter: {
            position: "absolute",
            bottom: 30,
            alignSelf: "center",
            left: 0,
            right: 0,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: 'transparent',
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
                    <Ionicons name="chevron-back" size={24} color="#ffffff" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.arrow, styles.rightArrow]}
                    onPress={handleNext}
                >
                    <Ionicons name="chevron-forward" size={24} color="#ffffff" />
                </TouchableOpacity>
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    ref={scrollViewRef}
                    keyboardShouldPersistTaps="handled"
                    scrollEnabled={true}
                    showsVerticalScrollIndicator={false}
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
                                height={height || width * 3}
                                loop={false}
                                data={adkars}
                                renderItem={renderAdkarCard}
                                scrollAnimationDuration={300}
                                onSnapToItem={handleSnapToItem}
                                style={{ alignSelf: "center" }}
                            />
                        </ThemedView>
                    </ThemedView>
                </ScrollView>
                <View style={styles.repeatCounter}>
                    <TouchableOpacity
                        onPress={handleCounterPress}
                        style={{
                            backgroundColor: buttonColor,
                            borderRadius: 25,
                            width: 80,
                            height: 80,
                            alignItems: 'center',
                            justifyContent: 'center',
                            shadowColor: buttonColor,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 8,
                            elevation: 4
                        }}
                    >
                        <ThemedText style={{
                            color: '#ffffff',
                            fontSize: 24,
                            fontWeight: 'bold',
                            textAlign: 'center'
                        }}>
                            {counter?.toString()}
                        </ThemedText>
                    </TouchableOpacity>
                </View>
            </ThemedView>
        </SafeAreaProvider>
    );
};

export default AdkarScreen;