import { Feather, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { type ReactNode, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationItem,
  type NotificationType,
} from '@/api/notifications';
import { useAuth } from '@/auth';
import { AppText } from '@/components/AppText';
import { colors, radius } from '@/theme';

type Category = '분석' | '뉴스' | '시스템' | '위험';

/** Per-category badge + icon colors (Figma 알림, node 116:251). */
const CATEGORY: Record<Category, { text: string; bg: string; icon: (color: string) => ReactNode }> = {
  분석: { text: '#4361EE', bg: '#E0E7FF', icon: (c) => <Feather name="cpu" size={18} color={c} /> },
  뉴스: { text: '#E17100', bg: '#FEF3C6', icon: (c) => <Ionicons name="megaphone" size={18} color={c} /> },
  시스템: { text: '#62748E', bg: '#F1F5F9', icon: (c) => <Feather name="info" size={18} color={c} /> },
  위험: { text: '#FB2C36', bg: '#FFE2E2', icon: (c) => <Feather name="shield" size={18} color={c} /> },
};

const TYPE_TO_CATEGORY: Record<NotificationType, Category> = {
  ANALYSIS: '분석',
  NEWS: '뉴스',
  SYSTEM: '시스템',
};

/** createdAt → "방금 전 / N분 전 / N시간 전 / 어제 / N일 전". */
function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return '방금 전';
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(hr / 24);
  if (day === 1) return '어제';
  if (day < 7) return `${day}일 전`;
  return new Date(iso).toLocaleDateString('ko-KR');
}

/** createdAt → 섹션 라벨 (달력 기준 오늘/어제/이전). */
function sectionLabel(iso: string): '오늘' | '어제' | '이전' {
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const t = new Date(iso).getTime();
  if (t >= startToday) return '오늘';
  if (t >= startToday - 86400000) return '어제';
  return '이전';
}

/** 최신순 정렬 후 오늘/어제/이전으로 묶는다(빈 섹션 제외). */
function groupByDate(items: NotificationItem[]): { label: string; items: NotificationItem[] }[] {
  const sorted = [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const order: ('오늘' | '어제' | '이전')[] = ['오늘', '어제', '이전'];
  return order
    .map((label) => ({ label, items: sorted.filter((n) => sectionLabel(n.createdAt) === label) }))
    .filter((s) => s.items.length > 0);
}

/** 로그인 전/오류 시 화면이 비지 않도록 쓰는 대표 데모 알림. */
function demoNotifications(): NotificationItem[] {
  const now = Date.now();
  const min = 60000;
  const hr = 3600000;
  const day = 86400000;
  return [
    { id: 1, type: 'ANALYSIS', title: 'AI 분석 완료', body: "'계약 전' 분석 리포트가 생성되었습니다. 위험 지수 62점 · 중위험", isRead: false, createdAt: new Date(now - 2 * min).toISOString() },
    { id: 2, type: 'NEWS', title: '전세 사기 주의보', body: '인천 미추홀구 일대에서 동일 수법의 전세 사기 피해 사례가 신규 접수되었습니다.', isRead: false, createdAt: new Date(now - 3 * hr).toISOString() },
    { id: 3, type: 'SYSTEM', title: '앱 업데이트 완료', body: '전세 안심 v1.0.1이 적용되었습니다. AI 유사 사례 데이터베이스가 업데이트됐어요.', isRead: true, createdAt: new Date(now - day - 2 * hr).toISOString() },
    { id: 4, type: 'ANALYSIS', title: 'AI 분석 완료', body: "'계약 후' 분석 리포트가 생성되었습니다. 위험 지수 41점 · 중위험", isRead: true, createdAt: new Date(now - day - 5 * hr).toISOString() },
    { id: 5, type: 'NEWS', title: '정책 변경 안내', body: '2026년 7월부터 전세보증금 반환 보증 가입 요건이 완화되었습니다.', isRead: true, createdAt: new Date(now - 3 * day).toISOString() },
  ];
}

/** A single notification row: category icon + badge/time/dot + title + body. */
function NotiCard({
  category,
  title,
  body,
  time,
  unread,
  onPress,
}: {
  category: Category;
  title: string;
  body: string;
  time: string;
  unread: boolean;
  onPress: () => void;
}) {
  const cat = CATEGORY[category];
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, unread ? styles.cardUnread : styles.cardRead, pressed && styles.pressed]}>
      <View style={[styles.iconBox, { backgroundColor: cat.bg }]}>{cat.icon(cat.text)}</View>
      <View style={styles.flex}>
        <View style={styles.cardTop}>
          <View style={[styles.badge, { backgroundColor: cat.bg }]}>
            <AppText weight="semibold" color={cat.text} style={styles.badgeText}>
              {category}
            </AppText>
          </View>
          <View style={styles.flex} />
          <AppText color={colors.textSecondary} style={styles.time}>
            {time}
          </AppText>
          {unread ? <View style={styles.dot} /> : null}
        </View>
        <AppText weight="bold" style={styles.title}>
          {title}
        </AppText>
        <AppText color={colors.textSecondary} style={styles.cardBody}>
          {body}
        </AppText>
      </View>
    </Pressable>
  );
}

