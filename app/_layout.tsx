import { Stack } from "expo-router";
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';
import 'react-native-reanimated';

const RootLayout = () => {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="morning-adkar" options={{ title: "Morning Adkar" }} />
        <Stack.Screen name="evening-adkar" options={{ title: "Evening Adkar" }} />
      </Stack>
    </ThemeProvider>
  );
}

export default RootLayout;