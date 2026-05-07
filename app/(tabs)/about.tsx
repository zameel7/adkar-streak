import { ThemedText } from "@/components/ThemedText";
import ThemeContext from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import * as Application from "expo-application";
import React, { useContext } from "react";
import { Image, Linking, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";

const About = () => {
  const { theme } = useContext(ThemeContext);
  const appVersion = Application.nativeApplicationVersion || "3.0.1";
  const insets = useSafeAreaInsets();

  const handleGitHub = () => {
    Linking.openURL("https://github.com/zameel7/adkar-streak");
  };

  const isDark = theme === 'dark';
  const surface = isDark ? '#0e0e12' : '#ffffff';
  const text = isDark ? '#ffffff' : '#111111';
  const muted = isDark ? '#9aa0a6' : '#6b7280';
  const subtle = isDark ? '#1a1a20' : '#f4f4f7';
  const hairline = isDark ? '#26262d' : '#ececef';
  const accent = '#2196F3';

  return (
    <SafeAreaProvider>
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
            About
          </ThemedText>

          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <View style={{
              width: 88,
              height: 88,
              borderRadius: 22,
              backgroundColor: subtle,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 14,
              overflow: 'hidden',
            }}>
              <Image
                source={require('@/assets/images/adaptive-icon.png')}
                style={{ width: 88, height: 88 }}
                resizeMode="contain"
              />
            </View>
            <ThemedText style={{ fontSize: 22, fontWeight: '700', color: text }}>
              Adkar Champ
            </ThemedText>
            <ThemedText style={{ fontSize: 13, color: muted, marginTop: 4 }}>
              Version {appVersion}
            </ThemedText>
          </View>

          <ThemedText style={{ fontSize: 17, lineHeight: 26, color: text, fontWeight: '500', marginBottom: 14 }}>
            A simple companion to help you remember Allah and stay consistent with your daily adkar.
          </ThemedText>
          <ThemedText style={{ fontSize: 15, lineHeight: 24, color: muted, marginBottom: 28 }}>
            Streaks keep you motivated. Notifications keep you on track. Everything works offline.
          </ThemedText>

          <View style={{
            backgroundColor: accent + '14',
            borderRadius: 18,
            paddingVertical: 22,
            paddingHorizontal: 24,
            marginBottom: 32,
            alignItems: 'center',
          }}>
            <Ionicons name="heart" size={22} color={accent} style={{ marginBottom: 8 }} />
            <ThemedText style={{ fontSize: 18, fontWeight: '700', color: accent, letterSpacing: 0.2 }}>
              Jazakallah Khair
            </ThemedText>
          </View>

          <SectionLabel muted={muted}>Connect</SectionLabel>
          <Row
            icon="logo-github"
            label="View on GitHub"
            textColor={text}
            accent={accent}
            hairline={hairline}
            onPress={handleGitHub}
            trailing={<Ionicons name="open-outline" size={18} color={muted} />}
          />

          <SectionLabel muted={muted} top>Legal</SectionLabel>
          <Row
            icon="shield-checkmark"
            label="Privacy Policy"
            textColor={text}
            accent={accent}
            hairline={hairline}
            onPress={() => {}}
            trailing={<Ionicons name="chevron-forward" size={18} color={muted} />}
          />
        </ScrollView>
      </View>
    </SafeAreaProvider>
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

type RowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  textColor: string;
  accent: string;
  hairline: string;
  trailing?: React.ReactNode;
  onPress?: () => void;
};
const Row: React.FC<RowProps> = ({ icon, label, textColor, accent, hairline, trailing, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.6}
    style={{
      paddingVertical: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: hairline,
    }}
  >
    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
      <View style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: accent + '1F',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
      }}>
        <Ionicons name={icon} size={18} color={accent} />
      </View>
      <ThemedText style={{ fontSize: 16, color: textColor, fontWeight: '500' }}>
        {label}
      </ThemedText>
    </View>
    {trailing}
  </TouchableOpacity>
);

export default About;