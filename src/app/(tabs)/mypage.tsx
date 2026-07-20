import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/auth';
import { AppText } from '@/components/AppText';
import { colors, gradient, radius } from '@/theme';

const CARD_GRADIENT = gradient.brand;

/** Stat pill shown inside the purple card (logged-in). */
function StatPill({ num, label }: { num: string; label: string }) {
  return (
    <View style={styles.pill}>
      <AppText weight="bold" color={colors.white} style={styles.pillNum}>
        {num}
      </AppText>
      <AppText color="rgba(255,255,255,0.7)" style={styles.pillLabel}>
        {label}
      </AppText>
    </View>
  );
}

/** White stat card shown below the purple card (guest). */
function StatCard({ num, label, color }: { num: string; label: string; color: string }) {
  return (
    <View style={styles.statCard}>
      <AppText weight="bold" color={color} style={styles.statNum}>
        {num}
      </AppText>
      <AppText color={colors.textSecondary} style={styles.statLabel}>
        {label}
      </AppText>
    </View>
  );
}

export default function MyPage() {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <AppText weight="bold" style={styles.title}>
          마이페이지
        </AppText>
      </View>

      <View style={styles.body}>
        <LinearGradient colors={CARD_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.userCard}>
          <View style={styles.userRow}>
            <View style={styles.avatar}>
              <Feather name="user" size={24} color={colors.white} />
            </View>
            <View style={styles.flex}>
              <AppText weight="bold" color={colors.white} style={styles.name}>
                {user ? user.name : '게스트 사용자'}
              </AppText>
              <AppText color="rgba(255,255,255,0.7)" style={styles.sub}>
                {user ? user.email : '로그인하면 분석 내역을 저장할 수 있습니다'}
              </AppText>
            </View>
          </View>

          {user ? (
            <View style={styles.pillRow}>
              <StatPill num="3" label="분석 완료" />
              <StatPill num="1" label="저장된 리포트" />
              <StatPill num="0" label="위험 경보" />
            </View>
          ) : (
            <Pressable
              onPress={() => router.navigate('/login')}
              style={({ pressed }) => [styles.loginBtn, pressed && styles.pressed]}
            >
              <AppText weight="semibold" color={colors.white} style={styles.loginText}>
                로그인 / 회원가입
              </AppText>
            </Pressable>
          )}
        </LinearGradient>

        {user ? (
          <>
            <Pressable
              onPress={() => {
                signOut();
                router.replace('/login');
              }}
              style={({ pressed }) => [styles.logoutBtn, pressed && styles.pressed]}
            >
              <Feather name="log-out" size={16} color={colors.danger} />
              <AppText weight="semibold" color={colors.danger} style={styles.logoutText}>
                로그아웃
              </AppText>
            </Pressable>
            <AppText color={colors.textSecondary} style={styles.version}>
              세이프렌즈 v1.0.0
            </AppText>
          </>
        ) : (
          <>
            <View style={styles.statRow}>
              <StatCard num="0" label="분석 완료" color={colors.brand} />
              <StatCard num="0" label="저장된 리포트" color={colors.mint} />
            </View>
            <AppText color={colors.textSecondary} style={styles.version}>
              세이프렌즈 v1.0.0
            </AppText>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  pressed: { opacity: 0.85 },
  header: { paddingHorizontal: 20, paddingVertical: 14 },
  title: { fontSize: 24, lineHeight: 32, color: colors.textPrimary },
  body: { paddingHorizontal: 20 },

  userCard: {
    borderRadius: radius.button,
    padding: 16,
    shadowColor: '#C6D2FF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 6,
  },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 16, lineHeight: 24 },
  sub: { fontSize: 11, lineHeight: 16, marginTop: 2 },

  pillRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  pill: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.pill,
    paddingVertical: 10,
    alignItems: 'center',
  },
  pillNum: { fontSize: 18, lineHeight: 28 },
  pillLabel: { fontSize: 10, lineHeight: 15, marginTop: 2 },

  loginBtn: {
    marginTop: 12,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginText: { fontSize: 14, lineHeight: 20 },

  statRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.button,
    paddingVertical: 20,
    alignItems: 'center',
    shadowColor: '#EEF2FF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 1.5,
    elevation: 1,
  },
  statNum: { fontSize: 30, lineHeight: 36 },
  statLabel: { fontSize: 12, lineHeight: 16, marginTop: 4 },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    height: 52,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.button,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 2,
  },
  logoutText: { fontSize: 14, lineHeight: 20 },
  version: { fontSize: 10, lineHeight: 15, textAlign: 'center', marginTop: 20 },
});
