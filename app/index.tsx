import React, { useContext, useEffect, useState } from "react";
import { Alert, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { GlassCard, GlassInput, GlassButton, GlassText } from "@/components/glass";
import ThemeContext from "@/context/ThemeContext";

const Index: React.FC = () => {
    const [name, setName] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const { theme } = useContext(ThemeContext);

    const storeData = async (value: string) => {
        try {
            await AsyncStorage.setItem("name", value);
        } catch (e: any) {
            Alert.alert("Error", e.message);
        }
    };

    const handleSubmit = async () => {
        if (name.trim()) {
            await storeData(name.trim());
            router.push("/home");
        } else {
            Alert.alert("Please enter your name");
        }
    };

    useEffect(() => {
        const checkName = async () => {
            const existingName = await AsyncStorage.getItem("name");
            if (existingName) {
                router.push("/home");
            } else {
                setLoading(false);
            }
        };
        checkName();
    }, []);

    if (loading) {
        return (
            <LinearGradient
                colors={theme === 'dark' ? ['#1a1a2e', '#16213e'] : ['#667eea', '#764ba2']}
                style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
            >
                <GlassCard intensity={20} glassStyle="medium">
                    <ActivityIndicator size="large" color="#ffffff" />
                    <GlassText color="white" className="mt-4 text-center">
                        Loading...
                    </GlassText>
                </GlassCard>
            </LinearGradient>
        );
    }

    return (
        <SafeAreaProvider>
            <LinearGradient
                colors={theme === 'dark' ? ['#1a1a2e', '#16213e'] : ['#667eea', '#764ba2']}
                style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}
            >
                <GlassCard
                    intensity={20}
                    glassStyle="medium"
                    padding="large"
                    className="w-full max-w-sm"
                >
                    <GlassText
                        variant="title"
                        color="white"
                        className="text-center mb-4"
                    >
                        Welcome to Adkar Champ! 🤲
                    </GlassText>

                    <GlassText
                        variant="subtitle"
                        color="white"
                        className="text-center mb-8 opacity-90"
                    >
                        What's your name?
                    </GlassText>

                    <GlassInput
                        placeholder="Enter your name"
                        value={name}
                        onChangeText={setName}
                        intensity={15}
                        glassStyle="light"
                        className="mb-6"
                    />

                    <GlassButton
                        title="Let's Begin"
                        onPress={handleSubmit}
                        variant="primary"
                        size="large"
                        glassIntensity={15}
                    />
                </GlassCard>
            </LinearGradient>
        </SafeAreaProvider>
    );
};

export default Index;