import { ThemedText } from '@/components/ThemedText';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export const ONBOARDING_KEY = 'onboardingComplete';

type IllustrationKind = 'welcome' | 'cycle' | 'streak' | 'sync';

type Slide = {
  key: string;
  title: string;
  body: string;
  gradient: [string, string, string];
  illustration: IllustrationKind;
};

const SLIDES: Slide[] = [
  {
    key: 's1',
    title: 'Welcome to Adkar Champ',
    body: 'A simple companion to help you remember Allah every morning and evening — designed to work fully offline.',
    gradient: ['#0F4C81', '#1976D2', '#64B5F6'],
    illustration: 'welcome',
  },
  {
    key: 's2',
    title: 'Morning & Evening Adkar',
    body: 'Read the prophetic remembrances after Fajr and Asr. Get gentle daily reminders at times you choose.',
    gradient: ['#0D47A1', '#3949AB', '#7986CB'],
    illustration: 'cycle',
  },
  {
    key: 's3',
    title: 'Build a Streak',
    body: 'Mark each day complete and watch your streak grow. Consistency is the secret to a meaningful habit.',
    gradient: ['#B26500', '#F57C00', '#FFB74D'],
    illustration: 'streak',
  },
  {
    key: 's4',
    title: 'Optional Cloud Sync',
    body: 'Everything works without an account. Sign in from Profile whenever you want to back up and sync across devices.',
    gradient: ['#1B5E20', '#388E3C', '#81C784'],
    illustration: 'sync',
  },
];

const Illustration: React.FC<{ kind: IllustrationKind }> = ({ kind }) => {
  switch (kind) {
    case 'welcome':
      return (
        <View style={styles.illoWrap}>
          <View style={[styles.blob, styles.blobBack]} />
          <View style={styles.iconCircle}>
            <Image
              source={require('@/assets/images/icon-dark.png')}
              style={styles.splashIcon}
              resizeMode="contain"
            />
          </View>
          <View style={[styles.floatChip, { top: 10, right: 24 }]}>
            <Ionicons name="moon" size={16} color="#1976D2" />
          </View>
          <View style={[styles.floatChip, { bottom: 30, left: 18 }]}>
            <Ionicons name="sunny" size={16} color="#F57C00" />
          </View>
        </View>
      );
    case 'cycle':
      return (
        <View style={styles.illoWrap}>
          <View style={[styles.blob, styles.blobBack]} />
          <View style={styles.iconCircle}>
            <Ionicons name="time-outline" size={84} color="#1976D2" />
          </View>
          <View style={[styles.floatChip, { top: 16, left: 18 }]}>
            <Ionicons name="sunny-outline" size={18} color="#F57C00" />
          </View>
          <View style={[styles.floatChip, { bottom: 28, right: 22 }]}>
            <Ionicons name="moon-outline" size={18} color="#3949AB" />
          </View>
        </View>
      );
    case 'streak':
      return (
        <View style={styles.illoWrap}>
          <View style={[styles.blob, styles.blobBack]} />
          <View style={styles.iconCircle}>
            <Ionicons name="flame" size={84} color="#F57C00" />
          </View>
          <View style={[styles.floatChip, { top: 8, right: 22 }]}>
            <Ionicons name="trophy" size={16} color="#F59E0B" />
          </View>
          <View style={[styles.floatChip, { bottom: 30, left: 18 }]}>
            <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
          </View>
        </View>
      );
    case 'sync':
      return (
        <View style={styles.illoWrap}>
          <View style={[styles.blob, styles.blobBack]} />
          <View style={styles.iconCircle}>
            <Ionicons name="cloud-done-outline" size={84} color="#388E3C" />
          </View>
          <View style={[styles.floatChip, { top: 14, left: 22 }]}>
            <Ionicons name="phone-portrait-outline" size={18} color="#1976D2" />
          </View>
          <View style={[styles.floatChip, { bottom: 22, right: 24 }]}>
            <Ionicons name="lock-closed-outline" size={16} color="#475569" />
          </View>
        </View>
      );
  }
};

export default function OnboardingScreen() {
  const listRef = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(0);
  const dotAnim = useRef(new Animated.Value(0)).current;

  const finish = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    } catch (e) {
      console.warn('Failed to save onboarding state:', e);
    }
    router.replace('/home');
  };

  const handleNext = () => {
    if (index < SLIDES.length - 1) {
      const nextIdx = index + 1;
      listRef.current?.scrollToIndex({ index: nextIdx, animated: true });
      setIndex(nextIdx);
      Animated.timing(dotAnim, {
        toValue: nextIdx,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    } else {
      finish();
    }
  };

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const newIdx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    if (newIdx !== index) {
      setIndex(newIdx);
      Animated.timing(dotAnim, {
        toValue: newIdx,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }
  };

  const isLast = index === SLIDES.length - 1;
  const current = SLIDES[index];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={current.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          <View style={{ width: 60 }} />
          <View style={styles.dotsRow}>
            {SLIDES.map((_, i) => {
              const w = dotAnim.interpolate({
                inputRange: [i - 1, i, i + 1],
                outputRange: [8, 24, 8],
                extrapolate: 'clamp',
              });
              const op = dotAnim.interpolate({
                inputRange: [i - 1, i, i + 1],
                outputRange: [0.4, 1, 0.4],
                extrapolate: 'clamp',
              });
              return <Animated.View key={i} style={[styles.dot, { width: w, opacity: op }]} />;
            })}
          </View>
          {!isLast ? (
            <TouchableOpacity onPress={finish} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <ThemedText style={styles.skipText}>Skip</ThemedText>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 60 }} />
          )}
        </View>

        <FlatList
          ref={listRef}
          data={SLIDES}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(it) => it.key}
          onMomentumScrollEnd={onMomentumScrollEnd}
          renderItem={({ item }) => (
            <View style={styles.slide}>
              <Illustration kind={item.illustration} />
              <ThemedText style={styles.title}>{item.title}</ThemedText>
              <ThemedText style={styles.body}>{item.body}</ThemedText>
            </View>
          )}
        />

        <View style={styles.footer}>
          <TouchableOpacity style={styles.cta} onPress={handleNext} activeOpacity={0.85}>
            <ThemedText style={[styles.ctaText, { color: current.gradient[1] }]}>
              {isLast ? 'Get Started' : 'Next'}
            </ThemedText>
            <Ionicons
              name={isLast ? 'checkmark' : 'arrow-forward'}
              size={20}
              color={current.gradient[1]}
              style={{ marginLeft: 8 }}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  dotsRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { height: 8, borderRadius: 4, backgroundColor: '#FFFFFF', marginHorizontal: 3 },
  skipText: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 15,
    fontWeight: '600',
    width: 60,
    textAlign: 'right',
  },
  slide: {
    width: SCREEN_W,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: SCREEN_H * 0.04,
  },
  illoWrap: {
    width: Math.min(SCREEN_W * 0.78, 320),
    height: Math.min(SCREEN_W * 0.78, 320),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
    position: 'relative',
  },
  blob: { position: 'absolute', borderRadius: 999 },
  blobBack: { width: '100%', height: '100%', backgroundColor: 'rgba(255,255,255,0.12)' },
  iconCircle: {
    width: 168,
    height: 168,
    borderRadius: 84,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  splashIcon: { width: 120, height: 120 },
  floatChip: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 14,
    letterSpacing: -0.4,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  footer: { paddingHorizontal: 24, paddingBottom: 12, paddingTop: 8 },
  cta: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  ctaText: { fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },
});
