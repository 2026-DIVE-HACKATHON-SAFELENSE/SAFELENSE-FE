import { type ComponentType } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { GradientButton } from '@/components/GradientButton';
import { Pagination } from '@/components/Pagination';
import { SkipButton } from '@/components/SkipButton';
import { colors, radius } from '@/theme';

export type SlideContent = {
  accent: string;
  gradient: readonly [string, string];
  label: string;
  /** Title / subtitle keep their designed line breaks via `\n`. */
  title: string;
  subtitle: string;
  buttonLabel: string;
  Illustration: ComponentType;
};

type Props = SlideContent & {
  index: number;
  total: number;
  onSkip: () => void;
  onNext: () => void;
};

export function OnboardingSlide({
  accent,
  gradient,
  label,
  title,
  subtitle,
  buttonLabel,
  Illustration,
  index,
  total,
  onSkip,
  onNext,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <SkipButton onPress={onSkip} />
      </View>

      <View style={styles.illustration}>
        <Illustration />
      </View>

      <View style={styles.textBlock}>
        <View style={styles.labelRow}>
          <View style={[styles.labelBar, { backgroundColor: accent }]} />
          <AppText weight="bold" color={accent} style={styles.label}>
            {label}
          </AppText>
        </View>
        <AppText weight="bold" style={styles.title}>
          {title}
        </AppText>
        <AppText color={colors.textSecondary} style={styles.subtitle}>
          {subtitle}
        </AppText>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <Pagination count={total} activeIndex={index} activeColor={accent} />
        <GradientButton
          label={buttonLabel}
          gradient={gradient}
          shadowColor={accent}
          onPress={onNext}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  topBar: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8, alignItems: 'flex-end' },
  illustration: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  textBlock: { paddingHorizontal: 28 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  labelBar: { width: 4, height: 16, borderRadius: radius.pill },
  label: { fontSize: 10, lineHeight: 15 },
  title: { fontSize: 20, lineHeight: 27.5, marginTop: 10, color: colors.textPrimary },
  subtitle: { fontSize: 14, lineHeight: 22.75, marginTop: 16 },
  footer: {
    paddingHorizontal: 28,
    paddingTop: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
