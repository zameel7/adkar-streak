import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, View, ScrollView, RefreshControl, TouchableOpacity, ImageBackground } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useContext, useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

import { HelloWave } from "@/components/HelloWave";
import { useSQLiteContext } from "expo-sqlite";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import ThemeContext from "@/context/ThemeContext";

function adkarTime() {
    const hours = new Date().getHours();
    return hours >= 5 && hours < 7
        ? "morning"
        : hours >= 16 && hours < 19
        ? "evening"
        : "night";
}

type Row = {
    id: number;
    morning: boolean;
    evening: boolean;
    date: string;
};

const Home = () => {
    const [name, setName] = useState("Hero" as string);
    const [morningStreak, setMorningStreak] = useState(false);
    const [eveningStreak, setEveningStreak] = useState(false);
    const [streak, setStreak] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    const db = useSQLiteContext();
    const { theme } = useContext(ThemeContext);
    const insets = useSafeAreaInsets();

    const time = adkarTime();
    const timeInfo = getTimeOfDayInfo();

    const [weekData, setWeekData] = useState<Array<{
        date: string,
        dayName: string,
        morning: boolean,
        evening: boolean,
        isToday: boolean
    }>>([]);

    async function insertMissingDays() {
        const result = await db.getAllAsync(
            "SELECT * FROM adkarStreaks WHERE date = CURRENT_DATE"
        );

        if (result.length === 0) {
            await db.execAsync(`
                INSERT INTO adkarStreaks (date) VALUES (date('now'))
            `);
            return;
        }

        const lastRow = result[0] as Row;
        if (!lastRow || !lastRow.date) {
            console.error("Invalid data format in adkarStreaks table.");
            return;
        }

        const lastDate = new Date(lastRow.date);
        const today = new Date();

        const statement = await db.prepareAsync(
            "INSERT INTO adkarStreaks (date) VALUES ($value)"
        );

        let startDate, endDate;
        if (lastDate < today) {
            startDate = lastDate;
            endDate = today;
        } else {
            startDate = today;
            endDate = lastDate;
        }

        const diff = Math.abs(endDate.getDate() - startDate.getDate());
        for (let i = 1; i < diff; i++) {
            const dateToInsert = new Date(startDate);
            dateToInsert.setDate(startDate.getDate() - i);

            await statement.executeAsync({
                $value: dateToInsert.toISOString().slice(0, 10),
            });
            console.log(
                `Inserted missing day: ${dateToInsert
                    .toISOString()
                    .slice(0, 10)}`
            );
        }
    }

    async function getStreak() {
        await insertMissingDays();

        const result = await db.getFirstAsync<{
            morning: boolean;
            evening: boolean;
        }>(
            "SELECT morning, evening FROM adkarStreaks WHERE date = CURRENT_DATE"
        );

        if (result) {
            setMorningStreak(result.morning);
            setEveningStreak(result.evening);
        }
    }

    async function calculateStreak() {
        const records = await db.getAllAsync(
            "SELECT id, date, morning, evening FROM adkarStreaks ORDER BY date ASC"
        );
        const today = new Date().toISOString().slice(0, 10);

        let currentStreak = 0;

        for (let i = 0; i < records.length; i++) {
            const { date, morning, evening } = records[i] as Row;

            if (morning && evening) {
                currentStreak++;
            } else {
                if (date !== today) {
                    currentStreak = 0; // Reset streak if activities are not completed for the day
                }
            }
        }

        setStreak(currentStreak);
    }

    async function getLast7DaysData() {
        const today = new Date();
        const last7Days = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateString = date.toISOString().slice(0, 10);

            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const dayName = dayNames[date.getDay()];

            // Get data from database
            const result = await db.getFirstAsync<{
                morning: boolean;
                evening: boolean;
            }>(
                "SELECT morning, evening FROM adkarStreaks WHERE date = ?",
                [dateString]
            );

            last7Days.push({
                date: dateString,
                dayName,
                morning: result?.morning || false,
                evening: result?.evening || false,
                isToday: i === 0
            });
        }

        setWeekData(last7Days);
    }

    useEffect(() => {
        AsyncStorage.getItem("name").then((name) => {
            if (name) {
                setName(name);
            }
        });

        getStreak();
        calculateStreak();
        getLast7DaysData();
    }, []);

    // Refresh data when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            getStreak();
            calculateStreak();
            getLast7DaysData();
        }, [])
    );

    function getDayNightIcon() {
        const hours = new Date().getHours();
        return hours >= 6 && hours < 16
            ? hours >= 8
                ? "sunny"
                : "partly-sunny"
            : "moon";
    }

    function getTimeOfDayInfo() {
        const hours = new Date().getHours();
        const minutes = new Date().getMinutes();
        const currentTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

        if (hours >= 5 && hours < 12) {
            return {
                period: "Morning",
                timeLeft: "Ends 12:00",
                imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop",
                icon: "sunny"
            };
        } else if (hours >= 12 && hours < 18) {
            return {
                period: "Afternoon",
                timeLeft: "Ends 18:00",
                imageUrl: "https://images.unsplash.com/photo-1504567961542-e45effe4e2a5?w=800&h=400&fit=crop",
                icon: "sunny"
            };
        } else if (hours >= 18 && hours < 22) {
            return {
                period: "Evening",
                timeLeft: "Ends 22:00",
                imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop&sat=-20&hue=240",
                icon: "moon"
            };
        } else {
            return {
                period: "Night",
                timeLeft: "Ends 05:00",
                imageUrl: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&h=400&fit=crop",
                icon: "moon"
            };
        }
    }

    const onRefresh = async () => {
        setRefreshing(true);

        // Manually reload data
        await getStreak();
        await calculateStreak();
        await getLast7DaysData();

        setTimeout(() => setRefreshing(false), 1000);
    };

    return (
        <SafeAreaProvider>
            <LinearGradient
                colors={theme === 'dark' ? ['#1a1a2e', '#16213e'] : ['#ffffff', '#f8f9fa']}
                style={{ flex: 1 }}
            >
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{
                        padding: 16,
                        paddingTop: insets.top + 20,
                        paddingBottom: 100 + insets.bottom
                    }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#ffffff"
                        />
                    }
                >
                    {/* Beautiful Time of Day Header */}
                    <ImageBackground
                        source={{ uri: timeInfo.imageUrl }}
                        style={{
                            borderRadius: 20,
                            marginBottom: 32,
                            minHeight: 180,
                            overflow: 'hidden'
                        }}
                        imageStyle={{ borderRadius: 20 }}
                        defaultSource={require('@/assets/images/icon.png')}
                    >
                        <LinearGradient
                            colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.4)']}
                            style={{
                                flex: 1,
                                padding: 24,
                                justifyContent: 'space-between'
                            }}
                        >
                            {/* Top Section */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <View>
                                    <ThemedText style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 16, marginBottom: 4 }}>
                                        Now
                                    </ThemedText>
                                    <ThemedText style={{ color: '#ffffff', fontSize: 32, fontWeight: 'bold', marginBottom: 8 }}>
                                        {timeInfo.period}
                                    </ThemedText>
                                    <ThemedText style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 14 }}>
                                        {timeInfo.timeLeft}
                                    </ThemedText>
                                </View>
                                <Ionicons
                                    name={timeInfo.icon}
                                    size={48}
                                    color="rgba(255, 255, 255, 0.9)"
                                />
                            </View>

                            {/* Bottom Section */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
                                <View style={{ flex: 1 }}>
                                    <ThemedText style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 18, fontWeight: '600' }}>
                                        Hey there {name}! <HelloWave />
                                    </ThemedText>
                                    {time === "morning" && !morningStreak ? (
                                        <ThemedText style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 14, marginTop: 4 }}>
                                            Complete your morning adkar
                                        </ThemedText>
                                    ) : time === "evening" && !eveningStreak ? (
                                        <ThemedText style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 14, marginTop: 4 }}>
                                            Complete your evening adkar
                                        </ThemedText>
                                    ) : time === "morning" ? (
                                        <ThemedText style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 14, marginTop: 4 }}>
                                            You have completed your morning adkar! ✓
                                        </ThemedText>
                                    ) : time === "evening" ? (
                                        <ThemedText style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 14, marginTop: 4 }}>
                                            You have completed your evening adkar! ✓
                                        </ThemedText>
                                    ) : null}
                                </View>
                            </View>
                        </LinearGradient>
                    </ImageBackground>

                    {/* Streak Counter */}
                    <View style={{
                        marginBottom: 40,
                        backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
                        borderRadius: 20,
                        padding: 24,
                        borderWidth: 1,
                        borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#e0e0e0'
                    }}>
                        {/* Current Streak */}
                        <View style={{
                            alignItems: 'center',
                            marginBottom: 24
                        }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                <Ionicons name="flame" size={28} color="#ff6b35" style={{ marginRight: 8 }} />
                                <ThemedText style={{
                                    fontSize: 24,
                                    fontWeight: 'bold',
                                    color: theme === 'dark' ? '#ffffff' : '#333'
                                }}>
                                    {streak} Day Streak
                                </ThemedText>
                            </View>
                            <ThemedText style={{
                                fontSize: 14,
                                color: theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : '#666',
                                textAlign: 'center'
                            }}>
                                {streak > 0 ? "Keep it up! 🔥" : "Complete both adkar to start your streak"}
                            </ThemedText>
                        </View>

                        <View style={{
                            backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
                            borderRadius: 16,
                            padding: 20,
                            borderWidth: 1,
                            borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#e0e0e0'
                        }}>
                            <ThemedText style={{
                                fontSize: 16,
                                fontWeight: 'bold',
                                color: theme === 'dark' ? '#ffffff' : '#333',
                                textAlign: 'center',
                                marginBottom: 16
                            }}>
                                This Week
                            </ThemedText>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                {weekData.map((day, index) => (
                                    <View key={day.date} style={{ alignItems: 'center', flex: 1 }}>
                                        {/* Day name */}
                                        <ThemedText style={{
                                            fontSize: 12,
                                            color: day.isToday ? '#61B553' : (theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : '#666'),
                                            fontWeight: day.isToday ? 'bold' : 'normal',
                                            marginBottom: 8
                                        }}>
                                            {day.dayName}
                                        </ThemedText>

                                        {/* Day circle */}
                                        <View style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: 18,
                                            borderWidth: 2,
                                            borderColor: day.isToday ? '#61B553' : (day.morning && day.evening ? '#61B553' : (theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : '#e0e0e0')),
                                            backgroundColor: day.morning && day.evening ? '#61B553' : 'transparent',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: 6
                                        }}>
                                            {day.morning && day.evening ? (
                                                <Ionicons name="checkmark" size={18} color="#ffffff" />
                                            ) : day.morning || day.evening ? (
                                                <View style={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: 4,
                                                    backgroundColor: '#ff9800'
                                                }} />
                                            ) : day.isToday ? (
                                                <View style={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: 4,
                                                    backgroundColor: '#61B553'
                                                }} />
                                            ) : null}
                                        </View>

                                        {/* Progress dots for morning/evening */}
                                        <View style={{ flexDirection: 'row', gap: 4 }}>
                                            <View style={{
                                                width: 6,
                                                height: 6,
                                                borderRadius: 3,
                                                backgroundColor: day.morning ? '#61B553' : (theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : '#e0e0e0')
                                            }} />
                                            <View style={{
                                                width: 6,
                                                height: 6,
                                                borderRadius: 3,
                                                backgroundColor: day.evening ? '#28A766' : (theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : '#e0e0e0')
                                            }} />
                                        </View>
                                    </View>
                                ))}
                            </View>

                            {/* Legend */}
                            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16, gap: 16 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#61B553', marginRight: 4 }} />
                                    <ThemedText style={{
                                        fontSize: 12,
                                        color: theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : '#666'
                                    }}>Morning</ThemedText>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#28A766', marginRight: 4 }} />
                                    <ThemedText style={{
                                        fontSize: 12,
                                        color: theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : '#666'
                                    }}>Evening</ThemedText>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={{ marginBottom: 32 }}>
                        <View style={{ flexDirection: 'row', gap: 20, paddingHorizontal: 4 }}>
                            <TouchableOpacity
                                onPress={() => router.push("/morning-adkar")}
                                style={{
                                    borderRadius: 20,
                                    aspectRatio: 1,
                                    flex: 1,
                                    overflow: 'hidden',
                                    shadowColor: '#61B553',
                                    shadowOffset: { width: 0, height: 8 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 12,
                                    elevation: 8
                                }}
                            >
                                <LinearGradient
                                    colors={['rgba(97, 181, 83, 0.9)', 'rgba(97, 181, 83, 1)']}
                                    style={{
                                        flex: 1,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: 24,
                                        position: 'relative'
                                    }}
                                >
                                    {/* Glassmorphism overlay */}
                                    <View style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.1)',
                                        backdropFilter: 'blur(10px)'
                                    }} />

                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, zIndex: 1 }}>
                                        <Ionicons name="sunny" size={52} color="#ffffff" style={{ marginRight: 12 }} />
                                        <Ionicons name="cloudy" size={28} color="#ffffff" />
                                    </View>
                                    <ThemedText style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold', textAlign: 'center', zIndex: 1 }}>
                                        Morning{'\n'}Adkar
                                    </ThemedText>

                                    {/* Decorative elements */}
                                    <View style={{
                                        position: 'absolute',
                                        top: 16,
                                        right: 16,
                                        width: 32,
                                        height: 32,
                                        borderRadius: 16,
                                        backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.2)'
                                    }} />
                                    <View style={{
                                        position: 'absolute',
                                        bottom: 16,
                                        left: 16,
                                        width: 24,
                                        height: 24,
                                        borderRadius: 12,
                                        backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.15)'
                                    }} />
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => router.push("/evening-adkar")}
                                style={{
                                    borderRadius: 20,
                                    aspectRatio: 1,
                                    flex: 1,
                                    overflow: 'hidden',
                                    shadowColor: '#28A766',
                                    shadowOffset: { width: 0, height: 8 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 12,
                                    elevation: 8
                                }}
                            >
                                <LinearGradient
                                    colors={['rgba(40, 167, 102, 0.9)', 'rgba(40, 167, 102, 1)']}
                                    style={{
                                        flex: 1,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: 24,
                                        position: 'relative'
                                    }}
                                >
                                    {/* Glassmorphism overlay */}
                                    <View style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.1)',
                                        backdropFilter: 'blur(10px)'
                                    }} />

                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, zIndex: 1 }}>
                                        <Ionicons name="moon" size={52} color="#ffffff" style={{ marginRight: 12 }} />
                                        <Ionicons name="star" size={20} color="#ffffff" />
                                    </View>
                                    <ThemedText style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold', textAlign: 'center', zIndex: 1 }}>
                                        Evening{'\n'}Adkar
                                    </ThemedText>

                                    {/* Decorative elements */}
                                    <View style={{
                                        position: 'absolute',
                                        top: 16,
                                        right: 16,
                                        width: 32,
                                        height: 32,
                                        borderRadius: 16,
                                        backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.2)'
                                    }} />
                                    <View style={{
                                        position: 'absolute',
                                        bottom: 16,
                                        left: 16,
                                        width: 24,
                                        height: 24,
                                        borderRadius: 12,
                                        backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.15)'
                                    }} />
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Quote Section */}
                    <View style={{
                        marginBottom: 32,
                        backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
                        borderRadius: 20,
                        padding: 24,
                        borderWidth: 1,
                        borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#e0e0e0'
                    }}>
                        <View style={{ alignItems: 'center' }}>
                            <View style={{
                                width: 40,
                                height: 2,
                                backgroundColor: '#61B553',
                                marginBottom: 20,
                                borderRadius: 1
                            }} />

                            <ThemedText style={{
                                fontSize: 20,
                                lineHeight: 32,
                                textAlign: 'center',
                                marginBottom: 16,
                                fontStyle: 'italic',
                                color: theme === 'dark' ? '#ffffff' : '#333',
                                fontWeight: '300'
                            }}>
                                "Remember Allah in times of ease and He will remember you in times of difficulty."
                            </ThemedText>

                            <ThemedText style={{
                                textAlign: 'center',
                                color: theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : '#666',
                                fontSize: 16
                            }}>
                                - Prophet Muhammed ﷺ
                            </ThemedText>

                            <View style={{
                                width: 40,
                                height: 2,
                                backgroundColor: '#61B553',
                                marginTop: 20,
                                borderRadius: 1
                            }} />
                        </View>
                    </View>
                </ScrollView>
            </LinearGradient>
        </SafeAreaProvider>
    );
};

export default Home;
