import type { ConfigContext, ExpoConfig } from "expo/config";
import type { WithAndroidWidgetsParams } from "react-native-android-widget";

const widgetConfig: WithAndroidWidgetsParams = {
    // Paths to all custom fonts used in all widgets
    fonts: ["./assets/fonts/SpaceMono-Regular.ttf"],
    widgets: [
        {
            name: "Hello", // This name will be the **name** with which we will reference our widget.
            label: "My Hello Widget", // Label shown in the widget picker
            minWidth: "320dp",
            minHeight: "120dp",
            // This means the widget's default size is 5x2 cells, as specified by the targetCellWidth and targetCellHeight attributes.
            // Or 320×120dp, as specified by minWidth and minHeight for devices running Android 11 or lower.
            // If defined, targetCellWidth,targetCellHeight attributes are used instead of minWidth or minHeight.
            targetCellWidth: 5,
            targetCellHeight: 2,
            description: "This is my first widget", // Description shown in the widget picker
            previewImage: "./assets/widget-preview/hello.png", // Path to widget preview image

            // How often, in milliseconds, that this AppWidget wants to be updated.
            // The task handler will be called with widgetAction = 'UPDATE_WIDGET'.
            // Default is 0 (no automatic updates)
            // Minimum is 1800000 (30 minutes == 30 * 60 * 1000).
            updatePeriodMillis: 1800000,
        },
    ],
};

export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    name: "Adkar Champ",
    slug: "adkar-streak", // Provide a valid string value for the 'slug' property
    plugins: [["react-native-android-widget", widgetConfig]],
});
