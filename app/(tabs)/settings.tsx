import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, Alert, Switch, Share, View, Platform } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import ThemeContext from "@/context/ThemeContext";
import { Colors } from "@/constants/Colors";

const Settings = () => {
    const [name, setName] = useState<string>("");
    const [translation, setTranslation] = useState<boolean>(true);
    const [morningTime, setMorningTime] = useState<Date>(new Date());
    const [eveningTime, setEveningTime] = useState<Date>(new Date());
    const [showMorningPicker, setShowMorningPicker] = useState<boolean>(false);
    const [showEveningPicker, setShowEveningPicker] = useState<boolean>(false);
    const { theme, toggleTheme } = useContext(ThemeContext);
    const router = useRouter();

    const colors = Colors[theme as keyof typeof Colors];

    const storeData = async (key: string, value: string) => {
        try {
            await AsyncStorage.setItem(key, value);
        } catch (e: any) {
            Alert.alert("Error", e.message);
        }
    };

    const handleSubmitName = async () => {
        await storeData("name", name);
        Alert.alert("Success", "Name has been saved! Pull down to refresh.");
        router.push("/home");
    };

    const handleSubmitTime = async () => {
        await storeData("morningTime", morningTime.toISOString());
        await storeData("eveningTime", eveningTime.toISOString());
        Alert.alert(
            "Success",
            "Notification time has been saved! Pull down to refresh."
        );
        router.push("/home");
    };

    const handleToggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        toggleTheme(newTheme);
    };

    const onShare = () => {
        Share.share({
            message:
                "Check out this awesome app! \nhttps://play.google.com/store/apps/details?id=com.zameel7.adkarstreak",
        });
    };

    const dynamicStyles = StyleSheet.create({
        input: {
            marginTop: 20,
        },
        headerImage: {
            color: "#808080",
            bottom: 0,
            left: 10,
            position: "absolute",
        },
        titleContainer: {
            flexDirection: "row",
            gap: 8,
        },
        switchContainer: {
            flexDirection: "row",
            marginTop: 20,
            justifyContent: "space-between",
        },
        switch: {
            marginHorizontal: 10,
        },
        text: {
            marginTop: 30,
            fontSize: 20,
            color: colors.text,
            fontWeight: "bold",
        },
        icon: {
            color: colors.text,
        },
        pickerContainer: {
            marginTop: 20,
            paddingHorizontal: 20,
        },
        timePicker: {
            marginBottom: 15,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
        },
    });

    useEffect(() => {
        const getDetails = async () => {
            try {
                const storedName = await AsyncStorage.getItem('name');
                if (storedName) setName(storedName);

                const translations = await AsyncStorage.getItem('translations');
                if (translations) setTranslation(JSON.parse(translations));

                const storedMorningTime = await AsyncStorage.getItem('morningTime');
                if (storedMorningTime) {
                    setMorningTime(new Date(storedMorningTime));
                } else {
                    const defaultMorningTime = new Date();
                    defaultMorningTime.setHours(5, 30, 0, 0);
                    setMorningTime(defaultMorningTime);
                }

                const storedEveningTime = await AsyncStorage.getItem('eveningTime');
                if (storedEveningTime) {
                    setEveningTime(new Date(storedEveningTime));
                } else {
                    const defaultEveningTime = new Date();
                    defaultEveningTime.setHours(16, 30, 0, 0);
                    setEveningTime(defaultEveningTime);
                }
            } catch (error) {
                console.error('Error fetching details from AsyncStorage:', error);
            }
        };
        getDetails();
    }, []);

    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
            headerImage={
                <Ionicons
                    size={200}
                    name="code-slash"
                    style={dynamicStyles.headerImage}
                />
            }
            showTime={false}
            setRefreshingAPI={() => {}}
        >
            <ThemedView style={dynamicStyles.titleContainer}>
                <ThemedText type="title">Settings</ThemedText>
            </ThemedView>
            <ThemedText style={dynamicStyles.text}>
                What should we call you?
            </ThemedText>
            <Input
                placeholder={name || "Your Name"}
                placeholderTextColor={colors.placeholder}
                onChangeText={(name) => setName(name)}
                inputStyle={dynamicStyles.input}
            />
            <Button
                ViewComponent={LinearGradient}
                linearGradientProps={{
                    colors: [colors.primary, colors.secondary],
                    start: { x: 0, y: 0.5 },
                    end: { x: 1, y: 0.5 },
                }}
                title="Save"
                onPress={handleSubmitName}
            />
            <ThemedText style={dynamicStyles.text}>Appearance</ThemedText>
            <ThemedView style={dynamicStyles.switchContainer}>
                <ThemedText style={dynamicStyles.icon}>Theme: </ThemedText>
                <ThemedView style={{ flexDirection: "row" }}>
                    <Ionicons
                        name="sunny"
                        size={24}
                        style={dynamicStyles.icon}
                    />
                    <Switch
                        value={theme === "dark"}
                        onValueChange={handleToggleTheme}
                        style={dynamicStyles.switch}
                        trackColor={{
                            false: colors.border,
                            true: colors.border,
                        }}
                        thumbColor={colors.tabIconSelected}
                    />
                    <Ionicons
                        name="moon"
                        size={24}
                        style={dynamicStyles.icon}
                    />
                </ThemedView>
            </ThemedView>
            <ThemedView style={dynamicStyles.switchContainer}>
                <ThemedText style={dynamicStyles.icon}>
                    Translation:{" "}
                </ThemedText>
                <ThemedView style={{ flexDirection: "row" }}>
                    <Ionicons
                        name="close-outline"
                        size={24}
                        style={dynamicStyles.icon}
                    />
                    <Switch
                        value={translation}
                        onValueChange={() => {
                            AsyncStorage.setItem(
                                "translations",
                                JSON.stringify(!translation)
                            );
                            setTranslation(!translation);
                        }}
                        style={dynamicStyles.switch}
                        trackColor={{
                            false: colors.border,
                            true: colors.border,
                        }}
                        thumbColor={colors.tabIconSelected}
                    />
                    <Ionicons
                        name="checkmark-outline"
                        size={24}
                        style={dynamicStyles.icon}
                    />
                </ThemedView>
            </ThemedView>
            <ThemedText style={dynamicStyles.text}>
                Notification Time
            </ThemedText>
            <ThemedView style={dynamicStyles.pickerContainer}>
                <ThemedView style={dynamicStyles.timePicker}>
                    <ThemedText style={dynamicStyles.icon}>
                        Morning:{" "}
                    </ThemedText>
                    <Button
                        title={morningTime.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                        onPress={() => setShowMorningPicker(true)}
                        buttonStyle={{
                            backgroundColor: colors.background,
                        }}
                        titleStyle={{ color: colors.text }}
                    />
                    {showMorningPicker && (
                        <DateTimePicker
                            value={morningTime}
                            mode="time"
                            is24Hour={true}
                            display="default"
                            onChange={(event, selectedDate) => {
                                setShowMorningPicker(false);
                                if (selectedDate) setMorningTime(selectedDate);
                            }}
                        />
                    )}
                </ThemedView>
                <ThemedView style={dynamicStyles.timePicker}>
                    <ThemedText style={dynamicStyles.icon}>
                        Evening:{" "}
                    </ThemedText>
                    <Button
                        title={eveningTime.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                        onPress={() => setShowEveningPicker(true)}
                        buttonStyle={{
                            backgroundColor: colors.background,
                        }}
                        titleStyle={{ color: colors.text }}
                    />
                    {showEveningPicker && (
                        <DateTimePicker
                            value={eveningTime}
                            mode="time"
                            is24Hour={true}
                            display="default"
                            onChange={(event, selectedDate) => {
                                setShowEveningPicker(false);
                                if (selectedDate) setEveningTime(selectedDate);
                            }}
                        />
                    )}
                </ThemedView>
                <Button
                    ViewComponent={LinearGradient}
                    linearGradientProps={{
                        colors: [colors.primary, colors.secondary],
                        start: { x: 0, y: 0.5 },
                        end: { x: 1, y: 0.5 },
                    }}
                    title="Save"
                    onPress={handleSubmitTime}
                />
            </ThemedView>
            <Button
                title="Share App"
                onPress={onShare}
                buttonStyle={{
                    marginTop: 20,
                    width: "50%",
                    alignSelf: "center",
                    backgroundColor: colors.background,
                }}
                titleStyle={{ color: colors.icon, fontWeight: "bold" }}
                icon={
                    <Ionicons
                        name="share-social"
                        size={24}
                        style={{ marginRight: 10, color: colors.icon }}
                    />
                }
            />
        </ParallaxScrollView>
    );
};

export default Settings;
