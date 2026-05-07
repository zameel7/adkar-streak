import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export type PermissionStatus = "granted" | "denied" | "undetermined";

interface TimeObject {
    hour: number;
    minute: number;
}

const parseTime = (
    timeString: string | null,
    defaultHour: number,
    defaultMinute: number
): TimeObject => {
    if (timeString) {
        const date = new Date(timeString);
        return { hour: date.getHours(), minute: date.getMinutes() };
    }
    return { hour: defaultHour, minute: defaultMinute };
};

export async function schedulePushNotification(): Promise<void> {
    try {
        await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
        console.error("Error cancelling scheduled notifications:", error);
    }

    const morningTime = await AsyncStorage.getItem("morningTime");
    const eveningTime = await AsyncStorage.getItem("eveningTime");

    const scheduleNotification = async (
        title: string,
        body: string,
        time: string | null,
        defaultHour: number,
        defaultMinute: number
    ): Promise<void> => {
        const { hour, minute } = parseTime(time, defaultHour, defaultMinute);

        await Notifications.scheduleNotificationAsync({
            content: { title, body },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                hour,
                minute,
            } as any,
        });
    };

    await scheduleNotification(
        "Time for morning Adkar! 🌞",
        "Jābir (raḍiy Allāhu ʿanhū) relates that after Allah’s Messenger ﷺ would perform Fajr, he used to remain seated in his place of prayer until the sun had fully risen (Muslim).",
        morningTime,
        5,
        30
    );

    await scheduleNotification(
        "Time for evening Adkar!",
        "'Believers, remember Allah often and glorify Him morning and evening' (33:41-42).",
        eveningTime,
        16,
        30
    );
}

export async function registerForPushNotificationsAsync(): Promise<PermissionStatus> {
    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#FF231F7C",
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } =
            await Notifications.getPermissionsAsync();
        let finalStatus: PermissionStatus = existingStatus;
        if (existingStatus !== "granted") {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        return finalStatus;
    }

    alert("Must use physical device for Push Notifications");
    return "denied";
}
