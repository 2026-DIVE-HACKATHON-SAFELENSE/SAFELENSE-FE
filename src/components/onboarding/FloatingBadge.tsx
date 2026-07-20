import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';

import { AppText } from '@/components/AppText';
import { colors, radius } from '@/theme';

/** Small white "chip" that gently bobs over an illustration (e.g. 위험 감지 / 행동 제안). */
export function FloatingBadge({
  icon,
  text,
  textColor,
}: {
  icon: ReactNode;
  text: string;
  textColor: string;
}) {
  const y = useRef(new Animated.Value(0)).current;
  // Desync each badge with its own phase so they don't bob in lockstep.
  const phase = useRef(Math.random() * 1400).current;
  useEffect(() => {
    const anim = Animated.sequence([
      Animated.delay(phase),
      Animated.loop(
        Animated.sequence([
          Animated.timing(y, { toValue: 1, duration: 1700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(y, { toValue: 0, duration: 1700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ]),
      ),
    ]);
    anim.start();
    return () => anim.stop();
  }, [y, phase]);

  return (
    <Animated.View
      style={[styles.badge, { transform: [{ translateY: y.interpolate({ inputRange: [0, 1], outputRange: [0, -5] }) }] }]}
    >
      {icon}
      <AppText weight="bold" color={textColor} style={styles.text}>
        {text}
      </AppText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.white,
    borderColor: '#EEF2FF',
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
    shadowColor: '#C6D2FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 4,
  },
  text: { fontSize: 10, lineHeight: 15 },
});
