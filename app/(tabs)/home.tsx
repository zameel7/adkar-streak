import { SafeAreaProvider } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Button } from "@rneui/themed";
import LinearGradient from "react-native-linear-gradient";
import { router } from 'expo-router';

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";

const Home = () => {
  const [name, setName] = useState("Hero" as string);

  useEffect(() => {
    AsyncStorage.getItem("name").then((name) => {
      if (name) {
        setName(name);
      }
    });
  }, []);

  function getDayNightIcon() {
    const hours = new Date().getHours();
    return hours >= 6 && hours < 18
      ? hours >= 8
        ? "sunny"
        : "partly-sunny"
      : "moon";
  }

  return (
    <SafeAreaProvider>
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
        headerImage={
          <Ionicons
            size={200}
            name={getDayNightIcon()}
            style={styles.dayNightIcon}
          />
        }
      >
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Hey there {name}!</ThemedText>
          {getDayNightIcon() !== "sunny" && (
            <ThemedText type="subtitle">
              It's time for your{" "}
              {getDayNightIcon() === "partly-sunny"
                ? "morning"
                : "evening"}{" "}
              adkar!
            </ThemedText>
          )}
        </ThemedView>
        <View style={styles.buttonContainer}>
          <Button
            ViewComponent={LinearGradient}
            linearGradientProps={{
              colors: ["#FF9800", "#F44336"],
              start: { x: 0, y: 0.5 },
              end: { x: 1, y: 0.5 },
            }}
            buttonStyle={styles.button}
            onPress={() => {
              router.push("/morning-adkar");
            }}
          >
            Morning Adkar
          </Button>
          <Button
            ViewComponent={LinearGradient}
            linearGradientProps={{
              colors: ["#FF9800", "#F44336"],
              start: { x: 0, y: 0.5 },
              end: { x: 1, y: 0.5 },
            }}
            buttonStyle={styles.button}
            onPress={() => {
              router.push("/evening-adkar");
            }}
          >
            Evening Adkar
          </Button>
        </View>
      </ParallaxScrollView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  dayNightIcon: {
    color: "#808080",
    bottom: 0,
    left: 10,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "column",
    alignItems: "center",
    padding: 16,
    marginVertical: 24,
  },
  buttonContainer: {
    flexDirection: "column",
    paddingHorizontal: 16,
    marginTop: 24,
  },
  button: {
    marginVertical: 10,
    borderRadius: 8,
  },
});

export default Home;
