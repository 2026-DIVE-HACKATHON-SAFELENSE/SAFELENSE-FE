import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { colors, radius } from '@/theme';

/** Small white "chip" that floats over an illustration (e.g. 위험 감지 / 행동 제안). */
export function FloatingBadge({
  icon,
  text,
  textColor,
}: {
  icon: ReactNode;
  text: string;
  textColor: string;
}) {
  return (
    <View style={styles.badge}>
      {icon}
      <AppText weight="bold" color={textColor} style={styles.text}>
        {text}
      </AppText>
    </View>
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
