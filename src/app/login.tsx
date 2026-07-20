import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/auth';
import { AppText } from '@/components/AppText';
import { KakaoLogo } from '@/components/KakaoLogo';
import { colors } from '@/theme';

const stub = (feature: string) =>
  Alert.alert(feature, '준비 중입니다. 이후 작업에서 추가됩니다.');

export default function Login() {
  const insets = useSafeAreaInsets();
  const { signIn, browseAsGuest } = useAuth();

  // Kakao auth is stubbed: sign-in is mocked so the app is reachable. "둘러보기"
  // enters as a guest. Real @react-native-seoul/kakao-login lands in a later task.
  const loginWithKakao = () => {
    signIn();
    router.replace('/home');
  };
  const browse = () => {
    browseAsGuest();
    router.replace('/home');
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom + 32 }]}>
      {/* Vertical rhythm from Figma "로그인" (38:3270). The three flexible gaps —
          top→title, title→Kakao button, button→footer — are in ratio 200:125:277,
          which lands the Kakao button on the screen's vertical center regardless of
          height (native + web, where there's no top safe-area inset to lean on). */}
      <View style={styles.gapTop} />

      <View style={styles.header}>
        <AppText weight="bold" style={styles.title}>
          로그인
        </AppText>
        <AppText color={colors.textSecondary} style={styles.subtitle}>
          전세 사기로부터 내 보증금을 지킵니다
        </AppText>
      </View>

      <View style={styles.gapMid} />

      <View style={styles.loginBlock}>
        <Pressable
          onPress={loginWithKakao}
          style={({ pressed }) => [styles.kakaoBtn, pressed && styles.pressed]}
        >
          <KakaoLogo size={24} />
          <AppText weight="semibold" color={colors.kakaoText} style={styles.kakaoText}>
            카카오로 시작하기
          </AppText>
          <View style={styles.kakaoSpacer} />
        </Pressable>
        <AppText weight="medium" color={colors.kakaoSubtext} style={styles.helper}>
          소셜 로그인 계정으로 간편하게 시작해보세요.
        </AppText>
      </View>

      <View style={styles.gapBottom} />

      <View style={styles.footer}>
        <View style={styles.footerLinks}>
          <Pressable onPress={() => stub('회원가입')} hitSlop={8}>
            <AppText weight="semibold" color={colors.textSecondary} style={styles.footerLink}>
              회원가입
            </AppText>
          </Pressable>
          <View style={styles.divider} />
          <Pressable onPress={browse} hitSlop={8}>
            <AppText weight="semibold" color={colors.textSecondary} style={styles.footerLink}>
              둘러보기
            </AppText>
          </Pressable>
        </View>
        <AppText color={colors.textMuted} style={styles.terms}>
          로그인 시 <AppText color={colors.textMuted} style={styles.underline}>이용약관</AppText> 및{' '}
          <AppText color={colors.textMuted} style={styles.underline}>개인정보처리방침</AppText>에 동의하게
          됩니다
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 24 },
  // Figma vertical gaps (38:3270): top:title:footer ≈ 200 : 125 : 277.
  gapTop: { flex: 200 },
  gapMid: { flex: 125 },
  gapBottom: { flex: 277 },
  header: { alignItems: 'center' },
  title: { fontSize: 24, lineHeight: 32, color: colors.textPrimary },
  subtitle: { fontSize: 16, lineHeight: 20, marginTop: 4 },
  loginBlock: { alignItems: 'center', gap: 16 },
  kakaoBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.kakao,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  pressed: { opacity: 0.85 },
  kakaoText: { flex: 1, fontSize: 16, textAlign: 'center' },
  kakaoSpacer: { width: 24 },
  helper: { fontSize: 14 },
  footer: { alignItems: 'center', gap: 16 },
  footerLinks: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  footerLink: { fontSize: 14, lineHeight: 16 },
  divider: { width: 1, height: 12, backgroundColor: colors.skipBorder },
  terms: { fontSize: 10, lineHeight: 16, textAlign: 'center' },
  underline: { textDecorationLine: 'underline' },
});
