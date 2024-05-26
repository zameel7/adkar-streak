import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemedView } from "@/components/ThemedView";
import { router } from "expo-router";
import { Button, Input } from "@rneui/themed";
import { useColorScheme } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import LinearGradient from "react-native-linear-gradient";

const Index: React.FC = () => {
    const [name, setName] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const colorScheme = useColorScheme();

    const storeData = async (value: string) => {
        try {
            await AsyncStorage.setItem("name", value);
        } catch (e: any) {
            Alert.alert("Error", e.message);
        }
    };

    const handleSubmit = async () => {
        await storeData(name);
        router.push("/home");
    };

    const isDarkMode = colorScheme === "dark";
    const dynamicStyles = StyleSheet.create({
        titleContainer: {
            flexDirection: "row",
            gap: 8,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
        },
        container: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 16,
        },
        subtitle: {
            marginVertical: 20,
        },
        inputContainer: {
            width: "80%",
            justifyContent: "center",
        },
        input: {
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderColor: "#ccc",
            borderWidth: 1,
            borderRadius: 5,
            color: isDarkMode ? "#ffffff" : "#000000",
        },
        button: {
            width: "80%",
            marginHorizontal: "auto",
        },
        link: {
            marginTop: 15,
            paddingVertical: 15,
        },
        linkText: {
            color: isDarkMode ? "#841584" : "#6200ea",
        },
    });

    useEffect(() => {
        const fetchName = async () => {
            const storedName = await AsyncStorage.getItem("name");
            if (storedName) {
                router.push("/home");
            }
            setLoading(false);
        };

        fetchName();
    }, []);

    if (loading) {
        return (
            <SafeAreaProvider>
                <ThemedView style={dynamicStyles.loadingContainer}>
                    <ActivityIndicator
                        size="large"
                        color={
                            colorScheme === "dark"
                                ? Colors.light.tint
                                : Colors.dark.tint
                        }
                    />
                </ThemedView>
            </SafeAreaProvider>
        );
    }

    return (
        <SafeAreaProvider>
            <ThemedView style={dynamicStyles.container}>
                <ThemedText type="title">Hey there {name}!</ThemedText>
                <ThemedText type="subtitle" style={dynamicStyles.subtitle}>
                    What's your name?
                </ThemedText>
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
                    containerStyle={dynamicStyles.inputContainer}
                />
            </ThemedView>
        </SafeAreaProvider>
    );
};

export default Index;
