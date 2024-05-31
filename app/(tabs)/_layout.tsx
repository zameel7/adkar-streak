import { Tabs } from "expo-router";
import React, { useContext } from "react";

import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import ThemeContext from "@/context/ThemeContext";

const TabLayout = () => {
    const {theme: colorScheme} = useContext(ThemeContext);

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors[colorScheme as keyof typeof Colors].tint,
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: Colors[colorScheme as keyof typeof Colors].border,
                    borderTopColor: Colors[colorScheme as keyof typeof Colors].background,
                }
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: "Home",
                    tabBarIcon: ({ focused }) => (
                        <TabBarIcon
                            name={focused ? "home" : "home-outline"}
                            color={focused ? Colors[colorScheme as keyof typeof Colors].tabIconSelected : Colors[colorScheme as keyof typeof Colors].tabIconDefault}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: "Settings",
                    tabBarIcon: ({ focused }) => (
                        <TabBarIcon
                            name={focused ? "settings" : "settings-outline"}
                            color={focused ? Colors[colorScheme as keyof typeof Colors].tabIconSelected : Colors[colorScheme as keyof typeof Colors].tabIconDefault}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="about"
                options={{
                    title: "About",
                    tabBarIcon: ({ focused }) => (
                        <TabBarIcon
                            name={focused ? "information-circle" : "information-circle-outline"}
                            color={focused ? Colors[colorScheme as keyof typeof Colors].tabIconSelected : Colors[colorScheme as keyof typeof Colors].tabIconDefault}
                        />
                    ),
                }}
            />
        </Tabs>
    );
};

export default TabLayout;
