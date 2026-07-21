import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Ellipse, Path } from 'react-native-svg';

import { AppText } from '@/components/AppText';
import { colors, radius, stageAccent } from '@/theme';

type Stage = {
  title: string;
  desc: string;
  chips: string[];
  accent: { chipText: string; chipBg: string };
  onPress: () => void;
};

const STAGES: Stage[] = [
  {
    title: '계약 전',
    desc: '계약 전 위험 신호 사전 점검',
    chips: ['등기부 분석', '공시지가 비교', '근저당 현황'],
    accent: stageAccent.before,
    onPress: () => router.push('/pre-contract/checklist'),
  },
  {
    title: '계약 중',
    desc: '계약 진행 중 이상 징후 분석',
    chips: ['계약서 검토', '특약 위험도', '중개인 확인'],
    accent: stageAccent.during,
    onPress: () => router.push('/during-contract/checklist'),
  },
  {
    title: '계약 후',
    desc: '계약 후 피해 분석 및 대응 안내',
    chips: ['피해 유형', '법적 대응', '유사 판례'],
    accent: stageAccent.after,
    onPress: () => router.push('/after-contract/checklist'),
  },
];

function StageCard({ title, desc, chips, accent, onPress }: Stage) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.stageCard, pressed && styles.pressed]}>
      <View style={styles.stageTop}>
        <View style={styles.flex}>
          <AppText weight="bold" style={styles.stageTitle}>
            {title}
          </AppText>
          <AppText weight="medium" color={colors.textSecondary} style={styles.stageDesc}>
            {desc}
          </AppText>
        </View>
        <View style={styles.chevronCircle}>
          <Feather name="chevron-right" size={16} color={colors.textSecondary} />
        </View>
      </View>
      <View style={styles.chips}>
        {chips.map((c) => (
          <View key={c} style={[styles.chip, { backgroundColor: accent.chipBg }]}>
            <AppText weight="semibold" color={accent.chipText} style={styles.chipText}>
              {c}
            </AppText>
          </View>
        ))}
      </View>
    </Pressable>
  );
}

export default function Home() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.brand}>
          {/* SafeLens 마스코트 — 눈 두 개가 있는 집(스플래시 마크와 동일, Figma 10:2310). */}
          <Svg width={34} height={30} viewBox="0 0 83 73">
            <Path d="M0 24 L38.9 1.5 Q41.5 0 44.1 1.5 L83 24 L83 73 L0 73 Z" fill={colors.brand} />
            <Ellipse cx={30.5} cy={46.5} rx={10.5} ry={10.5} fill={colors.white} />
            <Ellipse cx={52.5} cy={46.5} rx={10.5} ry={10.5} fill={colors.white} />
            <Ellipse cx={32} cy={46.5} rx={6.5} ry={6.5} fill={colors.textPrimary} />
            <Ellipse cx={50.5} cy={46.5} rx={6.5} ry={6.5} fill={colors.textPrimary} />
          </Svg>
          <View>
            <AppText weight="semibold" color={colors.textSecondary} style={styles.brandKicker}>
              안전한 계약을 함께 보는 친구
            </AppText>
            <AppText weight="bold" style={styles.brandName}>
              세이프렌즈
            </AppText>
          </View>
        </View>
        <Pressable onPress={() => router.push('/notifications')} style={({ pressed }) => [styles.bell, pressed && styles.pressed]}>
          <Feather name="bell" size={16} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Pressable
          onPress={() => router.navigate('/house')}
          style={({ pressed }) => [styles.banner, pressed && styles.pressed]}
        >
          <View style={styles.bannerIcon}>
            <MaterialCommunityIcons name="office-building" size={20} color={colors.brand} />
          </View>
          <View style={styles.flex}>
            <AppText weight="bold" style={styles.bannerTitle}>
              내 집 정보를 등록하세요
            </AppText>
            <AppText color={colors.textSecondary} style={styles.bannerSub}>
              더 정확한 분석을 위해 아래 탭에서 입력해 주세요
            </AppText>
          </View>
          <Feather name="chevron-right" size={16} color={colors.textSecondary} />
        </Pressable>

        <View style={styles.sectionHead}>
          <AppText weight="bold" style={styles.sectionTitle}>
            계약 단계 선택
          </AppText>
          <AppText color={colors.textSecondary} style={styles.sectionSub}>
            현재 상황에 맞는 단계를 선택하세요
          </AppText>
        </View>

        <View style={styles.stageList}>
          {STAGES.map((s) => (
            <StageCard key={s.title} {...s} />
          ))}
        </View>

        <View style={styles.disclaimer}>
          <Feather name="info" size={16} color={colors.textSecondary} />
          <AppText color={colors.textSecondary} style={styles.disclaimerText}>
            분석 결과는 참고용이며 법적 효력이 없습니다. 입력 정보는 서버에 저장되지 않습니다.
          </AppText>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  pressed: { opacity: 0.9, transform: [{ scale: 0.985 }] },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandKicker: { fontSize: 10, lineHeight: 14 },
  brandName: { fontSize: 14, lineHeight: 20, color: colors.textPrimary },
  bell: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },

  body: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 },

  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.bannerBg,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.button,
    padding: 16,
  },
  bannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#D8D7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: { fontSize: 14, lineHeight: 20, color: colors.textPrimary },
  bannerSub: { fontSize: 12, lineHeight: 16, marginTop: 1 },

  sectionHead: { marginTop: 20 },
  sectionTitle: { fontSize: 16, lineHeight: 24, color: colors.textPrimary },
  sectionSub: { fontSize: 12, lineHeight: 16, marginTop: 1 },

  stageList: { marginTop: 12, gap: 12 },
  stageCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.button,
    padding: 16,
    gap: 12,
    shadowColor: '#E0E7FF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 1.5,
    elevation: 1,
  },
  stageTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stageTitle: { fontSize: 16, lineHeight: 24, color: colors.textPrimary },
  stageDesc: { fontSize: 12, lineHeight: 16, marginTop: 2 },
  chevronCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.chevronBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2 },
  chipText: { fontSize: 10, lineHeight: 15 },

  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.button,
    padding: 14,
  },
  disclaimerText: { flex: 1, fontSize: 11, lineHeight: 18 },
});
