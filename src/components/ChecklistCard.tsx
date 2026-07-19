import { Feather } from '@expo/vector-icons';
import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { colors, radius } from '@/theme';

type Props = {
  title: string;
  description: string;
  badge?: ReactNode;
  checked: boolean;
  onToggle: () => void;
  /** Highlight styling applied when checked (green for 서류, red for 행태). */
  checkedBg: string;
  checkedBorder: string;
  radioColor: string;
  checkedTitleColor: string;
};

/** A tappable checklist row with a radio, title + optional badge, and description. */
export function ChecklistCard({
  title,
  description,
  badge,
  checked,
  onToggle,
  checkedBg,
  checkedBorder,
  radioColor,
  checkedTitleColor,
}: Props) {
  return (
    <Pressable
      onPress={onToggle}
      style={({ pressed }) => [
        styles.card,
        checked ? { backgroundColor: checkedBg, borderColor: checkedBorder } : styles.unchecked,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.radio, checked && { backgroundColor: radioColor, borderColor: radioColor }]}>
        {checked ? <Feather name="check" size={12} color={colors.white} /> : null}
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <AppText
            weight="semibold"
            color={checked ? checkedTitleColor : colors.textPrimary}
            style={styles.title}
          >
            {title}
          </AppText>
          {badge}
        </View>
        <AppText weight="medium" color={colors.textSecondary} style={styles.desc}>
          {description}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: radius.button,
    borderWidth: 1,
    padding: 16,
  },
  unchecked: {
    backgroundColor: colors.white,
    borderColor: colors.hairline,
    shadowColor: '#EEF2FF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 1.5,
    elevation: 1,
  },
  pressed: { opacity: 0.85 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(123, 139, 178, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  content: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  title: { fontSize: 14, lineHeight: 20 },
  desc: { fontSize: 12, lineHeight: 16, marginTop: 2 },
});
