import React, { useContext, useEffect, useState } from "react";
import { Alert, ActivityIndicator, View, TouchableOpacity, TextInput, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
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
            router.push("/(tabs)/home");
        } else {
            Alert.alert("Please enter your name");
        }
    };

    useEffect(() => {
        const checkName = async () => {
            const existingName = await AsyncStorage.getItem("name");
            if (existingName) {
                router.push("/(tabs)/home");
            } else {
                setLoading(false);
            }
        };
        checkName();
    }, []);

    if (loading) {
        return (
            <LinearGradient
                colors={theme === 'dark' ? ['#1a1a2e', '#16213e'] : ['#ffffff', '#f8f9fa']}
                style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
            >
                <View style={{
                    backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
                    borderRadius: 20,
                    padding: 20,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#e0e0e0'
                }}>
                    <ActivityIndicator size="large" color="#2196F3" />
                    <ThemedText style={{
                        marginTop: 16,
                        textAlign: 'center',
                        color: theme === 'dark' ? '#ffffff' : '#333'
                    }}>
                        Loading...
                    </ThemedText>
                </View>
            </LinearGradient>
        );
    }

    return (
        <SafeAreaProvider>
            <LinearGradient
                colors={theme === 'dark' ? ['#1a1a2e', '#16213e'] : ['#ffffff', '#f8f9fa']}
                style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}
            >
                <View style={{
                    width: '100%',
                    maxWidth: 400,
                    backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
                    borderRadius: 20,
                    padding: 24,
                    borderWidth: 1,
                    borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#e0e0e0'
                }}>
                    <View style={{ alignItems: 'center', marginBottom: 48 }}>
                        <Image
                            source={require('@/assets/images/icon.png')}
                            style={{ width: 100, height: 100, marginBottom: 20 }}
                            resizeMode="contain"
                        />
                        <ThemedText style={{
                            fontSize: 32,
                            fontWeight: 'bold',
                            textAlign: 'center',
                            color: theme === 'dark' ? '#ffffff' : '#333'
                        }}>
                            Adkar Champ
                        </ThemedText>
                        <ThemedText style={{
                            fontSize: 16,
                            textAlign: 'center',
                            marginTop: 8,
                            color: theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : '#666',
                            opacity: 0.8
                        }}>
                            Your Daily Spiritual Companion
                        </ThemedText>
                    </View>

                    <ThemedText style={{
                        fontSize: 20,
                        textAlign: 'center',
                        marginBottom: 32,
                        color: theme === 'dark' ? '#ffffff' : '#333',
                        fontWeight: '500'
                    }}>
                        What's your name?
                    </ThemedText>

                    <TextInput
                        placeholder="Enter your name"
                        placeholderTextColor={theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : '#999'}
                        value={name}
                        onChangeText={setName}
                        style={{
                            backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
                            borderRadius: 16,
                            borderWidth: 1,
                            borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#e0e0e0',
                            paddingHorizontal: 20,
                            paddingVertical: 16,
                            fontSize: 16,
                            color: theme === 'dark' ? '#ffffff' : '#333',
                            marginBottom: 24
                        }}
                    />

                    <TouchableOpacity
                        onPress={handleSubmit}
                        style={{
                            backgroundColor: '#2196F3',
                            borderRadius: 16,
                            paddingVertical: 18,
                            alignItems: 'center',
                            shadowColor: '#2196F3',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 8,
                            elevation: 4
                        }}
                    >
                        <ThemedText style={{
                            color: '#ffffff',
                            fontSize: 18,
                            fontWeight: 'bold'
                        }}>
                            Let's Begin
                        </ThemedText>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </SafeAreaProvider>
    );
};

export default Index;