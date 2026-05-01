import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/context/AuthContext";
import ThemeContext from "@/context/ThemeContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { Alert, ScrollView, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Profile = () => {
  const [name, setName] = useState<string>("");
  const { theme } = useContext(ThemeContext);
  const { signOut, user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleSubmitName = async () => {
    if (!name.trim()) {
      Alert.alert("Please enter your name");
      return;
    }
    try {
      await AsyncStorage.setItem("name", name.trim());
      Alert.alert("Saved", "Your name has been updated.");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out? Your local data stays on this device.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            await signOut?.();
          },
        },
      ]
    );
  };

  useEffect(() => {
    (async () => {
      try {
        const storedName = await AsyncStorage.getItem("name");
        if (storedName) setName(storedName);
      } catch (error) {
        console.error("Error fetching name:", error);
      }
    })();
  }, []);

  const cardStyle = {
    marginBottom: 24,
    backgroundColor: theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.2)" : "#e0e0e0",
  } as const;

  const titleColor = theme === "dark" ? "#ffffff" : "#333";
  const subtleColor = theme === "dark" ? "rgba(255, 255, 255, 0.7)" : "#666";

  return (
    <LinearGradient
      colors={theme === "dark" ? ["#1a1a2e", "#16213e"] : ["#ffffff", "#f8f9fa"]}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
          paddingTop: insets.top + 20,
          paddingBottom: 100 + insets.bottom,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={{
            ...cardStyle,
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          <Ionicons name="person-circle" size={48} color="#2196F3" style={{ marginBottom: 8 }} />
          <ThemedText style={{ fontSize: 26, fontWeight: "bold", color: titleColor }}>
            Profile
          </ThemedText>
          {user?.email && (
            <ThemedText style={{ fontSize: 14, color: subtleColor, marginTop: 4 }}>
              {user.email}
            </ThemedText>
          )}
        </View>

        {/* Display name */}
        <View style={cardStyle}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
            <Ionicons name="person" size={22} color="#2196F3" style={{ marginRight: 10 }} />
            <ThemedText style={{ fontSize: 18, fontWeight: "bold", color: titleColor }}>
              Display Name
            </ThemedText>
          </View>
          <ThemedText style={{ fontSize: 14, color: subtleColor, marginBottom: 8 }}>
            What should we call you?
          </ThemedText>
          <TextInput
            style={{
              backgroundColor: theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.9)",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme === "dark" ? "rgba(255, 255, 255, 0.2)" : "#e0e0e0",
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontSize: 16,
              color: theme === "dark" ? "#ffffff" : "#333",
              marginBottom: 12,
            }}
            placeholder={name || "Your Name"}
            placeholderTextColor={theme === "dark" ? "rgba(255, 255, 255, 0.6)" : "#999"}
            value={name}
            onChangeText={setName}
          />
          <TouchableOpacity
            onPress={handleSubmitName}
            style={{
              backgroundColor: "#2196F3",
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: "center",
            }}
          >
            <ThemedText style={{ color: "#ffffff", fontSize: 16, fontWeight: "bold" }}>
              Save
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Cloud Sync */}
        <View style={cardStyle}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
            <Ionicons name="cloud-outline" size={22} color="#2196F3" style={{ marginRight: 10 }} />
            <ThemedText style={{ fontSize: 18, fontWeight: "bold", color: titleColor }}>
              Cloud Sync
            </ThemedText>
          </View>

          {user ? (
            <>
              <View
                style={{
                  backgroundColor: theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.03)",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 16,
                }}
              >
                <ThemedText style={{ fontSize: 13, color: subtleColor, marginBottom: 4 }}>
                  Signed in as
                </ThemedText>
                <ThemedText style={{ fontSize: 16, fontWeight: "600", color: titleColor }}>
                  {user.email || "No email found"}
                </ThemedText>
                <ThemedText style={{ fontSize: 13, color: subtleColor, marginTop: 6 }}>
                  Syncing your streak across your devices.
                </ThemedText>
              </View>
              <TouchableOpacity
                onPress={handleLogout}
                style={{
                  backgroundColor: "#f44336",
                  borderRadius: 12,
                  paddingVertical: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="log-out-outline" size={20} color="#ffffff" style={{ marginRight: 8 }} />
                <ThemedText style={{ color: "#ffffff", fontSize: 16, fontWeight: "bold" }}>
                  Sign Out
                </ThemedText>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <ThemedText
                style={{
                  fontSize: 14,
                  color: subtleColor,
                  marginBottom: 16,
                  lineHeight: 20,
                }}
              >
                Sign in to back up your streak and sync it across your devices. The app works
                fully offline without an account.
              </ThemedText>
              <TouchableOpacity
                onPress={() => router.push("/auth")}
                style={{
                  backgroundColor: "#2196F3",
                  borderRadius: 12,
                  paddingVertical: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="log-in-outline" size={20} color="#ffffff" style={{ marginRight: 8 }} />
                <ThemedText style={{ color: "#ffffff", fontSize: 16, fontWeight: "bold" }}>
                  Sign in to sync
                </ThemedText>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default Profile;
