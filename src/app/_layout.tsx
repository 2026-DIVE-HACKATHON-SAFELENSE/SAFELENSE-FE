import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/auth';
// Web-only side effect: constrain the SPA to a centered mobile-width column on
// desktop (no phone-frame chrome). No-op on native.
import '@/mobileWeb';
import { colors } from '@/theme';

// Keep the native splash up until Pretendard is ready, so text never flashes
// in a fallback font.
SplashScreen.preventAutoHideAsync();

// Web: when the Kakao OAuth popup redirects back to /auth/kakao/callback, this
// hands the result to the opener window and closes the popup so promptAsync()
// resolves. Runs on every module load (incl. the popup's); no-op on native.
WebBrowser.maybeCompleteAuthSession();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Pretendard-Regular': require('../../assets/fonts/Pretendard-Regular.otf'),
    'Pretendard-Medium': require('../../assets/fonts/Pretendard-Medium.otf'),
    'Pretendard-SemiBold': require('../../assets/fonts/Pretendard-SemiBold.otf'),
    'Pretendard-Bold': require('../../assets/fonts/Pretendard-Bold.otf'),
    // @expo/vector-icons glyph fonts don't reliably auto-load on web — icons render
    // as tofu (□) boxes. Preload the sets the app uses so they're ready before first
    // paint (native auto-loads these; the explicit load is what fixes web).
    ...Feather.font,
    ...Ionicons.font,
    ...MaterialCommunityIcons.font,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style="dark" />
          <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade',
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="login" />
          <Stack.Screen name="auth/kakao/callback" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="notifications" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="pre-contract/checklist" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="pre-contract/behaviors" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="pre-contract/risk-input" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="pre-contract/analyzing" options={{ gestureEnabled: false }} />
          <Stack.Screen name="pre-contract/report" options={{ gestureEnabled: false }} />
          <Stack.Screen name="during-contract/checklist" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="during-contract/behaviors" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="during-contract/risk-input" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="during-contract/analyzing" options={{ gestureEnabled: false }} />
          <Stack.Screen name="during-contract/report" options={{ gestureEnabled: false }} />
          <Stack.Screen name="after-contract/checklist" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="after-contract/behaviors" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="after-contract/risk-input" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="after-contract/analyzing" options={{ gestureEnabled: false }} />
          <Stack.Screen name="after-contract/report" options={{ gestureEnabled: false }} />
          </Stack>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = { root: { flex: 1 } } as const;
