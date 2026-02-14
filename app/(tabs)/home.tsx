import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { ImageBackground, RefreshControl, ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/context/AuthContext";
import { SyncProvider } from "@/context/SyncContext";
import ThemeContext from "@/context/ThemeContext";
import { supabase } from "@/lib/supabase";
import { useSQLiteContext } from "expo-sqlite";

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
    const { user } = useAuth();
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

    // Use ref to prevent concurrent database operations
    const isLoadingRef = React.useRef(false);
    const [dbReady, setDbReady] = useState(false);

    // Function to download data from Supabase and merge with local data
    const downloadAndMergeSupabaseData = async () => {
        if (!user || !db) return;

        try {
            console.log("📥 Downloading data from Supabase...");
            
            // Get all records from Supabase for this user
            const { data: supabaseRecords, error } = await supabase
                .from('adkar_streaks')
                .select('*')
                .eq('user_id', user.id)
                .order('date', { ascending: false });

            if (error) {
                console.error('Error fetching Supabase data:', error);
                return;
            }

            if (!supabaseRecords || supabaseRecords.length === 0) {
                console.log("No Supabase data to download");
                return;
            }

            console.log(`Found ${supabaseRecords.length} records in Supabase`);

            // Get all local records
            const localRecords = await db.getAllAsync<{
                id: number;
                date: string;
                morning: boolean;
                evening: boolean;
            }>(`
                SELECT id, date, morning, evening 
                FROM adkarStreaks 
                ORDER BY date DESC
            `);

            // Create a map of local records for quick lookup
            const localMap = new Map<string, { morning: boolean; evening: boolean }>();
            localRecords.forEach(record => {
                localMap.set(record.date, { morning: record.morning, evening: record.evening });
            });

            // Merge Supabase data with local data
            for (const supabaseRecord of supabaseRecords) {
                const localData = localMap.get(supabaseRecord.date);
                
                if (localData) {
                    // Record exists locally - merge the data (keep the most complete version)
                    const mergedMorning = localData.morning || supabaseRecord.morning;
                    const mergedEvening = localData.evening || supabaseRecord.evening;
                    
                    // Only update if there's a difference
                    if (mergedMorning !== localData.morning || mergedEvening !== localData.evening) {
                        await db.execAsync(`
                            UPDATE adkarStreaks 
                            SET morning = ${mergedMorning ? 1 : 0}, evening = ${mergedEvening ? 1 : 0}
                            WHERE date = '${supabaseRecord.date}'
                        `);
                        console.log(`✅ Merged data for ${supabaseRecord.date}`);
                    }
                } else {
                    // Record doesn't exist locally - insert it
                    await db.execAsync(`
                        INSERT INTO adkarStreaks (date, morning, evening)
                        VALUES ('${supabaseRecord.date}', ${supabaseRecord.morning ? 1 : 0}, ${supabaseRecord.evening ? 1 : 0})
                    `);
                    console.log(`✅ Downloaded new record for ${supabaseRecord.date}`);
                }
            }

            console.log("✅ Supabase data download and merge completed");
            
            // Reload the UI with merged data
            await loadAllData();
            
        } catch (error) {
            console.error("Error downloading Supabase data:", error);
        }
    };

    // Function to sync local data to Supabase
    const syncLocalDataToSupabase = async () => {
        if (!user || !db) return;

        try {
            console.log("🔄 Syncing local data to Supabase...");
            
            // Get all local records
            const localRecords = await db.getAllAsync<{
                id: number;
                date: string;
                morning: boolean;
                evening: boolean;
            }>(`
                SELECT id, date, morning, evening 
                FROM adkarStreaks 
                WHERE morning = true OR evening = true
                ORDER BY date DESC
            `);

            if (!localRecords || localRecords.length === 0) {
                console.log("No local data to sync");
                return;
            }

            // Sync each record to Supabase
            for (const record of localRecords) {
                try {
                    // Check if record already exists in Supabase
                    const { data: existingRecord, error: fetchError } = await supabase
                        .from('adkar_streaks')
                        .select('*')
                        .eq('user_id', user.id)
                        .eq('date', record.date)
                        .single();

                    if (fetchError && fetchError.code !== 'PGRST116') {
                        console.error(`Error fetching record for ${record.date}:`, fetchError);
                        continue;
                    }

                    if (existingRecord) {
                        // Update existing record if local data is more complete
                        const needsUpdate = 
                            (record.morning && !existingRecord.morning) ||
                            (record.evening && !existingRecord.evening);

                        if (needsUpdate) {
                            const { error: updateError } = await supabase
                                .from('adkar_streaks')
                                .update({
                                    morning: record.morning || existingRecord.morning,
                                    evening: record.evening || existingRecord.evening,
                                })
                                .eq('user_id', user.id)
                                .eq('date', record.date);

                            if (updateError) {
                                console.error(`Error updating record for ${record.date}:`, updateError);
                            } else {
                                console.log(`✅ Updated Supabase record for ${record.date}`);
                            }
                        }
                    } else {
                        // Create new record
                        const { error: insertError } = await supabase
                            .from('adkar_streaks')
                            .insert({
                                user_id: user.id,
                                date: record.date,
                                morning: record.morning,
                                evening: record.evening,
                            });

                        if (insertError) {
                            console.error(`Error creating record for ${record.date}:`, insertError);
                        } else {
                            console.log(`✅ Created Supabase record for ${record.date}`);
                        }
                    }
                } catch (recordError) {
                    console.error(`Error syncing record for ${record.date}:`, recordError);
                }
            }

            console.log("✅ Local data sync completed");
        } catch (error) {
            console.error("Error syncing local data to Supabase:", error);
        }
    };

    // Wait for database to be fully initialized
    useEffect(() => {
        let retryCount = 0;
        const maxRetries = 5;
        let hasLoggedInfo = false;
        
        const initDb = async () => {
            // Wait for database to be ready (increased delay for reliability)
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            if (!db) {
                console.log("Database still not available after wait");
                return;
            }
            
            // Actually test the database connection
            try {
                await db.getFirstAsync("SELECT 1");
                // Add a small additional delay to ensure stability
                await new Promise(resolve => setTimeout(resolve, 200));
                console.log("✅ Database connection established and verified");
                setDbReady(true);
            } catch (error) {
                retryCount++;
                if (retryCount < maxRetries) {
                    if (!hasLoggedInfo) {
                        console.log("ℹ️  Database initializing... (Hot reload may cause temporary connection issues)");
                        hasLoggedInfo = true;
                    }
                    // Retry after a short delay
                    setTimeout(() => {
                        initDb();
                    }, 500);
                } else {
                    console.error("Database connection failed after max retries");
                }
            }
        };
        
        initDb();
    }, [db]);

    // Download from Supabase and sync local data when user logs in
    useEffect(() => {
        if (user && dbReady) {
            // Small delay to ensure everything is ready
            const syncTimer = setTimeout(async () => {
                try {
                    // First download and merge data from Supabase
                    await downloadAndMergeSupabaseData();
                    // Then sync any local changes back to Supabase
                    await syncLocalDataToSupabase();
                } catch (error) {
                    // Network unavailable or Supabase unreachable — continue offline
                    console.warn("Supabase sync skipped (offline or unreachable):", error);
                }
            }, 2000);

            return () => clearTimeout(syncTimer);
        }
    }, [user, dbReady]);

    // Combined function to load all data in a single operation with retry logic
    async function loadAllData(retryCount = 0): Promise<boolean> {
        const maxRetries = 5;
        
        if (!db || !dbReady) {
            console.log("Database not ready, skipping data load");
            return false;
        }
        
        try {
            // Re-verify connection before using (important for hot reload scenarios)
            await db.getFirstAsync("SELECT 1");
            
            // Small delay to ensure connection stability
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // First, ensure today's entry exists
            await db.execAsync(`
                INSERT OR IGNORE INTO adkarStreaks (date) VALUES (date('now'))
            `);

            // Fetch all data in a single query
            const allRecords = await db.getAllAsync<Row>(
                `SELECT id, date, morning, evening 
                 FROM adkarStreaks 
                 ORDER BY date DESC
                 LIMIT 100`
            );

            if (!allRecords || allRecords.length === 0) {
                // No records yet, this is normal on first run
                return false;
            }

            const today = new Date().toISOString().slice(0, 10);
            
            // Process today's data
            const todayRecord = allRecords.find(r => r.date === today);
            if (todayRecord) {
                setMorningStreak(todayRecord.morning);
                setEveningStreak(todayRecord.evening);
            }

            // Calculate streak
            let currentStreak = 0;
            const sortedRecords = [...allRecords].reverse(); // Sort ascending by date
            
            for (const record of sortedRecords) {
                if (record.morning && record.evening) {
                    currentStreak++;
                } else {
                    if (record.date !== today) {
                        currentStreak = 0;
                    }
                }
            }
            setStreak(currentStreak);

            // Build last 7 days data
            const last7Days = [];
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateString = date.toISOString().slice(0, 10);
                const dayName = dayNames[date.getDay()];

                const record = allRecords.find(r => r.date === dateString);
                
                last7Days.push({
                    date: dateString,
                    dayName,
                    morning: record?.morning || false,
                    evening: record?.evening || false,
                    isToday: i === 0
                });
            }
            
            setWeekData(last7Days);
            
            // Log success to confirm data loaded (helps during development)
            if (retryCount > 0) {
                console.log(`✅ Data loaded successfully after ${retryCount} retry(ies)`);
            }
            
            return true;
            
        } catch (error) {
            if (retryCount < maxRetries) {
                // Silently retry without logging errors (normal during hot reloads)
                // Exponential backoff: wait longer each retry
                const delay = 200 * (retryCount + 1);
                await new Promise(resolve => setTimeout(resolve, delay));
                return loadAllData(retryCount + 1);
            } else {
                // Only log error if all retries failed
                console.error("Failed to load data after all retries. This is normal during development hot reloads.");
                return false;
            }
        }
    }

    useEffect(() => {
        const initializeData = async () => {
            // Wait for database to be ready
            if (!dbReady) {
                return;
            }

            // Prevent concurrent loads
            if (isLoadingRef.current) {
                console.log("Data load already in progress, skipping...");
                return;
            }

            // Small delay after dbReady to ensure full stability
            await new Promise(resolve => setTimeout(resolve, 100));

            isLoadingRef.current = true;
            try {
                const storedName = await AsyncStorage.getItem("name");
                if (storedName) {
                    setName(storedName);
                }

                // Load all data in a single operation
                await loadAllData();
            } catch (error) {
                // Errors are handled in loadAllData with retries
            } finally {
                isLoadingRef.current = false;
            }
        };

        initializeData();
    }, [dbReady]);

    // Refresh data when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            let isActive = true;
            
            const refreshData = async () => {
                // Wait for database to be ready
                if (!dbReady) {
                    return;
                }

                // Prevent concurrent loads
                if (isLoadingRef.current) {
                    console.log("Data load already in progress, skipping focus effect...");
                    return;
                }

                // Small delay to avoid race conditions when switching tabs
                await new Promise(resolve => setTimeout(resolve, 100));

                if (!isActive) return;

                isLoadingRef.current = true;
                try {
                    // Load all data in a single operation
                    if (isActive) await loadAllData();
                } catch (error) {
                    // Errors are handled in loadAllData with retries
                } finally {
                    if (isActive) {
                        isLoadingRef.current = false;
                    }
                }
            };
            
            refreshData();
            
            return () => {
                isActive = false;
                // Reset the loading flag when component unmounts or loses focus
                isLoadingRef.current = false;
            };
        }, [dbReady])
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
        // Wait for database to be ready
        if (!dbReady) {
            console.log("Database not ready, skipping refresh...");
            setRefreshing(false);
            return;
        }

        // Prevent concurrent loads
        if (isLoadingRef.current) {
            console.log("Data load already in progress, skipping refresh...");
            setRefreshing(false);
            return;
        }

        setRefreshing(true);
        isLoadingRef.current = true;

        try {
            // If user is logged in, try to sync with Supabase first
            if (user) {
                try {
                    await downloadAndMergeSupabaseData();
                    await syncLocalDataToSupabase();
                } catch (syncError) {
                    // Sync failed (offline) — fall back to local data
                    console.warn("Refresh sync skipped (offline or unreachable):", syncError);
                    await loadAllData();
                }
            } else {
                // Just reload local data if not logged in
                await loadAllData();
            }
        } catch (error) {
            // Fallback error handler
            console.warn("Refresh failed:", error);
        } finally {
            isLoadingRef.current = false;
            setTimeout(() => setRefreshing(false), 1000);
        }
    };

    // Function to trigger Supabase sync (called from AdkarCard)
    const handleStreakUpdated = async () => {
        if (user) {
            try {
                console.log("🔄 Streak updated, syncing to Supabase...");
                await syncLocalDataToSupabase();
            } catch (error) {
                // Sync failed (offline) — streak is saved locally, will sync next time
                console.warn("Streak sync skipped (offline or unreachable):", error);
            }
        }
    };

    return (
        <SyncProvider onSync={handleStreakUpdated}>
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
                    {/* Personalized Welcome Header */}
                    <View style={{
                        marginBottom: 24
                    }}>
                        <ThemedText style={{
                            fontSize: 28,
                            fontWeight: 'bold',
                            color: theme === 'dark' ? '#ffffff' : '#333',
                            marginBottom: 8
                        }}>
                            Hey there {name}!
                        </ThemedText>
                        <ThemedText style={{
                            fontSize: 16,
                            color: theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : '#666'
                        }}>
                            Ready for your spiritual journey today?
                        </ThemedText>
                    </View>

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
                        defaultSource={theme === 'dark' ? require('@/assets/images/icon.png') : require('@/assets/images/icon-dark.png')}
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
                                    name={timeInfo.icon as any}
                                    size={48}
                                    color="rgba(255, 255, 255, 0.9)"
                                />
                            </View>

                            {/* Bottom Section - Status Message */}
                            <View style={{ marginTop: 20 }}>
                                {time === "morning" && !morningStreak ? (
                                    <ThemedText style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 16, fontWeight: '500' }}>
                                        🌅 Complete your morning adkar
                                    </ThemedText>
                                ) : time === "evening" && !eveningStreak ? (
                                    <ThemedText style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 16, fontWeight: '500' }}>
                                        🌙 Complete your evening adkar
                                    </ThemedText>
                                ) : time === "morning" ? (
                                    <ThemedText style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 16, fontWeight: '500' }}>
                                        ✅ Morning adkar completed!
                                    </ThemedText>
                                ) : time === "evening" ? (
                                    <ThemedText style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 16, fontWeight: '500' }}>
                                        ✅ Evening adkar completed!
                                    </ThemedText>
                                ) : (
                                    <ThemedText style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 16, fontWeight: '500' }}>
                                        ✨ السلام عليكم ورحمة الله
                                    </ThemedText>
                                )}
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
                                <Ionicons name="flame" size={28} color="#2196F3" style={{ marginRight: 8 }} />
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
                                            color: day.isToday ? '#2196F3' : (theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : '#666'),
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
                                            borderColor: day.isToday ? '#2196F3' : (day.morning && day.evening ? '#2196F3' : (theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : '#e0e0e0')),
                                            backgroundColor: day.morning && day.evening ? '#2196F3' : 'transparent',
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
                                                    backgroundColor: '#1976D2'
                                                }} />
                                            ) : day.isToday ? (
                                                <View style={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: 4,
                                                    backgroundColor: '#2196F3'
                                                }} />
                                            ) : null}
                                        </View>

                                        {/* Progress dots for morning/evening */}
                                        <View style={{ flexDirection: 'row', gap: 4 }}>
                                            <View style={{
                                                width: 6,
                                                height: 6,
                                                borderRadius: 3,
                                                backgroundColor: day.morning ? '#2196F3' : (theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : '#e0e0e0')
                                            }} />
                                            <View style={{
                                                width: 6,
                                                height: 6,
                                                borderRadius: 3,
                                                backgroundColor: day.evening ? '#1976D2' : (theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : '#e0e0e0')
                                            }} />
                                        </View>
                                    </View>
                                ))}
                            </View>

                            {/* Legend */}
                            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16, gap: 16 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#2196F3', marginRight: 4 }} />
                                    <ThemedText style={{
                                        fontSize: 12,
                                        color: theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : '#666'
                                    }}>Morning</ThemedText>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#1976D2', marginRight: 4 }} />
                                    <ThemedText style={{
                                        fontSize: 12,
                                        color: theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : '#666'
                                    }}>Evening</ThemedText>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Enhanced Action Buttons */}
                    <View style={{ marginBottom: 32 }}>
                        <View style={{ flexDirection: 'row', gap: 16, paddingHorizontal: 4 }}>
                            <TouchableOpacity
                                onPress={() => router.push("/morning-adkar")}
                                style={{
                                    borderRadius: 24,
                                    flex: 1,
                                    height: 180,
                                    overflow: 'hidden',
                                    shadowColor: '#42A5F5',
                                    shadowOffset: { width: 0, height: 12 },
                                    shadowOpacity: 0.4,
                                    shadowRadius: 16,
                                    elevation: 12
                                }}
                            >
                                <LinearGradient
                                    colors={['#E3F2FD', '#64B5F6', '#42A5F5']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={{
                                        flex: 1,
                                        padding: 20,
                                        position: 'relative',
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    {/* Glassmorphism overlay */}
                                    <View style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                        backdropFilter: 'blur(20px)'
                                    }} />

                                    {/* Top section with icon */}
                                    <View style={{ zIndex: 1, alignItems: 'flex-start' }}>
                                        <View style={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.25)',
                                            borderRadius: 16,
                                            padding: 12,
                                            marginBottom: 12
                                        }}>
                                            <Ionicons name="sunny" size={32} color="#ffffff" />
                                        </View>
                                        <ThemedText style={{
                                            color: '#ffffff',
                                            fontSize: 18,
                                            fontWeight: 'bold',
                                            textShadowColor: 'rgba(0, 0, 0, 0.3)',
                                            textShadowOffset: { width: 0, height: 1 },
                                            textShadowRadius: 3
                                        }}>
                                            Morning{'\n'}Adkar
                                        </ThemedText>
                                    </View>

                                    {/* Bottom section with status */}
                                    <View style={{ zIndex: 1, alignItems: 'flex-start' }}>
                                        {morningStreak ? (
                                            <View style={{
                                                backgroundColor: 'rgba(33, 150, 243, 0.9)',
                                                paddingHorizontal: 12,
                                                paddingVertical: 6,
                                                borderRadius: 12,
                                                flexDirection: 'row',
                                                alignItems: 'center'
                                            }}>
                                                <Ionicons name="checkmark-circle" size={16} color="#ffffff" style={{ marginRight: 4 }} />
                                                <ThemedText style={{ color: '#ffffff', fontSize: 12, fontWeight: '600' }}>
                                                    Completed
                                                </ThemedText>
                                            </View>
                                        ) : (
                                            <View style={{
                                                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                                                paddingHorizontal: 12,
                                                paddingVertical: 6,
                                                borderRadius: 12
                                            }}>
                                                <ThemedText style={{ color: '#ffffff', fontSize: 12, fontWeight: '600' }}>
                                                    Start now
                                                </ThemedText>
                                            </View>
                                        )}
                                    </View>

                                    {/* Decorative floating elements */}
                                    <View style={{
                                        position: 'absolute',
                                        top: 20,
                                        right: 20,
                                        width: 8,
                                        height: 8,
                                        borderRadius: 4,
                                        backgroundColor: 'rgba(255, 255, 255, 0.4)'
                                    }} />
                                    <View style={{
                                        position: 'absolute',
                                        top: 40,
                                        right: 35,
                                        width: 4,
                                        height: 4,
                                        borderRadius: 2,
                                        backgroundColor: 'rgba(255, 255, 255, 0.6)'
                                    }} />
                                    <View style={{
                                        position: 'absolute',
                                        bottom: 20,
                                        right: 20,
                                        width: 12,
                                        height: 12,
                                        borderRadius: 6,
                                        backgroundColor: 'rgba(255, 255, 255, 0.3)'
                                    }} />
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => router.push("/evening-adkar")}
                                style={{
                                    borderRadius: 24,
                                    flex: 1,
                                    height: 180,
                                    overflow: 'hidden',
                                    shadowColor: '#7B1FA2',
                                    shadowOffset: { width: 0, height: 12 },
                                    shadowOpacity: 0.4,
                                    shadowRadius: 16,
                                    elevation: 12
                                }}
                            >
                                <LinearGradient
                                    colors={['#9C27B0', '#4A148C', '#1A1A1A']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={{
                                        flex: 1,
                                        padding: 20,
                                        position: 'relative',
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    {/* Glassmorphism overlay */}
                                    <View style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                        backdropFilter: 'blur(20px)'
                                    }} />

                                    {/* Top section with icon */}
                                    <View style={{ zIndex: 1, alignItems: 'flex-start' }}>
                                        <View style={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.25)',
                                            borderRadius: 16,
                                            padding: 12,
                                            marginBottom: 12
                                        }}>
                                            <Ionicons name="moon" size={32} color="#ffffff" />
                                        </View>
                                        <ThemedText style={{
                                            color: '#ffffff',
                                            fontSize: 18,
                                            fontWeight: 'bold',
                                            textShadowColor: 'rgba(0, 0, 0, 0.3)',
                                            textShadowOffset: { width: 0, height: 1 },
                                            textShadowRadius: 3
                                        }}>
                                            Evening{'\n'}Adkar
                                        </ThemedText>
                                    </View>

                                    {/* Bottom section with status */}
                                    <View style={{ zIndex: 1, alignItems: 'flex-start' }}>
                                        {eveningStreak ? (
                                            <View style={{
                                                backgroundColor: 'rgba(33, 150, 243, 0.9)',
                                                paddingHorizontal: 12,
                                                paddingVertical: 6,
                                                borderRadius: 12,
                                                flexDirection: 'row',
                                                alignItems: 'center'
                                            }}>
                                                <Ionicons name="checkmark-circle" size={16} color="#ffffff" style={{ marginRight: 4 }} />
                                                <ThemedText style={{ color: '#ffffff', fontSize: 12, fontWeight: '600' }}>
                                                    Completed
                                                </ThemedText>
                                            </View>
                                        ) : (
                                            <View style={{
                                                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                                                paddingHorizontal: 12,
                                                paddingVertical: 6,
                                                borderRadius: 12
                                            }}>
                                                <ThemedText style={{ color: '#ffffff', fontSize: 12, fontWeight: '600' }}>
                                                    Start now
                                                </ThemedText>
                                            </View>
                                        )}
                                    </View>

                                    {/* Decorative floating elements */}
                                    <View style={{
                                        position: 'absolute',
                                        top: 20,
                                        right: 20,
                                        width: 6,
                                        height: 6,
                                        borderRadius: 3,
                                        backgroundColor: 'rgba(255, 255, 255, 0.5)'
                                    }} />
                                    <View style={{
                                        position: 'absolute',
                                        top: 35,
                                        right: 30,
                                        width: 3,
                                        height: 3,
                                        borderRadius: 1.5,
                                        backgroundColor: 'rgba(255, 255, 255, 0.7)'
                                    }} />
                                    <View style={{
                                        position: 'absolute',
                                        top: 50,
                                        right: 40,
                                        width: 2,
                                        height: 2,
                                        borderRadius: 1,
                                        backgroundColor: 'rgba(255, 255, 255, 0.6)'
                                    }} />
                                    <View style={{
                                        position: 'absolute',
                                        bottom: 20,
                                        right: 25,
                                        width: 10,
                                        height: 10,
                                        borderRadius: 5,
                                        backgroundColor: 'rgba(255, 255, 255, 0.3)'
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
                                backgroundColor: '#2196F3',
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
                                backgroundColor: '#2196F3',
                                marginTop: 20,
                                borderRadius: 1
                            }} />
                        </View>
                    </View>
                </ScrollView>
            </LinearGradient>
        </SafeAreaProvider>
        </SyncProvider>
    );
};

export default Home;
