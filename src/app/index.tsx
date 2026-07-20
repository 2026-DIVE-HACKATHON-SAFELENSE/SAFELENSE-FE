import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { SplashLogo } from '@/components/SplashLogo';

/**
 * Launch splash (Figma "스플래시", node 42:4486 / 42:4517). The house-with-eyes
 * mark fades/scales in, blinks a couple of times, then routes into onboarding.
 */
export default function Splash() {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.9)).current;
  // 1 = eyes open, ~0 = closed. Drives an SVG prop, so it can't use the native
  // driver — fine for a short splash.
  const blink = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const entrance = Animated.parallel([
      Animated.timing(logoOpacity, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, friction: 7, tension: 60, useNativeDriver: true }),
    ]);

    const blinkOnce = Animated.sequence([
      Animated.timing(blink, { toValue: 0.06, duration: 90, useNativeDriver: false }),
      Animated.timing(blink, { toValue: 1, duration: 140, useNativeDriver: false }),
    ]);
    const blinking = Animated.loop(Animated.sequence([Animated.delay(1200), blinkOnce]));

    entrance.start();
    blinking.start();

    const timer = setTimeout(() => router.replace('/onboarding'), 2700);
    return () => {
      entrance.stop();
      blinking.stop();
      clearTimeout(timer);
    };
  }, [logoOpacity, logoScale, blink]);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: logoOpacity, transform: [{ scale: logoScale }] }}>
        <SplashLogo size={104} blink={blink} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
});
