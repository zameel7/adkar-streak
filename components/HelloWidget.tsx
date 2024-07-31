import React from "react";
import { FlexWidget, TextWidget } from "react-native-android-widget";

type Row = {
    id: number;
    morning: boolean;
    evening: boolean;
    date: string;
};

export function HelloWidget() {
    return (
        // Create a widget that displays the current streak
        <FlexWidget
            style={{
                height: "match_parent",
                width: "match_parent",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#FFFFFF",
                borderRadius: 16,
            }}
        >
            <TextWidget
                text={`Current Streak: 5`}
                style={{
                    fontSize: 32,
                    fontFamily: "Inter",
                    color: "#000000",
                }}
            />
        </FlexWidget>
    );
};