export default function Notifications() {
  const insets = useSafeAreaInsets();
  const { status } = useAuth();
  // null = 로딩 중. isReal = 서버 데이터(=읽음 처리를 서버에도 반영)인지 여부.
  const [items, setItems] = useState<NotificationItem[] | null>(null);
  const [isReal, setIsReal] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    let alive = true;
    (async () => {
      if (status !== 'authenticated') {
        if (alive) {
          setItems(demoNotifications());
          setIsReal(false);
        }
        return;
      }
      try {
        const list = await listNotifications();
        if (alive) {
          setItems(list.notifications);
          setIsReal(true);
        }
      } catch {
        if (alive) {
          setItems(demoNotifications());
          setIsReal(false);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [status]);

  const markOne = (id: number) => {
    setItems((prev) => prev?.map((n) => (n.id === id ? { ...n, isRead: true } : n)) ?? prev);
    if (isReal) markNotificationRead(id).catch(() => {});
  };
  const markAll = () => {
    setItems((prev) => prev?.map((n) => ({ ...n, isRead: true })) ?? prev);
    if (isReal) markAllNotificationsRead().catch(() => {});
  };

  const unreadCount = items ? items.filter((n) => !n.isRead).length : 0;
  const sections = items ? groupByDate(items) : [];

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
          <Feather name="chevron-left" size={20} color={colors.textPrimary} />
        </Pressable>
        <AppText weight="bold" style={styles.headerTitle}>
          알림
        </AppText>
        {/* Invisible spacer the same size as the back button, so the title stays centered. */}
        <View style={styles.spacer} />
      </View>

      <View style={styles.subBar}>
        <AppText color={colors.textSecondary} style={styles.unreadText}>
          읽지 않은 알림 {unreadCount}개
        </AppText>
        <Pressable onPress={markAll} hitSlop={8} style={({ pressed }) => [styles.markAll, pressed && styles.pressed]}>
          <AppText weight="semibold" color={colors.brand} style={styles.markAllText}>
            모두 읽음
          </AppText>
        </Pressable>
      </View>

      {items === null ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.brand} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
          {sections.map((section) => (
            <View key={section.label} style={styles.section}>
              <AppText weight="semibold" color={colors.textSecondary} style={styles.sectionLabel}>
                {section.label}
              </AppText>
              <View style={styles.list}>
                {section.items.map((item) => (
                  <NotiCard
                    key={item.id}
                    category={TYPE_TO_CATEGORY[item.type]}
                    title={item.title}
                    body={item.body}
                    time={relativeTime(item.createdAt)}
                    unread={!item.isRead}
                    onPress={() => markOne(item.id)}
                  />
                ))}
              </View>
            </View>
          ))}
          {sections.length === 0 ? (
            <View style={styles.empty}>
              <AppText color={colors.textSecondary} style={styles.emptyText}>
                받은 알림이 없습니다.
              </AppText>
            </View>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  pressed: { opacity: 0.7 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  back: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E0E7FF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 1.5,
    elevation: 2,
  },
  spacer: { width: 36, height: 36 },
  headerTitle: { fontSize: 16, lineHeight: 24, color: colors.textPrimary },

  subBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  unreadText: { fontSize: 12, lineHeight: 16 },
  markAll: { backgroundColor: colors.bannerBg, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6 },
  markAllText: { fontSize: 12, lineHeight: 16 },

  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { paddingVertical: 48, alignItems: 'center' },
  emptyText: { fontSize: 13, lineHeight: 20 },

  body: { paddingHorizontal: 20, paddingTop: 8 },
  section: { marginTop: 12 },
  sectionLabel: { fontSize: 12, lineHeight: 16 },
  list: { marginTop: 8, gap: 8 },

  card: { flexDirection: 'row', gap: 12, borderRadius: radius.button, borderWidth: 1, padding: 14 },
  cardUnread: { backgroundColor: 'rgba(67, 97, 238, 0.03)', borderColor: 'rgba(67, 97, 238, 0.15)' },
  cardRead: {
    backgroundColor: colors.white,
    borderColor: colors.hairline,
    shadowColor: '#EEF2FF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 1.5,
    elevation: 1,
  },
  iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: { borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontSize: 10, lineHeight: 15 },
  time: { fontSize: 10, lineHeight: 15 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.brand },
  title: { fontSize: 14, lineHeight: 20, color: colors.textPrimary, marginTop: 4 },
  cardBody: { fontSize: 12, lineHeight: 18, marginTop: 2 },
});
