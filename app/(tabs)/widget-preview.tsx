import { WidgetPreview } from "react-native-android-widget";
import { HelloWidget } from "@/components/HelloWidget";
import { StyleSheet } from "react-native";
import { ThemedView } from "@/components/ThemedView";

const SeeWidgetPreview = () => {
    return (
        <ThemedView style={styles.widgetContainer}>
            <WidgetPreview
                renderWidget={() => <HelloWidget />}
                width={320}
                height={200}
            />
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    widgetContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});

export default SeeWidgetPreview;
