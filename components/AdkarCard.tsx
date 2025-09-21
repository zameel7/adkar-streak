import React, { useContext, useEffect, useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { GlassCard, GlassView, GlassButton, GlassText } from "./glass";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSQLiteContext } from "expo-sqlite";
import { LinearGradient } from "expo-linear-gradient";
import ThemeContext from "@/context/ThemeContext";

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
}: {
    item: Adkar;
    index: number;
    type: string;
    height: number;
    setIndex: (index: number) => void;
}) => {
    const { theme } = useContext(ThemeContext);
    const db = useSQLiteContext();

    const [read, setRead] = useState(false);
    const [translation, setTranslation] = useState(false);

    useEffect(() => {
        const checkRead = async () => {
            const streakData = await AsyncStorage.getItem("streakData");
            if (streakData) {
                const data = JSON.parse(streakData);
                if (data.morning[index] && type === "morning") {
                    setRead(true);
                } else if (data.evening[index] && type === "evening") {
                    setRead(true);
                }
            }
        };

        const showTranslation = async () => {
            const translationData = await AsyncStorage.getItem("translations");
            if (translationData) {
                setTranslation(JSON.parse(translationData));
            }
        };

        showTranslation();
        checkRead();
    }, []);

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
        }
        await checkAndMarkStreak();
    };

    return (
        <LinearGradient
            colors={theme === 'dark' ? ['#1a1a2e', '#16213e'] : ['#667eea', '#764ba2']}
            style={{
                margin: 16,
                borderRadius: 20,
                overflow: 'hidden'
            }}
        >
            <GlassCard
                intensity={20}
                glassStyle="medium"
                padding="large"
                className="m-0"
            >
                {/* Header with glass effect */}
                <GlassView
                    intensity={10}
                    glassStyle="light"
                    className="mb-4 p-4 rounded-xl"
                >
                    <View className="flex-row justify-between items-center mb-3">
                        <GlassText
                            variant="subtitle"
                            color="white"
                            className="flex-1 pr-4 font-bold text-xl"
                        >
                            {item.title}
                        </GlassText>

                        {/* Progress Counter */}
                        <GlassView
                            intensity={15}
                            glassStyle="strong"
                            className="px-3 py-2 rounded-full"
                        >
                            <GlassText
                                variant="caption"
                                color="primary"
                                className="font-semibold"
                            >
                                {index + 1} / 24
                            </GlassText>
                        </GlassView>
                    </View>

                    {/* Check Button */}
                    <TouchableOpacity onPress={handleMarkRead}>
                        <GlassView
                            intensity={read ? 25 : 10}
                            glassStyle={read ? "strong" : "light"}
                            className={`flex-row items-center justify-center p-3 rounded-xl ${
                                read ? 'bg-primary/30' : 'bg-white/10'
                            }`}
                        >
                            <Ionicons
                                name={read ? "checkmark-circle" : "checkmark-circle-outline"}
                                size={24}
                                color={read ? "#61B553" : "#ffffff"}
                                style={{ marginRight: 8 }}
                            />
                            <GlassText
                                color={read ? "primary" : "white"}
                                className="font-semibold"
                            >
                                {read ? "Completed" : "Mark as Read"}
                            </GlassText>
                        </GlassView>
                    </TouchableOpacity>
                </GlassView>

                {/* Content Area */}
                <View style={{ maxHeight: height }} className="space-y-4">
                    {item.adkar.map((adkar, adkarIndex) => (
                        <GlassView
                            key={adkarIndex}
                            intensity={15}
                            glassStyle="light"
                            className="p-4 rounded-xl"
                        >
                            {/* Arabic Text */}
                            <GlassText
                                color="white"
                                className="text-2xl leading-9 text-center mb-4 font-bold"
                                style={{
                                    letterSpacing: 2,
                                    lineHeight: 35
                                }}
                            >
                                {adkar}
                            </GlassText>

                            {/* Repeat Instructions */}
                            <GlassView
                                intensity={10}
                                glassStyle="light"
                                className="p-2 rounded-lg mb-3"
                            >
                                <GlassText
                                    variant="caption"
                                    color="primary"
                                    className="text-center font-semibold"
                                >
                                    Repeat: {item.repeat}
                                </GlassText>
                            </GlassView>

                            {/* Translation */}
                            {translation && item.translation[adkarIndex] && (
                                <GlassView
                                    intensity={5}
                                    glassStyle="light"
                                    className="p-3 rounded-lg"
                                >
                                    <GlassText
                                        color="muted"
                                        className="text-lg leading-6 text-center italic"
                                    >
                                        {item.translation[adkarIndex]}
                                    </GlassText>
                                </GlassView>
                            )}
                        </GlassView>
                    ))}
                </View>
            </GlassCard>
        </LinearGradient>
    );
};

export default AdkarCard;
