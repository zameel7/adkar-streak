import AsyncStorage from "@react-native-async-storage/async-storage";
import type { SQLiteDatabase } from "expo-sqlite";

import { isSupabaseConfigured, supabase } from "@/lib/supabase";

type LocalRow = { date: string; morning: number; evening: number };

let inFlight: Promise<void> | null = null;

// Account whose data the local SQLite history currently belongs to.
const OWNER_KEY = "syncOwnerUserId";

/**
 * Two-way sync of adkarStreaks with Supabase for the signed-in user.
 * Merge rule is OR: a day is complete if either side says so.
 * Concurrent calls share a single in-flight sync.
 */
export function syncStreaks(db: SQLiteDatabase): Promise<void> {
    if (!isSupabaseConfigured) return Promise.resolve();
    if (!inFlight) {
        inFlight = doSync(db).finally(() => {
            inFlight = null;
        });
    }
    return inFlight;
}

async function doSync(db: SQLiteDatabase): Promise<void> {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    if (!userId) return;

    const { data: remote, error } = await supabase
        .from("adkar_streaks")
        .select("date, morning, evening")
        .eq("user_id", userId);
    if (error) throw error;

    // If this device's history was last synced with a *different* account,
    // don't upload it into this one: replace it with this account's data.
    // (First sign-in on a device has no owner yet, so local history is adopted.)
    const owner = await AsyncStorage.getItem(OWNER_KEY);
    if (owner && owner !== userId) {
        await db.withTransactionAsync(async () => {
            await db.runAsync("DELETE FROM adkarStreaks");
            for (const r of remote ?? []) {
                await db.runAsync(
                    "INSERT INTO adkarStreaks (date, morning, evening) VALUES (?, ?, ?)",
                    [String(r.date), r.morning ? 1 : 0, r.evening ? 1 : 0]
                );
            }
        });
        // Today's in-progress ticks were the previous account's too.
        await AsyncStorage.removeItem("streakData");
        await AsyncStorage.setItem(OWNER_KEY, userId);
        return;
    }

    const local = await db.getAllAsync<LocalRow>(
        "SELECT date, morning, evening FROM adkarStreaks"
    );

    const remoteByDate = new Map(
        (remote ?? []).map((r) => [String(r.date), { morning: !!r.morning, evening: !!r.evening }])
    );
    const localByDate = new Map(
        local.map((r) => [r.date, { morning: !!r.morning, evening: !!r.evening }])
    );

    // Pull: bring remote completions into SQLite.
    for (const [date, r] of remoteByDate) {
        const l = localByDate.get(date);
        const morning = r.morning || !!l?.morning;
        const evening = r.evening || !!l?.evening;
        if (!l || morning !== l.morning || evening !== l.evening) {
            await db.runAsync(
                `INSERT INTO adkarStreaks (date, morning, evening) VALUES (?, ?, ?)
                 ON CONFLICT(date) DO UPDATE SET morning = excluded.morning, evening = excluded.evening`,
                [date, morning ? 1 : 0, evening ? 1 : 0]
            );
        }
    }

    // Push: one bulk upsert for local rows that add completions remote lacks.
    const toPush = [];
    for (const [date, l] of localByDate) {
        if (!l.morning && !l.evening) continue;
        const r = remoteByDate.get(date);
        const morning = l.morning || !!r?.morning;
        const evening = l.evening || !!r?.evening;
        if (!r || morning !== r.morning || evening !== r.evening) {
            toPush.push({ user_id: userId, date, morning, evening });
        }
    }
    if (toPush.length > 0) {
        const { error: upsertError } = await supabase
            .from("adkar_streaks")
            .upsert(toPush, { onConflict: "user_id,date" });
        if (upsertError) throw upsertError;
    }
    await AsyncStorage.setItem(OWNER_KEY, userId);
}
