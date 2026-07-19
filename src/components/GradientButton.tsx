import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/AppText';
import { colors, radius } from '@/theme';

type Props = {
  label: string;
  /** Two-stop gradient (diagonal, top-left → bottom-right). */
  gradient: readonly [string, string];
  /** Accent used for the drop shadow (matches the button hue at 25% alpha). */
  shadowColor: string;
  onPress: () => void;
};

/** Primary onboarding CTA — the "다음" / "시작하기" gradient pill with a trailing arrow. */
export function GradientButton({ label, gradient, shadowColor, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.btn, { shadowColor }]}
      >
        <AppText weight="bold" color={colors.white} style={styles.label}>
          {label}
        </AppText>
        <Feather name="arrow-right" size={16} color={colors.white} />
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: radius.button,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 6,
  },
  pressed: { opacity: 0.9 },
  label: { fontSize: 14, lineHeight: 20 },
});
