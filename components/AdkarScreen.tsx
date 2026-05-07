import { Ionicons } from "@expo/vector-icons";
import React, { useContext } from "react";
import {
    StyleSheet,
    TouchableOpacity,
    useWindowDimensions,
    View
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { SafeAreaProvider } from "react-native-safe-area-context";

import AdkarCard from "@/components/AdkarCard";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useSync } from "@/context/SyncContext";
import ThemeContext from "@/context/ThemeContext";
import { Adkar, useAdkarLogic } from "@/hooks/useAdkarLogic";

interface AdkarScreenProps {
    adkarData: any;
    type: 'morning' | 'evening';
    onStreakUpdated?: () => void;
}

const AdkarScreen: React.FC<AdkarScreenProps> = ({ adkarData, type, onStreakUpdated }) => {
    const { width, height: screenHeight } = useWindowDimensions();
    const { theme: colorScheme } = useContext(ThemeContext);

    // Use sync context if available, otherwise use the prop
    const sync = useSync();
    const syncFunction = sync?.triggerSync ?? onStreakUpdated;

    const {
        adkars,
        counter,
        index,
        height,
        refreshTrigger,
        carouselRef,
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
                total={adkars.length}
                height={height}
                setIndex={setIndex}
                onAdkarCompleted={handleAdkarCompleted}
                onStreakUpdated={syncFunction}
                key={`${itemIndex}-${refreshTrigger}`}
            />
        );
    };

    const isDark = colorScheme === 'dark';
    const surface = isDark ? '#0e0e12' : '#ffffff';
    const subtle = isDark ? '#1a1a20' : '#f4f4f7';
    const hairline = isDark ? '#26262d' : '#ececef';
    const muted = isDark ? '#9aa0a6' : '#6b7280';
    // Period accent: light blue for morning, dark violet for evening — matches
    // the Home bento color story.
    const accent = type === 'morning' ? '#0EA5E9' : '#5B21B6';

    const styles = StyleSheet.create({
        arrow: {
            position: 'absolute',
            top: '50%',
            marginTop: -22,
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: subtle,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: hairline,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2,
        },
        leftArrow: { left: 12 },
        rightArrow: { right: 12 },
        repeatCounter: {
            position: 'absolute',
            bottom: 30,
            alignSelf: 'center',
            left: 0,
            right: 0,
            alignItems: 'center',
            justifyContent: 'center',
        },
        progressTrack: {
            height: 3,
            backgroundColor: hairline,
            width: '100%',
        },
        progressFill: {
            height: 3,
            backgroundColor: accent,
        },
    });

    const progress = adkars.length > 0 ? Math.min(1, (index + 1) / adkars.length) : 0;

    return (
        <SafeAreaProvider>
            <ThemedView style={{ flex: 1, backgroundColor: surface }}>
                {/* Slim progress bar at the top */}
                <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                </View>

                <TouchableOpacity
                    style={[styles.arrow, styles.leftArrow]}
                    onPress={handlePrev}
                    activeOpacity={0.7}
                >
                    <Ionicons name="chevron-back" size={20} color={muted} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.arrow, styles.rightArrow]}
                    onPress={handleNext}
                    activeOpacity={0.7}
                >
                    <Ionicons name="chevron-forward" size={20} color={muted} />
                </TouchableOpacity>

                {/* Carousel sits at full screen height. Each AdkarCard owns its
                    own vertical ScrollView, so long content scrolls within the
                    card while the carousel itself only handles horizontal swipes. */}
                <View style={{ flex: 1 }}>
                    <Carousel
                        ref={carouselRef}
                        width={width}
                        height={screenHeight - 3}
                        loop={false}
                        data={adkars}
                        renderItem={renderAdkarCard}
                        scrollAnimationDuration={300}
                        onSnapToItem={handleSnapToItem}
                    />
                </View>

                {/* Floating counter button */}
                <View style={styles.repeatCounter}>
                    <TouchableOpacity
                        onPress={handleCounterPress}
                        activeOpacity={0.85}
                        style={{
                            backgroundColor: accent,
                            borderRadius: 36,
                            width: 72,
                            height: 72,
                            alignItems: 'center',
                            justifyContent: 'center',
                            shadowColor: accent,
                            shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: 0.3,
                            shadowRadius: 16,
                            elevation: 8,
                        }}
                    >
                        <ThemedText style={{
                            color: '#ffffff',
                            fontSize: 26,
                            fontWeight: '700',
                            textAlign: 'center',
                            letterSpacing: -0.5,
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