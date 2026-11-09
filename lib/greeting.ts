import HijriNow from "hijri-now";

const HIJRI_MONTHS = [
    "Muharram",
    "Safar",
    "Rabi al-Awwal",
    "Rabi al-Thani",
    "Jumada al-Ula",
    "Jumada al-Akhirah",
    "Rajab",
    "Sha'ban",
    "Ramadan",
    "Shawwal",
    "Dhu al-Qadah",
    "Dhu al-Hijjah",
];

/** e.g. "29 Jumada al-Ula 1448 AH". Empty string if the library misbehaves. */
export function hijriDateLabel(): string {
    try {
        const month = HIJRI_MONTHS[HijriNow.month() - 1];
        if (!month) return "";
        return `${String(HijriNow.day()).trim()} ${month} ${String(HijriNow.year()).trim()} AH`;
    } catch {
        return "";
    }
}

/** Time-aware fallback title when the user hasn't set a display name. */
export function timeOfDayGreeting(date: Date = new Date()): string {
    const h = date.getHours();
    if (h >= 4 && h < 12) return "Good morning";
    if (h >= 12 && h < 17) return "Good afternoon";
    if (h >= 17 && h < 21) return "Good evening";
    return "Peaceful night";
}
