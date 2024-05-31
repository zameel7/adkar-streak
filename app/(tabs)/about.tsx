// About.js
import React, { useContext } from "react";
import { Linking, StyleSheet, useColorScheme } from "react-native";
import { Button } from "@rneui/themed";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import LinearGradient from "react-native-linear-gradient";
import * as Application from "expo-application";
import { ExternalLink } from "@/components/ExternalLink";
import ThemeContext from "@/context/ThemeContext";

const About = () => {
    const {theme: colorScheme} = useContext(ThemeContext);
    const colors = Colors[colorScheme as keyof typeof Colors];
    const appVersion = Application.nativeApplicationVersion;

    const handleBuyMeACoffee = () => {
        Linking.openURL("https://www.buymeacoffee.com/zameel7");
    };

    const handleVisitWebsite = () => {
        Linking.openURL("https://zameel7.me");
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
        },
        title: {
            fontSize: 28,
            fontWeight: "bold",
            marginBottom: 20,
            color: colors.tint,
            textAlign: "center",
        },
        description: {
            fontSize: 18,
            lineHeight: 26,
            letterSpacing: 0.5,
            textAlign: "center",
            marginBottom: 20,
            color: colors.text,
            paddingHorizontal: 15,
        },
        tyText: {
            fontSize: 18,
            textAlign: "center",
            color: colors.primary,
            paddingHorizontal: 15,
        },
        headerImage: {
            color: "#808080",
            bottom: -90,
            left: -35,
            position: "absolute",
        },
        buttonContainer: {
            flexDirection: "column",
            justifyContent: "space-around",
            width: "100%",
            marginVertical: 10,
        },
        version: {
            fontSize: 16,
            color: colors.icon,
            marginTop: 20,
        },
        privacy: {
            fontSize: 16,
            color: colors.icon,
        },
    });

    return (
        <SafeAreaProvider>
            <ParallaxScrollView
                headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
                headerImage={
                    <Ionicons
                        size={310}
                        style={styles.headerImage}
                        name="person-circle-outline"
                    />
                }
                setRefreshingAPI={() => {}}
                showTime={false}
            >
                <ThemedView style={styles.container}>
                    <ThemedText style={styles.title}>About Us</ThemedText>
                    <ThemedText style={styles.description}>
                        Welcome to Adkar Champ! This app is designed to help you
                        remember Allah and keep track of your daily adkar. We
                        also have streaks to keep you motivated.
                        If you have any feedback or suggestions, please feel free
                        to contact me.
                    </ThemedText>
                    <ThemedText style={styles.description}>
                        If you like our app, please consider supporting me by
                        buying me a coffee.
                    </ThemedText>
                    <ThemedText style={styles.tyText}>
                        Jazakallah Khair!
                    </ThemedText>
                    <ThemedView style={styles.buttonContainer}>
                        <Button
                            title="Buy Me a Coffee"
                            buttonStyle={{ marginBottom: 10 }}
                            ViewComponent={LinearGradient}
                            linearGradientProps={{
                                colors: [colors.primary, colors.secondary],
                                start: { x: 0, y: 0.5 },
                                end: { x: 1, y: 0.5 },
                            }}
                            onPress={handleBuyMeACoffee}
                            icon={
                                <Ionicons
                                    name="cafe-outline"
                                    color="white"
                                    size={20}
                                    style={{ marginRight: 10 }}
                                />
                            }
                        />
                        <Button
                            title="Visit My Website"
                            ViewComponent={LinearGradient}
                            linearGradientProps={{
                                colors: [colors.primary, colors.secondary],
                                start: { x: 0, y: 0.5 },
                                end: { x: 1, y: 0.5 },
                            }}
                            onPress={handleVisitWebsite}
                            icon={
                                <Ionicons
                                    name="laptop-outline"
                                    color="white"
                                    size={20}
                                    style={{ marginRight: 10 }}
                                />
                            }
                        />
                    </ThemedView>
                    <ThemedText style={styles.version}>
                        App Version: {appVersion}
                    </ThemedText>
                    <ExternalLink
                        href="https://github.com/zameel7/adkar-streak/blob/main/PRIVACY_POLICY.md"
                        style={styles.privacy}
                    >
                        Privacy Policy
                    </ExternalLink>
                </ThemedView>
            </ParallaxScrollView>
        </SafeAreaProvider>
    );
};

export default About;
