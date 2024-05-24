import { SafeAreaProvider } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Linking, StyleSheet, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Button } from "@rneui/themed";
import LinearGradient from "react-native-linear-gradient";
import { router } from "expo-router";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { HelloWave } from "@/components/HelloWave";

const Home = () => {
    const [name, setName] = useState("Hero" as string);

    useEffect(() => {
        AsyncStorage.getItem("name").then((name) => {
            if (name) {
                setName(name);
            }
        });
    }, []);

    function getDayNightIcon() {
        const hours = new Date().getHours();
        return hours >= 6 && hours < 16
            ? hours >= 8
                ? "sunny"
                : "partly-sunny"
            : "moon";
    }

    function adkarTime() {
        const hours = new Date().getHours();
        return hours >= 5 && hours < 7 ? "morning" : hours >= 4 && hours < 7 ? "evening" : "night";
    }

    return (
        <SafeAreaProvider>
            <ParallaxScrollView
                headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
                headerImage={
                    <Ionicons
                        size={200}
                        name={getDayNightIcon()}
                        style={styles.dayNightIcon}
                    />
                }
            >
                <ThemedView style={styles.titleContainer}>
                    <ThemedText type="title">Hey there {name}! <HelloWave /></ThemedText>
                    {(adkarTime() === "morning" || adkarTime() === "evening") && (
                        <ThemedText type="subtitle">
                            It's time for your{" "}
                            {getDayNightIcon() === "partly-sunny"
                                ? "morning"
                                : "evening"}{" "}
                            adkar!
                        </ThemedText>
                    )}
                </ThemedView>
                <View style={styles.buttonContainer}>
                    <Button
                        ViewComponent={LinearGradient}
                        linearGradientProps={{
                            colors: ["#FF9800", "#F44336"],
                            start: { x: 0, y: 0.5 },
                            end: { x: 1, y: 0.5 },
                        }}
                        buttonStyle={styles.button}
                        onPress={() => {
                            router.push("/morning-adkar");
                        }}
                    >
                        Morning Adkar
                    </Button>
                    <Button
                        ViewComponent={LinearGradient}
                        linearGradientProps={{
                            colors: ["#FF9800", "#F44336"],
                            start: { x: 0, y: 0.5 },
                            end: { x: 1, y: 0.5 },
                        }}
                        buttonStyle={styles.button}
                        onPress={() => {
                            router.push("/evening-adkar");
                        }}
                    >
                        Evening Adkar
                    </Button>
                </View>
                <View style={styles.footer}>
                    <View
                        style={{
                            borderBottomColor: "#808080",
                            borderBottomWidth: 1,
                            width: "100%",
                            marginVertical: 16,
                        }}
                    />
                    <ThemedText type="default">
                        "Remember Allah in times of ease and He will remember
                        you in times of difficulty."
                    </ThemedText>
                    <ThemedText
                        type="default"
                        style={{
                            color: "#808080",
                        }}
                    >
                        - Prophet Muhammed ﷺ
                    </ThemedText>
                    {/* add a horizontal line */}
                    <View
                        style={{
                            borderBottomColor: "#808080",
                            borderBottomWidth: 1,
                            width: "100%",
                            marginVertical: 16,
                        }}
                    />
                </View>
            </ParallaxScrollView>
        </SafeAreaProvider>
    );
};

const styles = StyleSheet.create({
    headerImage: {
        color: "#808080",
        bottom: -90,
        left: -35,
        position: "absolute",
    },
    dayNightIcon: {
        color: "#808080",
        bottom: 0,
        left: 10,
        position: "absolute",
    },
    titleContainer: {
        flexDirection: "column",
        alignItems: "center",
        padding: 16,
        marginVertical: 24,
    },
    buttonContainer: {
        flexDirection: "column",
        paddingHorizontal: 16,
        marginTop: 24,
    },
    button: {
        marginVertical: 10,
        borderRadius: 8,
    },
    footer: {
        flex: 1,
        alignItems: "center",
        marginTop: 24,
    },
});

export default Home;
