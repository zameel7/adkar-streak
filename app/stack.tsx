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
                        fontSize: 20,
                        fontWeight: 'bold',
                    },
                    headerBackTitle: "Home",
                    headerBackTitleStyle: {
                        fontSize: 16,
                        color: '#61B553',
                    },
                    headerTintColor: '#61B553',
                    headerStyle: {
                        backgroundColor:
                            Colors[colorScheme as keyof typeof Colors].background,
                        shadowColor: 'transparent',
                        elevation: 0,
                    },
                    headerShadowVisible: false,
                }}
            />
            <Stack.Screen
                name="evening-adkar"
                options={{
                    title: "Evening Adkar",
                    headerTitleStyle: {
                        color: Colors[colorScheme as keyof typeof Colors].text,
                        fontSize: 20,
                        fontWeight: 'bold',
                    },
                    headerBackTitle: "Home",
                    headerBackTitleStyle: {
                        fontSize: 16,
                        color: '#28A766',
                    },
                    headerTintColor: '#28A766',
                    headerStyle: {
                        backgroundColor:
                            Colors[colorScheme as keyof typeof Colors].background,
                        shadowColor: 'transparent',
                        elevation: 0,
                    },
                    headerShadowVisible: false,
                }}
            />
        </Stack>
    );
};

export default StackScreen;