/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#61B553";
const tintColorDark = "#fff";

export const Colors = {
    light: {
        text: "#11181C",
        background: "#fff",
        tint: tintColorLight,
        icon: "#687076",
        tabIconDefault: "#687076",
        tabIconSelected: tintColorLight,
        primary: "#61B553",
        secondary: "#28A766",
        shadow: "#000",
        input: "#000",
        linkText: "#6200EA",
        placeholder: "#687076",
        streakValue: "#FF9800",
        border: "rgb(245, 245, 245)",
    },
    dark: {
        text: "#ECEDEE",
        background: "#151718",
        tint: tintColorDark,
        icon: "#9BA1A6",
        tabIconDefault: "#9BA1A6",
        tabIconSelected: tintColorDark,
        primary: "#61B553",
        secondary: "#28A766",
        shadow: "#000",
        input: "#FFF",
        linkText: "#841584",
        placeholder: "#9BA1A6",
        streakValue: "#FF9800",
        border: "rgb(39, 39, 41)",
    },
};
