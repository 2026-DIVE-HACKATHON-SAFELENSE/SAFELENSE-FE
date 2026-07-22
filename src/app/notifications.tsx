import { Feather, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { type ReactNode, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

type Noti = { id: string; category: Category; title: string; body: string; time: string; unread: boolean };
type Section = { label: string; items: Noti[] };

const SECTIONS: Section[] = [
  {
    label: '오늘',
    items: [
      {
        id: 'n1',
        category: '분석',
        title: 'AI 분석 완료',
        body: "'계약 전' 분석 리포트가 생성되었습니다. 위험 지수 62점 · 중위험",
        time: '방금 전',
        unread: true,
      },
      {
        id: 'n2',
        category: '뉴스',
        title: '전세 사기 주의보',
        body: '인천 미추홀구 일대에서 동일 수법의 전세 사기 피해 사례가 신규 접수되었습니다.',
        time: '3시간 전',
        unread: true,
      },
    ],
  },
  {
    label: '어제',
    items: [
      {
        id: 'n3',
        category: '시스템',
        title: '앱 업데이트 완료',
        body: '전세 안심 v1.0.1이 적용되었습니다. AI 유사 사례 데이터베이스가 업데이트됐어요.',
        time: '어제',
        unread: false,
      },
      {
        id: 'n4',
        category: '분석',
        title: 'AI 분석 완료',
        body: "'계약 후' 분석 리포트가 생성되었습니다. 위험 지수 41점 · 중위험",
        time: '어제',
        unread: false,
      },
    ],
  },
  {
    label: '이전',
    items: [
      {
        id: 'n5',
        category: '뉴스',
        title: '정책 변경 안내',
        body: '2026년 7월부터 전세보증금 반환 보증 가입 요건이 완화되었습니다.',
        time: '3일 전',
        unread: false,
      },
      {
        id: 'n6',
        category: '위험',
        title: '위험 신호 해제',
        body: '등록 주소의 가압류 등기가 말소되었습니다. 위험 지수가 낮아졌습니다.',
        time: '3일 전',
        unread: false,
      },
    ],
  },
];

const ALL_IDS = SECTIONS.flatMap((s) => s.items.map((n) => n.id));

/** A single notification row: category icon + badge/time/dot + title + body. */
function NotiCard({ item, unread, onPress }: { item: Noti; unread: boolean; onPress: () => void }) {
  const cat = CATEGORY[item.category];
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, unread ? styles.cardUnread : styles.cardRead, pressed && styles.pressed]}>
      <View style={[styles.iconBox, { backgroundColor: cat.bg }]}>{cat.icon(cat.text)}</View>
      <View style={styles.flex}>
        <View style={styles.cardTop}>
          <View style={[styles.badge, { backgroundColor: cat.bg }]}>
            <AppText weight="semibold" color={cat.text} style={styles.badgeText}>
              {item.category}
            </AppText>
          </View>
          <View style={styles.flex} />
          <AppText color={colors.textSecondary} style={styles.time}>
            {item.time}
          </AppText>
          {unread ? <View style={styles.dot} /> : null}
        </View>
        <AppText weight="bold" style={styles.title}>
          {item.title}
        </AppText>
        <AppText color={colors.textSecondary} style={styles.cardBody}>
          {item.body}
        </AppText>
      </View>
    </Pressable>
  );
}

export default function Notifications() {
  const insets = useSafeAreaInsets();
  // Track which notifications have been read; seed with the ones already read.
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set(SECTIONS.flatMap((s) => s.items.filter((n) => !n.unread).map((n) => n.id))));

  const unreadCount = useMemo(() => ALL_IDS.filter((id) => !readIds.has(id)).length, [readIds]);
  const markOne = (id: string) => setReadIds((prev) => new Set(prev).add(id));
  const markAll = () => setReadIds(new Set(ALL_IDS));

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

      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        {SECTIONS.map((section) => (
          <View key={section.label} style={styles.section}>
            <AppText weight="semibold" color={colors.textSecondary} style={styles.sectionLabel}>
              {section.label}
            </AppText>
            <View style={styles.list}>
              {section.items.map((item) => (
                <NotiCard key={item.id} item={item} unread={!readIds.has(item.id)} onPress={() => markOne(item.id)} />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
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
