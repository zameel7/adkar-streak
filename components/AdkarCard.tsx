import ThemeContext from "@/context/ThemeContext";
import { localDateString } from "@/lib/date";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSQLiteContext } from "expo-sqlite";
import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
// Use the gesture-handler ScrollView so vertical scrolling cooperates with
// the carousel's horizontal pan gesture on Android. RN's stock ScrollView
// loses gesture arbitration to the parent and won't scroll vertically.
import { ScrollView } from "react-native-gesture-handler";
import { ThemedText } from "./ThemedText";

type Adkar = {
    title: string;
    adkar: string[];
    translation: string[];
    repeat: string;
    repeatCount: number;
};

const AdkarCard = ({
    item,
    index,
    type,
    total,
    height,
    setIndex,
    onAdkarCompleted,
    onStreakUpdated,
}: {
    item: Adkar;
    index: number;
    type: string;
    total: number;
    height: number;
    setIndex: (index: number) => void;
    onAdkarCompleted?: () => void;
    onStreakUpdated?: () => void;
}) => {
    const { theme } = useContext(ThemeContext);
    const db = useSQLiteContext();

    const [read, setRead] = useState(false);
    // Default to true so a fresh install (no AsyncStorage value yet) shows
    // translations, matching the Settings screen's default-on toggle.
    const [translation, setTranslation] = useState(true);

    const checkRead = async () => {
        try {
            const streakData = await AsyncStorage.getItem("streakData");
            if (streakData) {
                const data = JSON.parse(streakData);
                if (data.morning[index] && type === "morning") {
                    setRead(true);
                } else if (data.evening[index] && type === "evening") {
                    setRead(true);
                } else {
                    setRead(false);
                }
            } else {
                setRead(false);
            }
        } catch (error) {
            console.error('Error checking read status', error);
        }
    };

    useEffect(() => {
        const showTranslation = async () => {
            try {
                const translationData = await AsyncStorage.getItem("translations");
                if (translationData !== null) {
                    setTranslation(JSON.parse(translationData));
                }
                // else: keep default (true)
            } catch (error) {
                console.error('Error checking translation setting', error);
            }
        };

        showTranslation();
        checkRead();
    }, []);

    // Add effect to re-check read status when index changes
    useEffect(() => {
        checkRead();
    }, [index, type]);

    const checkAndMarkStreak = async () => {
        if (!db) {
            console.error("Database not available");
            return;
        }
        
        try {
            const streakData = await AsyncStorage.getItem("streakData");
            if (streakData) {
                const data = JSON.parse(streakData);

                let streakUpdated = false;
                const today = localDateString();
                const done = Object.values(data[type] ?? {}).filter(Boolean).length;
                const completeFlag = done >= total ? 1 : 0;
                const column = type === "morning" ? "morning" : "evening";

                await db.runAsync(
                    `UPDATE adkarStreaks SET ${column} = ? WHERE date = ?`,
                    [completeFlag, today]
                );
                if (completeFlag === 1) {
                    streakUpdated = true;
                }

                if (streakUpdated && onStreakUpdated) {
                    onStreakUpdated();
                }
            }
        } catch (error) {
            console.error('Error marking streak in database:', error);
        }
    };

    const handleMarkRead = async () => {
        try {
            const streakData = await AsyncStorage.getItem("streakData");
            if (streakData) {
                const data = JSON.parse(streakData);

                if (type === "evening") {
                    data.evening = {
                        ...data.evening,
                        [index]: !read,
                    };
                } else if (type === "morning") {
                    data.morning = {
                        ...data.morning,
                        [index]: !read,
                    };
                }

                await AsyncStorage.setItem("streakData", JSON.stringify(data));
                setRead(!read);

                // Call callback when marked as read
                if (!read && onAdkarCompleted) {
                    onAdkarCompleted();
                }
            }
            await checkAndMarkStreak();
        } catch (error) {
            console.error('Error in handleMarkRead', error);
        }
    };

    const isDark = theme === 'dark';
    const text = isDark ? '#ffffff' : '#111111';
    const muted = isDark ? '#9aa0a6' : '#6b7280';
    const subtle = isDark ? '#1a1a20' : '#f4f4f7';
    const hairline = isDark ? '#26262d' : '#ececef';
    const accent = '#2196F3';

    return (
        <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
                paddingHorizontal: 24,
                paddingTop: 16,
                // Leave room for the floating counter button (72px + 30 bottom + breathing).
                paddingBottom: 140,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
        >
            {/* Header: counter eyebrow + check toggle */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <ThemedText style={{
                    fontSize: 12,
                    fontWeight: '700',
                    letterSpacing: 1.2,
                    textTransform: 'uppercase',
                    color: muted,
                }}>
                    {index + 1} / {total}
                </ThemedText>
                <TouchableOpacity onPress={handleMarkRead} hitSlop={10}>
                    <View style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: read ? accent : 'transparent',
                        borderWidth: read ? 0 : 1.5,
                        borderColor: hairline,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        {read ? (
                            <Ionicons name="checkmark" size={18} color="#ffffff" />
                        ) : null}
                    </View>
                </TouchableOpacity>
            </View>

            <ThemedText style={{
                fontSize: 22,
                fontWeight: '700',
                color: text,
                letterSpacing: -0.3,
                marginBottom: 18,
            }}>
                {item.title}
            </ThemedText>

            {/* Adkar entries */}
            {item.adkar.map((adkar, adkarIndex) => {
                const isLast = adkarIndex === item.adkar.length - 1;
                return (
                    <View
                        key={adkarIndex}
                        style={{
                            paddingBottom: 18,
                            marginBottom: isLast ? 0 : 18,
                            borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
                            borderBottomColor: hairline,
                        }}
                    >
                        {/* Arabic */}
                        <ThemedText style={{
                            fontSize: 24,
                            lineHeight: 40,
                            textAlign: 'center',
                            fontWeight: '500',
                            letterSpacing: 1,
                            color: text,
                            marginBottom: 14,
                        }}>
                            {adkar}
                        </ThemedText>

                        {/* Repeat tag */}
                        <View style={{
                            alignSelf: 'center',
                            backgroundColor: subtle,
                            paddingHorizontal: 12,
                            paddingVertical: 5,
                            borderRadius: 999,
                            marginBottom: translation && item.translation[adkarIndex] ? 14 : 0,
                        }}>
                            <ThemedText style={{
                                textAlign: 'center',
                                fontWeight: '600',
                                fontSize: 11,
                                color: muted,
                                letterSpacing: 0.5,
                                textTransform: 'uppercase',
                            }}>
                                Repeat · {item.repeat}
                            </ThemedText>
                        </View>

                        {/* Translation */}
                        {translation && item.translation[adkarIndex] ? (
                            <ThemedText style={{
                                fontSize: 15,
                                lineHeight: 23,
                                textAlign: 'center',
                                fontStyle: 'italic',
                                color: muted,
                            }}>
                                {item.translation[adkarIndex]}
                            </ThemedText>
                        ) : null}
                    </View>
                );
            })}
        </ScrollView>
    );
};

export default AdkarCard;
