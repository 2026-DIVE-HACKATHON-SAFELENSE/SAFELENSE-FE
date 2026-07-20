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

  /** Indigo hairline used on most cards / the skip button. */
  hairline: 'rgba(67, 97, 238, 0.1)',
  /** @deprecated alias of `hairline`, kept for existing onboarding code. */
  skipBorder: 'rgba(67, 97, 238, 0.1)',

  /** Brand indigo (계약 전 accent, active tab, links). */
  brand: '#4361EE',

  /** Slide 1 badges / generic status. */
  danger: '#FB2C36',
  safe: '#009966',
  /** Completed / safe green (분석 완료, 안전 범위). */
  success: '#00A96E',

  /** Home banner (light purple). */
  bannerBg: '#E8E7FF',
  /** Chevron circle inside cards (same as screen bg). */
  chevronBg: '#F2F4FF',

  /** Severity badges (계약 전 행태 체크리스트). */
  dangerText: '#FB2C36',
  dangerBg: '#FFE2E2',
  dangerHighlight: '#FEF2F2',
  dangerBorder: '#FFC9C9',
  dangerTitle: '#C10007',
  warnText: '#FF6900',
  warnBg: '#FFEDD4',
  observeText: '#E17100',
  observeBg: '#FEF3C6',

  /** Green "checked" state (계약 전 서류 체크리스트). */
  greenText: '#059669',
  greenBg: '#F0FDF4',
  greenBorder: '#B9F8CF',
  /** Report 저위험 강조(게이지·점수·라벨) — 한 의미엔 한 그린. */
  riskLow: '#10B981',
  /** Mint 체크 accent (서류 라디오 · 마이페이지 저장 카드). */
  mint: '#00BC7D',
  /** 완료(분석 중) 아이콘 배경 / 라벨. */
  doneGreen: '#00C950',
  doneText: '#00A63E',
  /** 짙은 그린(체크 완료 타이틀 · 리포트 안전 값). */
  greenDeep: '#007A55',

  /** Kakao brand. */
  kakao: '#FEE500',
  kakaoText: 'rgba(0, 0, 0, 0.85)',
  kakaoSubtext: '#767676',
} as const;

/** Per-stage accent config for the home cards. */
export const stageAccent = {
  before: { chipText: '#155DFC', chipBg: '#EFF6FF' },
  during: { chipText: '#F54900', chipBg: '#FFF7ED' },
  after: { chipText: '#7F22FE', chipBg: '#F5F3FF' },
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
  /** Inputs / secondary buttons (e.g. 카카오 버튼). */
  field: 12,
  /** Small chips / segmented-control cells. */
  chip: 8,
  /** Fully rounded pill. */
  pill: 999,
} as const;

/**
 * Brand gradients. Centralized so every screen references one source instead of
 * re-hardcoding stops (previously each screen picked its own second stop).
 */
export const gradient = {
  /** Deep indigo — cards, emblem, CTA. */
  brand: ['#4361EE', '#432DD7'],
  /** Full-width CTA button default. */
  button: ['#4361EE', '#4F39F6'],
  /** Brand logo mark. */
  mark: ['#615FFF', '#155DFC'],
  /** Progress fills. */
  progress: ['#4361EE', '#615FFF'],
} as const;

export const spacing = {
  screenH: 24,
  slideH: 28,
} as const;
