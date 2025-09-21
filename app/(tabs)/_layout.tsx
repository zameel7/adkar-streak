import { Tabs } from "expo-router";
import React, { useContext } from "react";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import ThemeContext from "@/context/ThemeContext";

const TabLayout = () => {
  const { theme } = useContext(ThemeContext);
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#2196F3",
        tabBarInactiveTintColor: theme === 'dark' ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)",
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 20,
          paddingTop: 8,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={80}
            tint={theme === 'dark' ? 'dark' : 'light'}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
            }}
          />
        ),
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
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

export default TabLayout;