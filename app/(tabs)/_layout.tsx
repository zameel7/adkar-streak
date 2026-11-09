import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import React, { useContext } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import ThemeContext from "@/context/ThemeContext";

const PILL_HEIGHT = 64;

const TabLayout = () => {
  const { theme } = useContext(ThemeContext);
  const insets = useSafeAreaInsets();
  const isDark = theme === 'dark';

  return (
    <Tabs
      // The pill already sits above the home indicator; stop the tab bar from
      // adding the bottom inset again, which pushes items off-centre.
      safeAreaInsets={{ bottom: 0 }}
      screenOptions={{
        tabBarActiveTintColor: "#2196F3",
        tabBarInactiveTintColor: isDark ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)",
        headerShown: false,
        // Floating glass pill: 90% width, detached from the screen edges.
        tabBarStyle: {
          position: 'absolute',
          left: 0,
          right: 0,
          marginHorizontal: '5%',
          bottom: insets.bottom + 12,
          height: PILL_HEIGHT,
          borderRadius: PILL_HEIGHT / 2,
          paddingTop: 0,
          paddingBottom: 0,
          borderTopWidth: 0,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(15,23,42,0.10)',
          backgroundColor: 'transparent',
          elevation: 0,
          // boxShadow works on both platforms (RN 0.76+); Android ignores shadow* props.
          boxShadow: isDark
            ? '0px 10px 30px rgba(0, 0, 0, 0.55)'
            : '0px 10px 30px rgba(15, 23, 42, 0.14)',
        },
        tabBarItemStyle: {
          height: PILL_HEIGHT,
          paddingVertical: 0,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarIconStyle: {
          marginTop: 0,
        },
        // Real blur on both platforms (Android uses the Dimezis blur backend),
        // plus a faint tint so labels stay readable over busy content.
        tabBarBackground: () => (
          <View style={[StyleSheet.absoluteFill, styles.pillClip]}>
            <BlurView
              intensity={Platform.OS === 'ios' ? 60 : 40}
              tint={Platform.OS === 'ios'
                ? (isDark ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight')
                : (isDark ? 'dark' : 'light')}
              experimentalBlurMethod="dimezisBlurView"
              style={StyleSheet.absoluteFill}
            />
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: isDark ? 'rgba(20,20,26,0.35)' : 'rgba(255,255,255,0.35)' },
              ]}
            />
          </View>
        ),
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
          marginBottom: 0,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon
              name={focused ? "home" : "home-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon
              name={focused ? "person" : "person-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon
              name={focused ? "settings" : "settings-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: "About",
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon
              name={focused ? "information-circle" : "information-circle-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
};

const styles = StyleSheet.create({
  pillClip: {
    borderRadius: PILL_HEIGHT / 2,
    overflow: 'hidden',
  },
});

export default TabLayout;