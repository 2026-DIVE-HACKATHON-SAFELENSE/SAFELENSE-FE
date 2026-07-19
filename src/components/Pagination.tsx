import { StyleSheet, View } from 'react-native';

import { colors, radius } from '@/theme';

type Props = {
  count: number;
  /** 0-based active slide. */
  activeIndex: number;
  /** Accent color of the active (elongated) dot. */
  activeColor: string;
};

export function Pagination({ count, activeIndex, activeColor }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: count }).map((_, i) =>
        i === activeIndex ? (
          <View key={i} style={[styles.active, { backgroundColor: activeColor }]} />
        ) : (
          <View key={i} style={styles.inactive} />
        ),
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  active: { width: 20, height: 6, borderRadius: radius.pill },
  inactive: { width: 6, height: 6, borderRadius: radius.pill, backgroundColor: colors.dotInactive },
});
