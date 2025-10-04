import ThemeContext from "@/context/ThemeContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSQLiteContext } from "expo-sqlite";
import React, { useContext, useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
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
    height,
    setIndex,
    onAdkarCompleted,
}: {
    item: Adkar;
    index: number;
    type: string;
    height: number;
    setIndex: (index: number) => void;
    onAdkarCompleted?: () => void;
}) => {
    const { theme } = useContext(ThemeContext);
    const db = useSQLiteContext();

    const [read, setRead] = useState(false);
    const [translation, setTranslation] = useState(false);

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
                if (translationData) {
                    const showTranslations = JSON.parse(translationData);
                    setTranslation(showTranslations);
                }
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
        const streakData = await AsyncStorage.getItem("streakData");
        if (streakData) {
            const data = JSON.parse(streakData);

            if (Object.keys(data.morning).length === 24) {
                await db.execAsync(`
                    UPDATE adkarStreaks SET morning = true WHERE date = CURRENT_DATE
                `);
            }
            if (Object.keys(data.evening).length === 24) {
                await db.execAsync(`
                    UPDATE adkarStreaks SET evening = true WHERE date = CURRENT_DATE
                `);
            }
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

    return (
        <View style={{
            margin: 16,
            backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.95)',
            borderRadius: 20,
            padding: 24,
            borderWidth: 1,
            borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#e0e0e0'
        }}>
            {/* Header */}
            <View style={{
                backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(33, 150, 243, 0.1)',
                borderRadius: 16,
                padding: 20,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(33, 150, 243, 0.3)'
            }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <ThemedText style={{
                        fontSize: 20,
                        fontWeight: 'bold',
                        flex: 1,
                        paddingRight: 16,
                        color: theme === 'dark' ? '#ffffff' : '#333'
                    }}>
                        {item.title}
                    </ThemedText>

                    {/* Progress Counter and Check Icon in same row */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <View style={{
                            backgroundColor: '#2196F3',
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 20
                        }}>
                            <ThemedText style={{
                                color: '#ffffff',
                                fontSize: 12,
                                fontWeight: '600'
                            }}>
                                {index + 1} / 24
                            </ThemedText>
                        </View>

                        {/* Mini Check Button */}
                        <TouchableOpacity onPress={handleMarkRead}>
                            <View style={{
                                width: 28,
                                height: 28,
                                borderRadius: 14,
                                backgroundColor: read ? '#2196F3' : 'transparent',
                                borderWidth: 1.5,
                                borderColor: read ? '#2196F3' : (theme === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(33, 150, 243, 0.6)'),
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {read && (
                                    <Ionicons
                                        name="checkmark"
                                        size={16}
                                        color="#ffffff"
                                    />
                                )}
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Content Area */}
            <View style={{ maxHeight: height }}>
                {item.adkar.map((adkar, adkarIndex) => (
                    <View
                        key={adkarIndex}
                        style={{
                            backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
                            borderRadius: 16,
                            padding: 20,
                            marginBottom: 16,
                            borderWidth: 1,
                            borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#f0f0f0'
                        }}
                    >
                        {/* Arabic Text */}
                        <ThemedText style={{
                            fontSize: 22,
                            lineHeight: 35,
                            textAlign: 'center',
                            marginBottom: 16,
                            fontWeight: '500',
                            letterSpacing: 1,
                            color: theme === 'dark' ? '#ffffff' : '#333'
                        }}>
                            {adkar}
                        </ThemedText>

                        {/* Repeat Instructions */}
                        <View style={{
                            backgroundColor: 'rgba(33, 150, 243, 0.1)',
                            borderRadius: 8,
                            padding: 8,
                            marginBottom: 12,
                            borderWidth: 1,
                            borderColor: 'rgba(33, 150, 243, 0.3)'
                        }}>
                            <ThemedText style={{
                                textAlign: 'center',
                                fontWeight: '600',
                                fontSize: 12,
                                color: '#2196F3'
                            }}>
                                Repeat: {item.repeat}
                            </ThemedText>
                        </View>

                        {/* Translation */}
                        {translation && item.translation[adkarIndex] && (
                            <View style={{
                                backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                                borderRadius: 12,
                                padding: 16,
                                borderWidth: 1,
                                borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                            }}>
                                <ThemedText style={{
                                    fontSize: 16,
                                    lineHeight: 24,
                                    textAlign: 'center',
                                    fontStyle: 'italic',
                                    color: theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : '#666'
                                }}>
                                    {item.translation[adkarIndex]}
                                </ThemedText>
                            </View>
                        )}
                    </View>
                ))}
            </View>
        </View>
    );
};

export default AdkarCard;
