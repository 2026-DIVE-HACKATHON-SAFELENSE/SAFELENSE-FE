import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';

const SPLASH_A = require('../../assets/images/onboarding/splash-a.png');
const SPLASH_B = require('../../assets/images/onboarding/splash-b.png');

/**
 * Launch splash. Shows the house mark (A), then the magnifier "lens" fades in
 * over it (B) to form the SafeLens logo, then routes into onboarding.
 */
export default function Splash() {
  const lensOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fade = Animated.timing(lensOpacity, {
      toValue: 1,
      duration: 550,
      delay: 650,
      useNativeDriver: true,
    });
    fade.start();
    const timer = setTimeout(() => router.replace('/onboarding'), 1900);
    return () => {
      fade.stop();
      clearTimeout(timer);
    };
  }, [lensOpacity]);

  return (
    <View style={styles.container}>
      <Image source={SPLASH_A} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <Animated.Image
        source={SPLASH_B}
        style={[StyleSheet.absoluteFill, { opacity: lensOpacity }]}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#C9B8E8' },
});
