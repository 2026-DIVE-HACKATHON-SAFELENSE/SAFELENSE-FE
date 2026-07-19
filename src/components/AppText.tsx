import { Text, type TextProps } from 'react-native';

import { colors, font, type FontWeightKey } from '@/theme';

type Props = TextProps & {
  /** Pretendard weight. Defaults to `regular`. */
  weight?: FontWeightKey;
  color?: string;
};

/**
 * Text primitive that applies a Pretendard family by weight. Because each
 * Pretendard weight is registered as its own family, we set `fontFamily`
 * rather than `fontWeight` so weights render correctly on Android too.
 */
export function AppText({ weight = 'regular', color = colors.textPrimary, style, ...rest }: Props) {
  return <Text {...rest} style={[{ fontFamily: font[weight], color }, style]} />;
}
