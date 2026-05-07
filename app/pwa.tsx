import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useContext, useEffect, useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/context/AuthContext";
import ThemeContext from "@/context/ThemeContext";
import { localDateString } from "@/lib/date";

type PeriodState = 'not_started' | 'in_progress' | 'done';
type Period = 'morning' | 'evening';

const PERIOD_META: Record<Period, {
    title: string;
    badge: keyof typeof Ionicons.glyphMap;
    glyph: keyof typeof Ionicons.glyphMap;
    bg: string;
}> = {
    morning: {
        title: 'Morning',
        badge: 'partly-sunny-outline',
        glyph: 'partly-sunny',
        bg: '#0EA5E9',
    },
    evening: {
        title: 'Evening',
        badge: 'moon-outline',
        glyph: 'moon',
        bg: '#5B21B6',
    },
};

function parseStoredHM(iso: string | null, defH: number, defM: number) {
    if (!iso) return { hour: defH, minute: defM };
    const d = new Date(iso);
    return { hour: d.getHours(), minute: d.getMinutes() };
}

function fmtHM(hour: number, minute: number) {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

function ctaFor(state: PeriodState, startsAt: string) {
    if (state === 'done') return 'Completed today';
    if (state === 'in_progress') return 'Continue';
    return `Start now · ${startsAt}`;
}

const AdkarTile: React.FC<{
    period: Period;
    state: PeriodState;
    startsAt: string;
    onPress: () => void;
}> = ({ period, state, startsAt, onPress }) => {
    const meta = PERIOD_META[period];
    const isDone = state === 'done';
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.88}
            style={{
                height: 168,
                borderRadius: 22,
                overflow: 'hidden',
                backgroundColor: meta.bg,
                marginBottom: 16,
            }}
        >
            <View pointerEvents="none" style={{
                position: 'absolute',
                right: -28,
                bottom: -36,
                opacity: 0.16,
            }}>
                <Ionicons name={meta.glyph} size={200} color="#ffffff" />
            </View>

            <View style={{ flex: 1, padding: 20, justifyContent: 'space-between' }}>
                <View style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: 'rgba(255,255,255,0.22)',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <Ionicons name={meta.badge} size={24} color="#ffffff" />
                </View>

                <View>
                    <ThemedText style={{
                        color: '#ffffff',
                        fontSize: 26,
                        fontWeight: '700',
                        letterSpacing: -0.5,
                        marginBottom: 10,
                    }}>
                        {meta.title} Adkar
                    </ThemedText>
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        alignSelf: 'flex-start',
                        backgroundColor: isDone ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.22)',
                        paddingHorizontal: 12,
                        paddingVertical: 7,
                        borderRadius: 999,
                    }}>
                        {isDone ? (
                            <Ionicons name="checkmark-circle" size={14} color={meta.bg} style={{ marginRight: 5 }} />
                        ) : (
                            <Ionicons name="arrow-forward" size={13} color="#ffffff" style={{ marginRight: 5 }} />
                        )}
                        <ThemedText style={{
                            color: isDone ? meta.bg : '#ffffff',
                            fontSize: 12,
                            fontWeight: '700',
                            letterSpacing: 0.3,
                        }}>
                            {ctaFor(state, startsAt)}
                        </ThemedText>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const PwaHome = () => {
    const [name, setName] = useState<string>("Hero");
    const [morningDone, setMorningDone] = useState(false);
    const [eveningDone, setEveningDone] = useState(false);
    const [morningStarted, setMorningStarted] = useState(false);
    const [eveningStarted, setEveningStarted] = useState(false);
    const [morningHM, setMorningHM] = useState('05:30');
    const [eveningHM, setEveningHM] = useState('16:30');

    const db = useSQLiteContext();
    const { theme } = useContext(ThemeContext);
    const { user } = useAuth();
    const insets = useSafeAreaInsets();

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
            } catch {
                // keep default
            }
        })();
        return () => { cancelled = true; };
    }, [user]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const [m, e] = await Promise.all([
                    AsyncStorage.getItem('morningTime'),
                    AsyncStorage.getItem('eveningTime'),
                ]);
                if (cancelled) return;
                const mp = parseStoredHM(m, 5, 30);
                const ep = parseStoredHM(e, 16, 30);
                setMorningHM(fmtHM(mp.hour, mp.minute));
                setEveningHM(fmtHM(ep.hour, ep.minute));
            } catch {
                // keep defaults
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const loadDayState = React.useCallback(async () => {
        if (!db) return;
        const today = localDateString();
        try {
            await db.runAsync(
                'INSERT OR IGNORE INTO adkarStreaks (date) VALUES (?)',
                [today]
            );
            const row = await db.getFirstAsync<{ morning: boolean; evening: boolean }>(
                'SELECT morning, evening FROM adkarStreaks WHERE date = ?',
                [today]
            );
            setMorningDone(!!row?.morning);
            setEveningDone(!!row?.evening);

            const sd = await AsyncStorage.getItem('streakData');
            if (sd) {
                const parsed = JSON.parse(sd);
                if (parsed?.date === today) {
                    setMorningStarted(Object.values(parsed.morning ?? {}).some(Boolean));
                    setEveningStarted(Object.values(parsed.evening ?? {}).some(Boolean));
                    return;
                }
            }
            setMorningStarted(false);
            setEveningStarted(false);
        } catch {
            // ignore — DB may not be ready yet on first focus
        }
    }, [db]);

    useFocusEffect(
        React.useCallback(() => {
            loadDayState();
        }, [loadDayState])
    );

    const isDark = theme === 'dark';
    const surface = isDark ? '#0e0e12' : '#ffffff';
    const text = isDark ? '#ffffff' : '#111111';
    const muted = isDark ? '#9aa0a6' : '#6b7280';

    const morningState: PeriodState =
        morningDone ? 'done' : morningStarted ? 'in_progress' : 'not_started';
    const eveningState: PeriodState =
        eveningDone ? 'done' : eveningStarted ? 'in_progress' : 'not_started';

    return (
        <SafeAreaProvider>
            <View style={{ flex: 1, backgroundColor: surface }}>
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{
                        paddingHorizontal: 20,
                        paddingTop: insets.top + 16,
                        paddingBottom: 24 + insets.bottom,
                    }}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={{ marginBottom: 28 }}>
                        <ThemedText style={{ fontSize: 14, color: muted, marginBottom: 6, fontWeight: '500' }}>
                            Assalamu alaikum
                        </ThemedText>
                        <ThemedText style={{ fontSize: 32, fontWeight: '700', color: text, letterSpacing: -0.5 }}>
                            {name}
                        </ThemedText>
                    </View>

                    <AdkarTile
                        period="morning"
                        state={morningState}
                        startsAt={morningHM}
                        onPress={() => router.push('/morning-adkar')}
                    />
                    <AdkarTile
                        period="evening"
                        state={eveningState}
                        startsAt={eveningHM}
                        onPress={() => router.push('/evening-adkar')}
                    />
                </ScrollView>
            </View>
        </SafeAreaProvider>
    );
};

export default PwaHome;
