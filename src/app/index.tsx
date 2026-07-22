import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { SplashLogo } from '@/components/SplashLogo';

/**
 * Launch splash (Figma "스플래시 1~4", 42:4486 → 91:106 → 91:94 → 42:4517).
 * The house mark fades/scales in with blank white eyes (frame 1), the pupils are
 * revealed (frame 2), the right eye winks shut and reopens (frames 3 → 4), then
 * the app routes into onboarding.
 */
export default function Splash() {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.9)).current;
  // 0 = eye open, 1 = lid closed (blank white eye). Drives SVG attributes, so it
  // can't use the native driver — fine for a short splash.
  const leftLid = useRef(new Animated.Value(1)).current;
  const rightLid = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const entrance = Animated.parallel([
      Animated.timing(logoOpacity, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, friction: 7, tension: 60, useNativeDriver: true }),
    ]);

    const openEye = (lid: Animated.Value) =>
      Animated.timing(lid, {
        toValue: 0,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      });

    const storyboard = Animated.sequence([
      Animated.delay(600),
      Animated.parallel([openEye(leftLid), openEye(rightLid)]),
      Animated.delay(480),
      Animated.timing(rightLid, {
        toValue: 1,
        duration: 150,
        easing: Easing.in(Easing.quad),
        useNativeDriver: false,
      }),
      Animated.delay(140),
      openEye(rightLid),
    ]);

    entrance.start();
    storyboard.start();

    const timer = setTimeout(() => router.replace('/onboarding'), 2700);
    return () => {
      entrance.stop();
      storyboard.stop();
      clearTimeout(timer);
    };
  }, [logoOpacity, logoScale, leftLid, rightLid]);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: logoOpacity, transform: [{ scale: logoScale }] }}>
        <SplashLogo size={83} leftLid={leftLid} rightLid={rightLid} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
});
