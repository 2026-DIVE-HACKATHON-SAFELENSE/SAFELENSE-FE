import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { colors } from '@/theme';

/**
 * 카카오 OAuth 콜백 (웹 전용 경로).
 *
 * 웹에서는 카카오 로그인 팝업이 이 URL(`/auth/kakao/callback?code=…`)로 돌아온다.
 * `maybeCompleteAuthSession()` 이 인가 결과를 원래 창(opener)으로 전달하고 팝업을
 * 닫아, 로그인 화면의 `promptAsync()` 가 resolve 된다. (root `_layout` 에서도
 * 모듈 로드 시 한 번 호출하지만, 라우트가 없으면 404 가 잠깐 번쩍이므로 이 화면을 둔다.)
 * 네이티브에서는 딥링크로 앱에 직접 복귀하므로 이 경로는 사용되지 않는다.
 */
export default function KakaoCallback() {
  useEffect(() => {
    WebBrowser.maybeCompleteAuthSession();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.brand} />
      <AppText color={colors.textSecondary} style={styles.text}>
        로그인 처리 중...
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: colors.bg,
  },
  text: { fontSize: 14, lineHeight: 20 },
});
