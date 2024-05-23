import { SafeAreaProvider } from "react-native-safe-area-context";
import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";

const Index = () => {
  function getDayNightIcon() {
    const hours = new Date().getHours();
    return hours >= 6 && hours < 18 ? hours >= 8 ? 'sunny' : 'partly-sunny' : 'moon';
  }

  return (
    <SafeAreaProvider>
      <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={<Ionicons size={200} name={getDayNightIcon()} style={styles.dayNightIcon} />}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">
            Home
          </ThemedText>
        </ThemedView>
      </ParallaxScrollView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  dayNightIcon: {
    color: '#808080',
    bottom: 0,
    left: 10,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});

export default Index;