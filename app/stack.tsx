import { Colors } from "@/constants/Colors";
import ThemeContext from "@/context/ThemeContext";
import { Stack } from "expo-router";
import { useContext } from "react";

const StackScreen = () => {
    const {theme: colorScheme} = useContext(ThemeContext);
    
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
                name="morning-adkar"
                options={{
                    title: "Morning Adkar",
                    headerTitleStyle: {
                        color: Colors[colorScheme as keyof typeof Colors].text,
                    },
                    headerBackTitle: "Back",
                    headerStyle: {
                        backgroundColor:
                            Colors[colorScheme as keyof typeof Colors].border,
                    },
                }}
            />
            <Stack.Screen
                name="evening-adkar"
                options={{
                    title: "Evening Adkar",
                    headerTitleStyle: {
                        color: Colors[colorScheme as keyof typeof Colors].text,
                    },
                    headerBackTitle: "Back",
                    headerStyle: {
                        backgroundColor:
                            Colors[colorScheme as keyof typeof Colors].border,
                    },
                }}
            />
        </Stack>
    );
};

export default StackScreen;