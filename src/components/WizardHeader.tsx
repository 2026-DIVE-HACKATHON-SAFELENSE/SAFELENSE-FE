import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius } from '@/theme';

/** Back button + N-dot step progress used by the 계약 전 wizard screens. */
export function WizardHeader({
  step,
  total,
  onBack,
}: {
  /** 0-based index of the current step. */
  step: number;
  total: number;
  onBack: () => void;
}) {
  return (
    <View style={styles.bar}>
      <Pressable onPress={onBack} hitSlop={8} style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
        <Feather name="chevron-left" size={20} color={colors.textPrimary} />
      </Pressable>

      <View style={styles.dots}>
        {Array.from({ length: total }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < step && styles.done,
              i === step && styles.active,
              i > step && styles.pending,
            ]}
          />
        ))}
      </View>

      <View style={styles.back} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  back: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E0E7FF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 1.5,
    elevation: 2,
  },
  pressed: { opacity: 0.6 },
  dots: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: radius.pill },
  done: { backgroundColor: colors.brand },
  active: { width: 20, backgroundColor: colors.brand },
  pending: { backgroundColor: colors.hairline },
});
