import { Feather } from '@expo/vector-icons';
import { type ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { colors, radius } from '@/theme';

/** Placeholder for tabs/flows that aren't designed yet (내 집, 마이페이지, 계약 중/후). */
export function ComingSoon({
  headerTitle,
  icon,
  title,
  subtitle,
}: {
  headerTitle: string;
  icon: ComponentProps<typeof Feather>['name'];
  title: string;
  subtitle: string;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <AppText weight="bold" style={styles.headerTitle}>
          {headerTitle}
        </AppText>
      </View>

      <View style={styles.center}>
        <View style={styles.iconCircle}>
          <Feather name={icon} size={30} color={colors.brand} />
        </View>
        <AppText weight="bold" style={styles.title}>
          {title}
        </AppText>
        <AppText color={colors.textSecondary} style={styles.subtitle}>
          {subtitle}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 20, paddingVertical: 14 },
  headerTitle: { fontSize: 20, lineHeight: 28, color: colors.textPrimary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80, gap: 8 },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: radius.pill,
    backgroundColor: colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: { fontSize: 18, lineHeight: 26, color: colors.textPrimary },
  subtitle: { fontSize: 14, lineHeight: 20, textAlign: 'center', paddingHorizontal: 40 },
});
