import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/context/AuthContext";
import ThemeContext from "@/context/ThemeContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
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

  const isDark = theme === 'dark';
  const surface = isDark ? '#0e0e12' : '#ffffff';
  const text = isDark ? '#ffffff' : '#111111';
  const muted = isDark ? '#9aa0a6' : '#6b7280';
  const subtle = isDark ? '#1a1a20' : '#f4f4f7';
  const hairline = isDark ? '#26262d' : '#ececef';
  const accent = '#2196F3';
  const danger = '#ef4444';

  const initial = (name || user?.email || '?').trim().charAt(0).toUpperCase();

  return (
    <View style={{ flex: 1, backgroundColor: surface }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: insets.top + 16,
          paddingBottom: 100 + insets.bottom,
        }}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText style={{ fontSize: 34, fontWeight: '700', color: text, letterSpacing: -0.5, marginBottom: 32 }}>
          Profile
        </ThemedText>

        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <View style={{
            width: 88,
            height: 88,
            borderRadius: 44,
            backgroundColor: accent + '1F',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 14,
          }}>
            <ThemedText style={{ fontSize: 36, fontWeight: '700', color: accent }}>
              {initial}
            </ThemedText>
          </View>
          {!!name && (
            <ThemedText style={{ fontSize: 22, fontWeight: '600', color: text, marginBottom: 4 }}>
              {name}
            </ThemedText>
          )}
          {user?.email && (
            <ThemedText style={{ fontSize: 14, color: muted }}>
              {user.email}
            </ThemedText>
          )}
        </View>

        <SectionLabel muted={muted}>Display Name</SectionLabel>
        <TextInput
          style={{
            backgroundColor: subtle,
            borderRadius: 14,
            paddingHorizontal: 16,
            paddingVertical: 14,
            fontSize: 16,
            color: text,
            marginBottom: 12,
          }}
          placeholder="Your name"
          placeholderTextColor={muted}
          value={name}
          onChangeText={setName}
        />
        <TouchableOpacity
          onPress={handleSubmitName}
          activeOpacity={0.85}
          style={{
            backgroundColor: accent,
            borderRadius: 14,
            paddingVertical: 15,
            alignItems: 'center',
          }}
        >
          <ThemedText style={{ color: '#ffffff', fontSize: 15, fontWeight: '700', letterSpacing: 0.2 }}>
            Save
          </ThemedText>
        </TouchableOpacity>

        <SectionLabel muted={muted} top>Cloud Sync</SectionLabel>
        {user ? (
          <>
            <View style={{
              backgroundColor: subtle,
              borderRadius: 16,
              padding: 18,
              marginBottom: 14,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e', marginRight: 8 }} />
                <ThemedText style={{ fontSize: 12, color: muted, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  Synced
                </ThemedText>
              </View>
              <ThemedText style={{ fontSize: 16, color: text, fontWeight: '500' }}>
                {user.email || 'Signed in'}
              </ThemedText>
              <ThemedText style={{ fontSize: 13, color: muted, marginTop: 6, lineHeight: 18 }}>
                Your streak is backed up and synced across devices.
              </ThemedText>
            </View>
            <TouchableOpacity
              onPress={handleLogout}
              activeOpacity={0.85}
              style={{
                backgroundColor: 'transparent',
                borderRadius: 14,
                paddingVertical: 14,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: danger,
              }}
            >
              <Ionicons name="log-out-outline" size={18} color={danger} style={{ marginRight: 8 }} />
              <ThemedText style={{ color: danger, fontSize: 15, fontWeight: '700' }}>
                Sign Out
              </ThemedText>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <ThemedText style={{ fontSize: 14, color: muted, marginBottom: 14, lineHeight: 21 }}>
              Sign in to back up your streak and sync across devices. The app works fully offline without an account.
            </ThemedText>
            <TouchableOpacity
              onPress={() => router.push('/auth')}
              activeOpacity={0.85}
              style={{
                backgroundColor: accent,
                borderRadius: 14,
                paddingVertical: 15,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="log-in-outline" size={18} color="#ffffff" style={{ marginRight: 8 }} />
              <ThemedText style={{ color: '#ffffff', fontSize: 15, fontWeight: '700', letterSpacing: 0.2 }}>
                Sign in to sync
              </ThemedText>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
};

type SectionLabelProps = { children: React.ReactNode; muted: string; top?: boolean };
const SectionLabel: React.FC<SectionLabelProps> = ({ children, muted, top }) => (
  <ThemedText style={{
    fontSize: 12,
    color: muted,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: top ? 32 : 0,
    marginBottom: 8,
  }}>
    {children}
  </ThemedText>
);

export default Profile;
