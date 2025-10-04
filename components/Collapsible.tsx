import Ionicons from "@expo/vector-icons/Ionicons";
import { PropsWithChildren, useContext, useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import ThemeContext from "@/context/ThemeContext";

export function Collapsible({
    children,
    title,
}: PropsWithChildren & { title: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const {theme} = useContext(ThemeContext);

    return (
        <ThemedView style={styles.line}>
            <TouchableOpacity
                style={styles.heading}
                onPress={() => setIsOpen((value) => !value)}
                activeOpacity={0.8}
            >
                <Ionicons
                    name={isOpen ? "chevron-down" : "chevron-forward-outline"}
                    size={18}
                    color={
                        theme === "light" ? Colors.light.icon : Colors.dark.icon
                    }
                />
                <ThemedText type="defaultSemiBold">{title}</ThemedText>
            </TouchableOpacity>
            {isOpen && (
                <ThemedView style={styles.content}>{children}</ThemedView>
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    heading: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    content: {
        marginTop: 6,
        marginLeft: 24,
    },
    line: {
        marginTop: 10,
        marginBottom: 20,
        alignItems: "center",
        borderStyle: "solid",
        borderWidth: 1,
        padding: 5,
        borderColor: "#d3d3d3",
    },
});
