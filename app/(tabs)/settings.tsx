import React, { useContext, useState } from "react";
import { StyleSheet, Alert, Switch } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Button, Input } from "@rneui/themed";
import LinearGradient from "react-native-linear-gradient";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import ThemeContext from "@/context/ThemeContext";
import { Colors } from "@/constants/Colors";

const Settings = () => {
    const [name, setName] = useState<string>("");
    const { theme, toggleTheme } = useContext(ThemeContext);
    const router = useRouter();

    const colors = Colors[theme as keyof typeof Colors];

    const storeData = async (value: string) => {
        try {
            await AsyncStorage.setItem("name", value);
        } catch (e: any) {
            Alert.alert("Error", e.message);
        }
    };

    const handleSubmit = async () => {
        await storeData(name);
        Alert.alert("Success", "Name has been saved! Pull down to refresh.");
        router.push("/home");
    };

    const handleToggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        toggleTheme(newTheme);
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
            alignItems: "center",
            justifyContent: "center",
            marginTop: 20,
        },
        icon: {
            color: colors.text,
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
    });

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
                placeholder="Your name"
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
                onPress={handleSubmit}
            />
            <ThemedText style={dynamicStyles.text}>
                Change Color Mode
            </ThemedText>
            <ThemedView style={dynamicStyles.switchContainer}>
                <Ionicons name="sunny" size={24} style={dynamicStyles.icon} />
                <Switch
                    value={theme === "dark"}
                    onValueChange={handleToggleTheme}
                    style={dynamicStyles.switch}
                    trackColor={{ false: colors.border, true: colors.border }}
                    thumbColor={
                        theme === "dark"
                            ? colors.tabIconDefault
                            : colors.tabIconSelected
                    }
                />
                <Ionicons name="moon" size={24} style={dynamicStyles.icon} />
            </ThemedView>
        </ParallaxScrollView>
    );
};

export default Settings;
