import { PropsWithChildren, ReactElement, useCallback, useState } from 'react';
import { RefreshControl, StyleSheet, useColorScheme } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from 'react-native-reanimated';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from './ThemedText';

const HEADER_HEIGHT = 250;

type Props = PropsWithChildren<{
  headerImage: ReactElement;
  headerBackgroundColor: { dark: string; light: string };
  showTime?: boolean;
  setRefreshingAPI: (refreshing: boolean) => void;
}>;

export default function ParallaxScrollView({
  children,
  headerImage,
  headerBackgroundColor,
  showTime = true,
  setRefreshingAPI,
}: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);
  const currentDate = new Date();
  const currentTimestamp = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const date = currentDate.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Call API to refresh data
    setRefreshingAPI(true);
    // Reset state or perform actions to simulate a reload
    setTimeout(() => {
      // Reset state or perform actions to simulate a reload
      setRefreshing(false);
    }, 1000); // Adjust the delay as needed
  }, []);
  

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75]
          ),
        },
        {
          scale: interpolate(scrollOffset.value, [-HEADER_HEIGHT, 0, HEADER_HEIGHT], [2, 1, 1]),
        },
      ],
    };
  });

  return (
    <ThemedView style={styles.container}>
      <Animated.ScrollView 
        ref={scrollRef} 
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Animated.View
          style={[
            styles.header,
            { backgroundColor: headerBackgroundColor[colorScheme] },
            headerAnimatedStyle,
          ]}
        >
          {headerImage}
          {showTime && <ThemedText type="defaultSemiBold" style={styles.time}>
            {currentTimestamp} | {date}
          </ThemedText>}
        </Animated.View>
        <ThemedView style={styles.content}>{children}</ThemedView>
      </Animated.ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 250,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: 32,
    gap: 16,
    overflow: 'hidden',
  },
  time: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    color: '#FF9800',
  },
});