/**
 * SafeLens (세이프렌즈) design tokens.
 *
 * Values are lifted directly from the Figma onboarding designs
 * (file tqnifF7nhwVIjseqnBKMRD). The onboarding surface is a fixed light
 * theme, so there is no dark-mode variant here.
 */

export const colors = {
  /** Screen background (light lavender). */
  bg: '#F2F4FF',
  /** Letterbox frame behind the screen on tall displays. */
  bgFrame: '#E8EBFF',

  textPrimary: '#12172B',
  textSecondary: '#7B8BB2',
  /** Very muted footer text, e.g. the terms line. */
  textMuted: 'rgba(123, 139, 178, 0.6)',

  white: '#FFFFFF',
  /** Inactive pagination dot. */
  dotInactive: '#C7CFE8',

  /** Skip-button hairline border. */
  skipBorder: 'rgba(67, 97, 238, 0.1)',

  /** Slide 1 badges. */
  danger: '#FB2C36',
  safe: '#009966',

  /** Kakao brand. */
  kakao: '#FEE500',
  kakaoText: 'rgba(0, 0, 0, 0.85)',
  kakaoSubtext: '#767676',
} as const;

/**
 * Registered Pretendard families. Keys map to the names passed to
 * `useFonts` in the root layout.
 */
export const font = {
  regular: 'Pretendard-Regular',
  medium: 'Pretendard-Medium',
  semibold: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
} as const;

export type FontWeightKey = keyof typeof font;

export const radius = {
  card: 24,
  button: 16,
  /** Fully rounded pill. */
  pill: 999,
} as const;

export const spacing = {
  screenH: 24,
  slideH: 28,
} as const;
