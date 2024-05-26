import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, Alert, useColorScheme } from "react-native";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import { Button, Input } from "@rneui/themed";
import LinearGradient from "react-native-linear-gradient";

const Settings = () => {
    const [name, setName] = useState<string>("");

    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === "dark";

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

    const dynamicStyles = StyleSheet.create({
        inputContainer: {
            width: "100%",
        },
        input: {
            paddingHorizontal: 10,
            borderColor: "#ccc",
            borderWidth: 1,
            borderRadius: 5,
            color: isDarkMode ? "#ffffff" : "#000000",
        },
        button: {
            backgroundColor: isDarkMode ? "#841584" : "#6200ea",
        },
    });
    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
            headerImage={
                <Ionicons
                    size={310}
                    name="code-slash"
                    style={styles.headerImage}
                />
            }
            showTime={false}
            setRefreshingAPI={() => {}}
        >
            <ThemedView style={styles.titleContainer}>
                <ThemedText type="title">Settings</ThemedText>
            </ThemedView>
            <ThemedText>What should we call you?</ThemedText>
            <Input
                placeholder="Your name"
                placeholderTextColor={isDarkMode ? "#888" : "#ccc"}
                onChangeText={(name) => setName(name)}
                containerStyle={dynamicStyles.inputContainer}
                inputStyle={dynamicStyles.input}
            />
            <Button
                ViewComponent={LinearGradient}
                linearGradientProps={{
                    colors: ["#FF9800", "#F44336"],
                    start: { x: 0, y: 0.5 },
                    end: { x: 1, y: 0.5 },
                }}
                title="Submit"
                onPress={handleSubmit}
                buttonStyle={dynamicStyles.button}
            />
        </ParallaxScrollView>
    );
};

const styles = StyleSheet.create({
    headerImage: {
        color: "#808080",
        bottom: -90,
        left: -35,
        position: "absolute",
    },
    titleContainer: {
        flexDirection: "row",
        gap: 8,
    },
});

export default Settings;
