import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/AppText';
import { colors, radius } from '@/theme';

export function SkipButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
    >
      <AppText weight="semibold" color={colors.textSecondary} style={styles.label}>
        건너뛰기
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.skipBorder,
    borderRadius: radius.pill,
    paddingHorizontal: 13,
    paddingVertical: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 1,
  },
  pressed: { opacity: 0.6 },
  label: { fontSize: 12, lineHeight: 16 },
});
