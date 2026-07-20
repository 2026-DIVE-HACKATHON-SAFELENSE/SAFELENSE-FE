import { LinearGradient } from 'expo-linear-gradient';
import { type ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/AppText';
import { colors, gradient, radius } from '@/theme';

const DEFAULT_GRADIENT = gradient.button;

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'gradient' | 'outline';
  gradient?: readonly [string, string];
  icon?: ReactNode;
  iconPosition?: 'leading' | 'trailing';
  labelSize?: number;
  height?: number;
};

/** Full-width CTA — 다음 단계로 / AI 분석 시작하기 / 저장 / 새 분석. */
export function WideButton({
  label,
  onPress,
  variant = 'gradient',
  gradient = DEFAULT_GRADIENT,
  icon,
  iconPosition = 'trailing',
  labelSize = 16,
  height = 56,
}: Props) {
  const textColor = variant === 'outline' ? colors.textPrimary : colors.white;
  const content = (
    <>
      {icon && iconPosition === 'leading' ? icon : null}
      <AppText weight="bold" color={textColor} style={{ fontSize: labelSize, lineHeight: labelSize + 8 }}>
        {label}
      </AppText>
      {icon && iconPosition === 'trailing' ? icon : null}
    </>
  );

  if (variant === 'outline') {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.base, styles.outline, { height }, pressed && styles.pressed]}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.base, styles.gradient, { height }]}
      >
        {content}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%' },
  base: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radius.button,
  },
  gradient: {
    shadowColor: '#C6D2FF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 6,
  },
  outline: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.hairline,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 2,
  },
  pressed: { opacity: 0.9 },
});
