import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { type ComponentProps, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { WideButton } from '@/components/WideButton';
import { colors, radius } from '@/theme';

type FeatherName = ComponentProps<typeof Feather>['name'];
type Status = 'safe' | 'warn' | 'danger';
type Row = { status: Status; label: string; sub: string; value: string };

const STATUS: Record<Status, { bg: string; icon: FeatherName; iconColor: string; value: string }> = {
  safe: { bg: '#ECFDF5', icon: 'check-circle', iconColor: colors.success, value: '#007A55' },
  warn: { bg: '#FFFBEB', icon: 'alert-triangle', iconColor: '#F59E0B', value: '#BB4D00' },
  danger: { bg: '#FEF2F2', icon: 'alert-circle', iconColor: colors.danger, value: '#C10007' },
};

// Tab 0 (공공데이터 분석) is from the Figma. Tabs 1–3 have no design content,
// so these are representative summaries in the same visual language.
const TABS = ['공공데이터 분석', '유사사례 분석', '체크리스트 요약', '권고사항'] as const;
const HEADINGS = ['공공 데이터 분석', '유사 사례 분석', '체크리스트 요약', '권고사항'];

const PUBLIC_ROWS: Row[] = [
  { status: 'safe', label: '근저당 선순위 채권', sub: '안전 범위', value: '6,200만원' },
  { status: 'safe', label: '공시지가 대비 비율', sub: '안전 범위', value: '68.3%' },
  { status: 'warn', label: '건물 연식', sub: '보증보험 제한 가능성', value: '築 21년 (2003년)' },
  { status: 'danger', label: '소유권 이전', sub: '비정상적 잦은 변경', value: '3회 (최근 2년)' },
];
const SIMILAR_ROWS: Row[] = [
  { status: 'warn', label: '인근 오피스텔 깡통전세', sub: '2023 · 화성시', value: '유사도 82%' },
  { status: 'danger', label: '동일 임대인 다물건 보유', sub: '보증금 미반환 이력', value: '유사도 74%' },
  { status: 'safe', label: '표준계약·보증보험 가입', sub: '피해 예방 사례', value: '유사도 61%' },
];
const SUMMARY_ROWS: Row[] = [
  { status: 'safe', label: '서류 체크리스트', sub: '필수 항목 확인 권장', value: '점검 필요' },
  { status: 'safe', label: '행태 위험 신호', sub: '의심 정황 낮음', value: '양호' },
];
const RECOS = [
  '전세보증보험(HUG·SGI) 가입을 진행하세요.',
  '계약 당일 확정일자와 전입신고를 완료하세요.',
  '잔금일 당일 등기부등본을 다시 열람하세요.',
  '특약으로 선순위 근저당 말소 조건을 명시하세요.',
];

function DataRow({ status, label, sub, value }: Row) {
  const cfg = STATUS[status];
  return (
    <View style={[styles.dataRow, { backgroundColor: cfg.bg }]}>
      <Feather name={cfg.icon} size={16} color={cfg.iconColor} style={styles.dataIcon} />
      <View style={styles.flex}>
        <AppText weight="semibold" style={styles.dataLabel}>
          {label}
        </AppText>
        <AppText color={colors.textSecondary} style={styles.dataSub}>
          {sub}
        </AppText>
      </View>
      <AppText weight="bold" color={cfg.value} style={styles.dataValue}>
        {value}
      </AppText>
    </View>
  );
}

function TabContent({ tab }: { tab: number }) {
  const rows = tab === 0 ? PUBLIC_ROWS : tab === 1 ? SIMILAR_ROWS : tab === 2 ? SUMMARY_ROWS : null;
  return (
    <View style={styles.tabCard}>
      <AppText weight="bold" style={styles.tabHeading}>
        {HEADINGS[tab]}
      </AppText>
      <View style={styles.rows}>
        {rows
          ? rows.map((r) => <DataRow key={r.label} {...r} />)
          : RECOS.map((text) => (
              <View key={text} style={styles.recoRow}>
                <Feather name="check-circle" size={16} color={colors.success} style={styles.dataIcon} />
                <AppText color={colors.textPrimary} style={styles.recoText}>
                  {text}
                </AppText>
              </View>
            ))}
      </View>
    </View>
  );
}

export default function Report() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState(0);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}
        >
          <Feather name="chevron-left" size={20} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.back} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <AppText weight="semibold" color={colors.brand} style={styles.kicker}>
          Report
        </AppText>
        <AppText weight="bold" style={styles.title}>
          내 계약 분석 리포트
        </AppText>
        <AppText color={colors.textSecondary} style={styles.subtitle}>
          리포트를 확인해주세요.
        </AppText>

        {/* 종합 위험 지수 */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreTop}>
            <View style={styles.flex}>
              <AppText weight="semibold" color={colors.textSecondary} style={styles.scoreCaption}>
                종합 위험 지수
              </AppText>
              <View style={styles.scoreRow}>
                <AppText weight="bold" color="#10B981" style={styles.scoreNum}>
                  37
                </AppText>
                <AppText weight="semibold" color={colors.textSecondary} style={styles.scoreMax}>
                  /100
                </AppText>
              </View>
              <View style={styles.riskRow}>
                <View style={styles.riskDot} />
                <AppText weight="bold" color="#10B981" style={styles.riskLabel}>
                  저위험
                </AppText>
              </View>
            </View>
            <View style={styles.warnTile}>
              <Feather name="alert-triangle" size={28} color="#10B981" />
            </View>
          </View>

          <View style={styles.gaugeTrack}>
            <View style={styles.gaugeFill} />
          </View>
          <View style={styles.axis}>
            <AppText weight="semibold" color="#009966" style={styles.axisLabel}>
              저위험
            </AppText>
            <AppText weight="semibold" color="#FE9A00" style={styles.axisLabel}>
              중위험
            </AppText>
            <AppText weight="semibold" color={colors.danger} style={styles.axisLabel}>
              고위험
            </AppText>
          </View>
        </View>

        {/* 분석 대상 */}
        <View style={styles.targetCard}>
          <AppText weight="semibold" color={colors.textSecondary} style={styles.scoreCaption}>
            분석 대상
          </AppText>
          <AppText weight="bold" style={styles.targetName}>
            화성시 안녕동
          </AppText>
          <View style={styles.targetMeta}>
            <AppText color={colors.textSecondary} style={styles.targetMetaText}>
              보증금 2,000만원
            </AppText>
            <AppText color={colors.textSecondary} style={styles.targetMetaText}>
              오피스텔
            </AppText>
          </View>
        </View>

        {/* 세그먼트 탭 */}
        <View style={styles.segment}>
          {TABS.map((t, i) => (
            <Pressable
              key={t}
              onPress={() => setTab(i)}
              style={[styles.segItem, i === tab && styles.segActive]}
            >
              <AppText color={i === tab ? colors.white : '#000000'} style={styles.segText} numberOfLines={1}>
                {t}
              </AppText>
            </Pressable>
          ))}
        </View>

        <TabContent tab={tab} />

        {/* 전세피해지원센터 */}
        <LinearGradient
          colors={['#4361EE', '#432DD7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ctaCard}
        >
          <AppText weight="bold" color="rgba(255,255,255,0.8)" style={styles.ctaKicker}>
            피해가 의심되시나요?
          </AppText>
          <AppText weight="bold" color={colors.white} style={styles.ctaOrg}>
            전세피해지원센터
          </AppText>
          <AppText weight="bold" color={colors.white} style={styles.ctaPhone}>
            1533-8119
          </AppText>
          <AppText color="rgba(255,255,255,0.7)" style={styles.ctaNote}>
            무료 법률 상담 · 24시간 운영
          </AppText>
        </LinearGradient>

        {/* 면책 */}
        <View style={styles.disclaimer}>
          <Feather name="info" size={16} color={colors.textSecondary} />
          <AppText color={colors.textSecondary} style={styles.disclaimerText}>
            본 리포트는 참고용이며 법적 효력이 없습니다. 계약의 최종 판단은 본인에게 있습니다.
          </AppText>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.flex}>
          <WideButton label="새 분석" variant="outline" height={50} labelSize={14} onPress={() => router.dismissAll()} />
        </View>
        <View style={styles.flex}>
          <WideButton
            label="저장"
            height={50}
            labelSize={14}
            icon={<Feather name="download" size={16} color={colors.white} />}
            iconPosition="leading"
            onPress={() => Alert.alert('저장 완료', '리포트가 저장되었습니다. (데모)')}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  pressed: { opacity: 0.6 },

  topBar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
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

  body: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 },
  kicker: { fontSize: 12, lineHeight: 16 },
  title: { fontSize: 24, lineHeight: 32, color: colors.textPrimary, marginTop: 4 },
  subtitle: { fontSize: 14, lineHeight: 20, marginTop: 4 },

  scoreCard: {
    marginTop: 16,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#D0FAE5',
    borderRadius: radius.card,
    padding: 20,
  },
  scoreTop: { flexDirection: 'row', alignItems: 'flex-start' },
  scoreCaption: { fontSize: 12, lineHeight: 16 },
  scoreRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 4 },
  scoreNum: { fontSize: 48, lineHeight: 50 },
  scoreMax: { fontSize: 18, lineHeight: 24, marginBottom: 6, marginLeft: 2 },
  riskRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  riskDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  riskLabel: { fontSize: 16, lineHeight: 22 },
  warnTile: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.09)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeTrack: {
    marginTop: 16,
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    overflow: 'hidden',
  },
  gaugeFill: { width: '37%', height: 10, borderRadius: radius.pill, backgroundColor: '#10B981' },
  axis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  axisLabel: { fontSize: 10, lineHeight: 15 },

  targetCard: {
    marginTop: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.button,
    padding: 16,
  },
  targetName: { fontSize: 14, lineHeight: 20, color: colors.textPrimary, marginTop: 4 },
  targetMeta: { flexDirection: 'row', gap: 12, marginTop: 4 },
  targetMetaText: { fontSize: 12, lineHeight: 16 },

  segment: {
    marginTop: 16,
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    overflow: 'hidden',
  },
  segItem: { flex: 1, paddingVertical: 7, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white },
  segActive: { backgroundColor: colors.brand },
  segText: { fontSize: 10, lineHeight: 15 },

  tabCard: {
    marginTop: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.button,
    padding: 16,
  },
  tabHeading: { fontSize: 14, lineHeight: 20, color: colors.textPrimary },
  rows: { marginTop: 12, gap: 8 },
  dataRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderRadius: radius.card, padding: 12 },
  dataIcon: { marginTop: 2 },
  dataLabel: { fontSize: 12, lineHeight: 16, color: colors.textPrimary },
  dataSub: { fontSize: 10, lineHeight: 14, marginTop: 1 },
  dataValue: { fontSize: 12, lineHeight: 16 },
  recoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 2 },
  recoText: { flex: 1, fontSize: 13, lineHeight: 19 },

  ctaCard: { marginTop: 16, borderRadius: radius.button, padding: 16 },
  ctaKicker: { fontSize: 12, lineHeight: 16 },
  ctaOrg: { fontSize: 18, lineHeight: 24, marginTop: 4 },
  ctaPhone: { fontSize: 24, lineHeight: 30, marginTop: 2, letterSpacing: 0.6 },
  ctaNote: { fontSize: 12, lineHeight: 16, marginTop: 4 },

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
  disclaimerText: { flex: 1, fontSize: 10, lineHeight: 16 },

  footer: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingTop: 12 },
});
