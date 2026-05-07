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
import { localDateString } from "@/lib/date";
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
    const [name, setName] = useState<string>("Hero");
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

    const [weekData, setWeekData] = useState<{
        date: string,
        dayName: string,
        morning: boolean,
        evening: boolean,
        isToday: boolean
    }[]>([]);

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
                        await db.runAsync(
                            'UPDATE adkarStreaks SET morning = ?, evening = ? WHERE date = ?',
                            [mergedMorning ? 1 : 0, mergedEvening ? 1 : 0, supabaseRecord.date]
                        );
                        console.log(`✅ Merged data for ${supabaseRecord.date}`);
                    }
                } else {
                    // Record doesn't exist locally - insert it
                    await db.runAsync(
                        'INSERT INTO adkarStreaks (date, morning, evening) VALUES (?, ?, ?)',
                        [supabaseRecord.date, supabaseRecord.morning ? 1 : 0, supabaseRecord.evening ? 1 : 0]
                    );
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

    // Resolve display name: explicit Profile entry → Supabase metadata → email prefix → default
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const storedName = await AsyncStorage.getItem("name");
                if (cancelled) return;
                if (storedName) {
                    setName(storedName);
                    return;
                }
                const meta = user?.user_metadata as { full_name?: string; name?: string } | undefined;
                const fromMeta = meta?.full_name || meta?.name;
                if (fromMeta) {
                    setName(String(fromMeta).split(" ")[0]);
                } else if (user?.email) {
                    setName(user.email.split("@")[0]);
                }
            } catch (e) {
                console.warn("Failed to resolve display name:", e);
            }
        })();
        return () => { cancelled = true; };
    }, [user]);

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
            
            // First, ensure today's entry exists (local-time date)
            await db.runAsync(
                'INSERT OR IGNORE INTO adkarStreaks (date) VALUES (?)',
                [localDateString()]
            );

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

            const today = localDateString();

            // Process today's data
            const todayRecord = allRecords.find(r => r.date === today);
            if (todayRecord) {
                setMorningStreak(todayRecord.morning);
                setEveningStreak(todayRecord.evening);
            }

            // Calculate streak by walking local calendar dates backward from today.
            // Break at the first missing or incomplete day; today is allowed to be partial.
            const recordsByDate = new Map(allRecords.map(r => [r.date, r]));
            let currentStreak = 0;
            for (let i = 0; i < 365; i++) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = localDateString(d);
                const rec = recordsByDate.get(dateStr);
                const complete = rec && rec.morning && rec.evening;
                if (complete) {
                    currentStreak++;
                } else if (dateStr === today) {
                    continue;
                } else {
                    break;
                }
            }
            setStreak(currentStreak);

            // Build last 7 days data (all in local time)
            const last7Days = [];
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateString = localDateString(date);
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

        if (hours >= 5 && hours < 12) {
            return {
                period: "Morning",
                timeLeft: "Ends 12:00",
                image: require('@/assets/images/time-morning.jpg'),
                icon: "sunny",
            };
        } else if (hours >= 12 && hours < 18) {
            return {
                period: "Afternoon",
                timeLeft: "Ends 18:00",
                image: require('@/assets/images/time-morning.jpg'),
                icon: "sunny",
            };
        } else if (hours >= 18 && hours < 22) {
            return {
                period: "Evening",
                timeLeft: "Ends 22:00",
                image: require('@/assets/images/time-night.jpg'),
                icon: "moon",
            };
        } else {
            return {
                period: "Night",
                timeLeft: "Ends 05:00",
                image: require('@/assets/images/time-night.jpg'),
                icon: "moon",
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

    const isDark = theme === 'dark';
    const surface = isDark ? '#0e0e12' : '#ffffff';
    const text = isDark ? '#ffffff' : '#111111';
    const muted = isDark ? '#9aa0a6' : '#6b7280';
    const subtle = isDark ? '#1a1a20' : '#f4f4f7';
    const hairline = isDark ? '#26262d' : '#ececef';
    const accent = '#2196F3';

    const statusMessage =
        time === 'morning' && !morningStreak ? '🌅 Complete your morning adkar' :
        time === 'evening' && !eveningStreak ? '🌙 Complete your evening adkar' :
        time === 'morning' ? '✅ Morning adkar completed!' :
        time === 'evening' ? '✅ Evening adkar completed!' :
        '✨ السلام عليكم ورحمة الله';

    return (
        <SyncProvider onSync={handleStreakUpdated}>
            <SafeAreaProvider>
                <View style={{ flex: 1, backgroundColor: surface }}>
                    <ScrollView
                        style={{ flex: 1 }}
                        contentContainerStyle={{
                            paddingHorizontal: 20,
                            paddingTop: insets.top + 16,
                            paddingBottom: 100 + insets.bottom,
                        }}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                tintColor={isDark ? '#ffffff' : '#000000'}
                            />
                        }
                    >
                        {/* Greeting */}
                        <View style={{ marginBottom: 28 }}>
                            <ThemedText style={{ fontSize: 14, color: muted, marginBottom: 6, fontWeight: '500' }}>
                                Assalamu alaikum
                            </ThemedText>
                            <ThemedText style={{ fontSize: 32, fontWeight: '700', color: text, letterSpacing: -0.5 }}>
                                {name}
                            </ThemedText>
                        </View>

                        {/* Time-of-day hero */}
                        <ImageBackground
                            source={timeInfo.image}
                            style={{
                                borderRadius: 24,
                                marginBottom: 28,
                                minHeight: 168,
                                overflow: 'hidden',
                            }}
                            imageStyle={{ borderRadius: 24 }}
                        >
                            <LinearGradient
                                colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.55)']}
                                style={{ flex: 1, padding: 22, justifyContent: 'space-between' }}
                            >
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <View>
                                        <ThemedText style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginBottom: 2, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 }}>
                                            {timeInfo.timeLeft}
                                        </ThemedText>
                                        <ThemedText style={{ color: '#ffffff', fontSize: 34, fontWeight: '700', letterSpacing: -0.5 }}>
                                            {timeInfo.period}
                                        </ThemedText>
                                    </View>
                                    <Ionicons name={timeInfo.icon as any} size={40} color="rgba(255,255,255,0.9)" />
                                </View>
                                <ThemedText style={{ color: 'rgba(255,255,255,0.95)', fontSize: 15, fontWeight: '500' }}>
                                    {statusMessage}
                                </ThemedText>
                            </LinearGradient>
                        </ImageBackground>

                        {/* Streak block */}
                        <View style={{ marginBottom: 28 }}>
                            <ThemedText style={{ fontSize: 12, color: muted, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 12 }}>
                                Streak
                            </ThemedText>

                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 22 }}>
                                <View style={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: 28,
                                    backgroundColor: accent + '1F',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 16,
                                }}>
                                    <Ionicons name="flame" size={28} color={accent} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                                        <ThemedText style={{ fontSize: 42, fontWeight: '700', color: text, letterSpacing: -1, lineHeight: 46 }}>
                                            {streak}
                                        </ThemedText>
                                        <ThemedText style={{ fontSize: 16, color: muted, fontWeight: '500', marginLeft: 6 }}>
                                            {streak === 1 ? 'day' : 'days'}
                                        </ThemedText>
                                    </View>
                                    <ThemedText style={{ fontSize: 13, color: muted, marginTop: 2 }}>
                                        {streak > 0 ? 'Keep it going' : 'Complete both adkar to start'}
                                    </ThemedText>
                                </View>
                            </View>

                            {/* Week strip */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                {weekData.map((day) => {
                                    const complete = !!day.morning && !!day.evening;
                                    const partial = !complete && (!!day.morning || !!day.evening);
                                    return (
                                        <View key={day.date} style={{ alignItems: 'center', flex: 1 }}>
                                            <ThemedText style={{
                                                fontSize: 11,
                                                color: day.isToday ? accent : muted,
                                                fontWeight: day.isToday ? '700' : '500',
                                                marginBottom: 8,
                                                letterSpacing: 0.5,
                                            }}>
                                                {day.dayName.toUpperCase()}
                                            </ThemedText>
                                            <View style={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: 16,
                                                borderWidth: complete ? 0 : 1.5,
                                                borderColor: day.isToday ? accent : hairline,
                                                backgroundColor: complete ? accent : 'transparent',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginBottom: 6,
                                            }}>
                                                {complete ? (
                                                    <Ionicons name="checkmark" size={16} color="#ffffff" />
                                                ) : partial ? (
                                                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: accent }} />
                                                ) : null}
                                            </View>
                                            <View style={{ flexDirection: 'row', gap: 3 }}>
                                                <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: day.morning ? accent : hairline }} />
                                                <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: day.evening ? '#1976D2' : hairline }} />
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>

                        {/* Action tiles */}
                        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 32 }}>
                            <ActionTile
                                onPress={() => router.push('/morning-adkar')}
                                icon="sunny"
                                title="Morning"
                                subtitle="Adkar"
                                colors={['#42A5F5', '#1E88E5']}
                                done={morningStreak}
                            />
                            <ActionTile
                                onPress={() => router.push('/evening-adkar')}
                                icon="moon"
                                title="Evening"
                                subtitle="Adkar"
                                colors={['#5E35B1', '#311B92']}
                                done={eveningStreak}
                            />
                        </View>

                        {/* Quote */}
                        <View style={{
                            backgroundColor: subtle,
                            borderRadius: 20,
                            padding: 24,
                            marginBottom: 16,
                        }}>
                            <Ionicons
                                name="sparkles"
                                size={18}
                                color={accent}
                                style={{ marginBottom: 12 }}
                            />
                            <ThemedText style={{
                                fontSize: 17,
                                lineHeight: 26,
                                color: text,
                                fontWeight: '500',
                                marginBottom: 12,
                            }}>
                                Remember Allah in times of ease and He will remember you in times of difficulty.
                            </ThemedText>
                            <ThemedText style={{ fontSize: 13, color: muted, fontWeight: '600' }}>
                                — Prophet Muhammed ﷺ
                            </ThemedText>
                        </View>
                    </ScrollView>
                </View>
            </SafeAreaProvider>
        </SyncProvider>
    );
};

