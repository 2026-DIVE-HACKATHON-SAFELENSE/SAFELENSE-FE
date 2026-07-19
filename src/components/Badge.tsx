import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { radius } from '@/theme';

/** Small pill label (필수 / 위험 / 주의 / 관찰). */
export function Badge({ label, textColor, bg }: { label: string; textColor: string; bg: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <AppText weight="bold" color={textColor} style={styles.text}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 1,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 10, lineHeight: 15 },
});
