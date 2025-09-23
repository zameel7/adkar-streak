import React, { useEffect } from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from '@/hooks/useColorScheme';

interface AnimatedSplashScreenProps {
  onAnimationFinish: () => void;
}

export default function AnimatedSplashScreen({ onAnimationFinish }: AnimatedSplashScreenProps) {
  const colorScheme = useColorScheme();

  useEffect(() => {
    const hideSplash = async () => {
      await SplashScreen.hideAsync();
    };
    hideSplash();

    // Show splash for 2.5 seconds
    const timer = setTimeout(() => {
      onAnimationFinish();
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[
      styles.container,
      { backgroundColor: colorScheme === 'dark' ? '#242424' : '#FFFFFF' }
    ]}>
      <Image
        source={require('@/assets/images/splash-icon.png')}
        style={styles.icon}
        resizeMode="contain"
      />
      <Text style={[
        styles.appName,
        { color: colorScheme === 'dark' ? '#FFFFFF' : '#2196F3' }
      ]}>
        Track your daily Islamic remembrances
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  icon: {
    width: 300,
    height: 300,
  },
  appName: {
    fontSize: 18,
  },
});