type ActionTileProps = {
    onPress: () => void;
    icon: 'sunny' | 'moon';
    title: string;
    subtitle: string;
    colors: [string, string];
    done: boolean;
};

const ActionTile: React.FC<ActionTileProps> = ({ onPress, icon, title, subtitle, colors, done }) => {
    // SQLite returns 0/1 for booleans — coerce so JSX conditionals never
    // try to render a number as a child (which trips the
    // "Text strings must be rendered within a <Text>" error on Android).
    const isDone = !!done;
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.85}
            style={{
                flex: 1,
                borderRadius: 22,
                overflow: 'hidden',
                height: 168,
            }}
        >
            <LinearGradient
                colors={colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ flex: 1, padding: 18, justifyContent: 'space-between' }}
            >
                <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: 'rgba(255,255,255,0.22)',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <Ionicons name={icon} size={22} color="#ffffff" />
                </View>
                <View>
                    <ThemedText style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '500' }}>
                        {subtitle}
                    </ThemedText>
                    <ThemedText style={{ color: '#ffffff', fontSize: 22, fontWeight: '700', marginBottom: 12, letterSpacing: -0.3 }}>
                        {title}
                    </ThemedText>
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        alignSelf: 'flex-start',
                        backgroundColor: isDone ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.18)',
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderRadius: 999,
                    }}>
                        {isDone ? (
                            <Ionicons name="checkmark-circle" size={14} color={colors[1]} style={{ marginRight: 4 }} />
                        ) : null}
                        <ThemedText style={{
                            color: isDone ? colors[1] : '#ffffff',
                            fontSize: 11,
                            fontWeight: '700',
                            letterSpacing: 0.3,
                        }}>
                            {isDone ? 'COMPLETED' : 'START'}
                        </ThemedText>
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};

export default Home;
