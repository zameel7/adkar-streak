import AsyncStorage from "@react-native-async-storage/async-storage";
import type { SQLiteDatabase } from "expo-sqlite";

import EveningAdkar from "@/assets/adkars/evening.json";
import MorningAdkar from "@/assets/adkars/morning.json";
import { localDateString } from "@/lib/date";

export type AdkarType = "morning" | "evening";

export type DayProgress = {
    date: string;
    morning: Record<string, boolean>;
    evening: Record<string, boolean>;
};

const KEY = "streakData";

const emptyProgress = (date: string): DayProgress => ({ date, morning: {}, evening: {} });

/**
 * Read today's per-dhikr progress. Progress saved on a previous day is
 * discarded, so an app left open (or backgrounded) past midnight never
 * carries yesterday's ticks into today.
 */
export async function getTodayProgress(): Promise<DayProgress> {
    const today = localDateString();
    try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
            const parsed = JSON.parse(raw) as Partial<DayProgress>;
            if (parsed?.date === today) {
                return {
                    date: today,
                    morning: parsed.morning ?? {},
                    evening: parsed.evening ?? {},
                };
            }
        }
    } catch (error) {
        console.warn("Failed to read streakData, resetting:", error);
    }
    const fresh = emptyProgress(today);
    await AsyncStorage.setItem(KEY, JSON.stringify(fresh));
    return fresh;
}

// Read-modify-write on AsyncStorage is not atomic: two quick taps (e.g. on
// consecutive 1x items) would both read the old value and one write is lost.
// Chain all writes so they run one after another.
let writeQueue: Promise<unknown> = Promise.resolve();

export function setItemRead(type: AdkarType, index: number, read: boolean): Promise<DayProgress> {
    const run = writeQueue.then(async () => {
        const progress = await getTodayProgress();
        progress[type] = { ...progress[type], [index]: read };
        await AsyncStorage.setItem(KEY, JSON.stringify(progress));
        return progress;
    });
    writeQueue = run.catch(() => undefined);
    return run;
}

export function countRead(progress: DayProgress, type: AdkarType): number {
    return Object.values(progress[type] ?? {}).filter(Boolean).length;
}

/**
 * Persist today's completion for `type` in SQLite when every item is read.
 * Uses an upsert so it works even if today's row hasn't been created yet
 * (e.g. the adkar screen was opened straight from a notification).
 * Completion is never downgraded, matching the OR-merge used for cloud sync.
 * Returns true when the day was newly marked complete.
 */
export async function recordCompletionIfDone(
    db: SQLiteDatabase,
    type: AdkarType,
    total: number,
    progress?: DayProgress
): Promise<boolean> {
    const p = progress ?? (await getTodayProgress());
    if (total <= 0 || countRead(p, type) < total) return false;

    const column = type === "morning" ? "morning" : "evening";
    const existing = await db.getFirstAsync<{ done: number }>(
        `SELECT ${column} AS done FROM adkarStreaks WHERE date = ?`,
        [p.date]
    );
    if (existing?.done) return false;

    await db.runAsync(
        `INSERT INTO adkarStreaks (date, ${column}) VALUES (?, 1)
         ON CONFLICT(date) DO UPDATE SET ${column} = 1`,
        [p.date]
    );
    return true;
}

const TOTALS: Record<AdkarType, number> = {
    morning: Object.keys(MorningAdkar).length,
    evening: Object.keys(EveningAdkar).length,
};

/**
 * Self-heal: if today's per-item progress is complete but the SQLite write
 * was missed (app killed mid-write, DB error), record it now.
 * Returns true if anything was newly recorded.
 */
export async function reconcileToday(db: SQLiteDatabase): Promise<boolean> {
    const progress = await getTodayProgress();
    const m = await recordCompletionIfDone(db, "morning", TOTALS.morning, progress);
    const e = await recordCompletionIfDone(db, "evening", TOTALS.evening, progress);
    return m || e;
}
