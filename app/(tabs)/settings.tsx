import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, Alert, useColorScheme } from "react-native";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import { Button, Input } from "@rneui/themed";
import { Colors } from "@/constants/Colors";

const Settings = () => {
    const [name, setName] = useState<string>("");

    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? "light"];
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
    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
            headerImage={
                <Ionicons
                    size={310}
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
            <ThemedText>What should we call you?</ThemedText>
            <Input
                placeholder="Your name"
                placeholderTextColor={isDarkMode ? "#888" : "#ccc"}
                onChangeText={(name) => setName(name)}
                containerStyle={dynamicStyles.inputContainer}
                inputStyle={dynamicStyles.input}
            />
            <Button
                title="Submit"
                onPress={handleSubmit}
            />
        </ParallaxScrollView>
    );
};

export default Settings;
