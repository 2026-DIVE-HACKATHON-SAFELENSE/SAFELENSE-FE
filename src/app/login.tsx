import * as AuthSession from 'expo-auth-session';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/auth';
import { AppText } from '@/components/AppText';
import { KakaoLogo } from '@/components/KakaoLogo';
import { KAKAO_DISCOVERY, KAKAO_REDIRECT_PATH, KAKAO_REST_API_KEY } from '@/config';
import { colors, radius } from '@/theme';

const stub = (feature: string) =>
  Alert.alert(feature, '준비 중입니다. 이후 작업에서 추가됩니다.');

export default function Login() {
  const insets = useSafeAreaInsets();
  const { signInWithKakao, browseAsGuest } = useAuth();
  const [busy, setBusy] = useState(false);
  // 이미 백엔드에 넘긴 인가코드. 1회용 코드를 리렌더/StrictMode 로 두 번 교환하면
  // 두 번째가 "authorization code is invalid" 로 실패하므로 코드별 1회만 처리한다.
  const handledCode = useRef<string | null>(null);

  // 카카오 REST OAuth. 백엔드가 client_secret 으로 code→token 을 교환하므로 PKCE 는
  // 끈다(계약에 codeVerifier 없음). redirectUri 는 authorize 요청과 백엔드 교환에
  // 같은 값을 써야 하므로 한 번 만들어 재사용한다. 웹은 현재 origin + 경로,
  // 네이티브는 safelense:// 스킴으로 생성된다.
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'safelense',
    path: KAKAO_REDIRECT_PATH,
  });

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: KAKAO_REST_API_KEY,
      redirectUri,
      usePKCE: false,
      scopes: [],
    },
    KAKAO_DISCOVERY,
  );

  // 카카오 인가 결과 처리: 성공 시 인가코드를 백엔드에 넘겨 로그인 완료.
  useEffect(() => {
    if (response?.type === 'success' && response.params.code) {
      const code = response.params.code;
      if (handledCode.current === code) return; // 같은 코드 재교환 방지
      handledCode.current = code;
      if (__DEV__) console.log('[kakao] exchanging code with redirectUri:', redirectUri);
      (async () => {
        try {
          setBusy(true);
          await signInWithKakao(code, redirectUri);
          router.replace('/home');
        } catch (e) {
          setBusy(false);
          Alert.alert(
            '로그인 실패',
            e instanceof Error ? e.message : '잠시 후 다시 시도해주세요.',
          );
        }
      })();
    } else if (response?.type === 'error') {
      Alert.alert('로그인 실패', response.error?.message ?? '카카오 인증 중 오류가 발생했습니다.');
    }
    // redirectUri/signInWithKakao 는 매 렌더 안정적이므로 response 만 관찰한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  const loginWithKakao = () => {
    if (busy || !request) return;
    promptAsync();
  };
  const browse = () => {
    browseAsGuest();
    router.replace('/home');
  };

  const kakaoDisabled = busy || !request;

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
          disabled={kakaoDisabled}
          style={({ pressed }) => [
            styles.kakaoBtn,
            pressed && styles.pressed,
            kakaoDisabled && styles.disabled,
          ]}
        >
          {busy ? (
            <ActivityIndicator color={colors.kakaoText} />
          ) : (
            <>
              <KakaoLogo size={24} />
              <AppText weight="semibold" color={colors.kakaoText} style={styles.kakaoText}>
                카카오로 시작하기
              </AppText>
              <View style={styles.kakaoSpacer} />
            </>
          )}
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
    borderRadius: radius.field,
    backgroundColor: colors.kakao,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.6 },
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
