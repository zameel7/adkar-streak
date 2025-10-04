import { PropsWithChildren, ReactElement, useCallback, useContext, useState } from 'react';
import { RefreshControl, StyleSheet } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from 'react-native-reanimated';

import { ThemedView } from '@/components/ThemedView';
import ThemeContext from '@/context/ThemeContext';
import HijriNow from 'hijri-now';
import { ThemedText } from './ThemedText';


const HEADER_HEIGHT = 250;

type Props = PropsWithChildren<{
  headerImage: ReactElement;
  headerBackgroundColor: { dark: string; light: string };
  showTime?: boolean;
  setRefreshingAPI: (refreshing: boolean) => void;
}>;


const arabicMonthNames = [
  'Muḥarram',
  'Ṣafar',
  'Rabīʿ al-Awwal',
  'Rabīʿ al-Akhir',
  'Jumādā al-Ūlā',
  'Jumādā al-Ākhirah',
  'Rajab',
  'Shaʿbān',
  'Ramaḍān',
  'Shawwāl',
  'Dhū al-Qaʿdah',
  'Dhū al-Ḥijjah'
];

export default function ParallaxScrollView({
  children,
  headerImage,
  headerBackgroundColor,
  showTime = true,
  setRefreshingAPI,
}: Props) {
  const {theme: colorScheme} = useContext(ThemeContext);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);
  const currentDate = new Date();
  const currentTimestamp = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const date = `${arabicMonthNames[HijriNow.month() - 1]} ${HijriNow.day()}, ${HijriNow.year()}`;


  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Call API to refresh data
    setRefreshingAPI(true);
    // Reset state or perform actions to simulate a reload
    setTimeout(() => {
      // Reset state or perform actions to simulate a reload
      setRefreshing(false);
      setRefreshingAPI(false);
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
      padding: 20,
      gap: 16,
      overflow: 'hidden',
    },
    date: {
      position: 'absolute',
      bottom: 16,
      right: 16,
      color: colorScheme === 'dark' ? '#fff' : '#000',
    },
    time: {
      position: 'absolute',
      bottom: 48,
      right: 16,
      color: colorScheme === 'dark' ? '#fff' : '#000',
    }
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
            { backgroundColor: headerBackgroundColor[colorScheme as keyof typeof headerBackgroundColor] },
            headerAnimatedStyle,
          ]}
        >
          {headerImage}
          {showTime && <ThemedText type="defaultSemiBold" style={styles.time}>
            {currentTimestamp}
          </ThemedText>}
          {showTime && <ThemedText type="defaultSemiBold" style={styles.date}>
            {date}
          </ThemedText>}
        </Animated.View>
        <ThemedView style={styles.content}>{children}</ThemedView>
      </Animated.ScrollView>
    </ThemedView>
  );
}