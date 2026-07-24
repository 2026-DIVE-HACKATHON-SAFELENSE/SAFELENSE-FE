import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { type ComponentProps, useEffect, useRef, useState } from 'react';
import { Alert, Animated, Easing, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { type AnalysisResult, fetchReportPdfBlob, getAnalysis, gradeDescriptor } from '@/api/analysis';
import { buildingTypeLabel, getProperty, type Property } from '@/api/property';
import { AppText } from '@/components/AppText';
import { WideButton } from '@/components/WideButton';
import { downloadBlob, isDownloadSupported } from '@/downloadBlob';
import { getSession } from '@/flow/analysisSession';
import { colors, gradient, radius } from '@/theme';

const RISK_SCORE = 37;

type FeatherName = ComponentProps<typeof Feather>['name'];
type Status = 'safe' | 'warn' | 'danger';
type Row = { status: Status; label: string; sub: string; value: string };

const STATUS: Record<Status, { bg: string; icon: FeatherName; iconColor: string; value: string }> = {
  safe: { bg: '#ECFDF5', icon: 'check-circle', iconColor: colors.success, value: colors.greenDeep },
  warn: { bg: '#FFFBEB', icon: 'alert-triangle', iconColor: '#F59E0B', value: '#BB4D00' },
  danger: { bg: '#FEF2F2', icon: 'x-circle', iconColor: colors.danger, value: '#C10007' },
};

// 4 세그먼트 탭 (Figma "분석 카드" 48:5304).
const TABS = ['공공데이터 분석', '유사사례 분석', '체크리스트 요약', '권고사항'] as const;
const HEADINGS = ['공공 데이터 분석', 'AI 유사 사례 분석', '체크리스트 요약', '권고사항'];

// Tab 0 — 공공데이터 분석.
const PUBLIC_ROWS: Row[] = [
  { status: 'safe', label: '근저당 선순위 채권', sub: '안전 범위', value: '6,200만원' },
  { status: 'safe', label: '공시지가 대비 비율', sub: '안전 범위', value: '68.3%' },
  { status: 'warn', label: '건물 연식', sub: '보증보험 제한 가능성', value: '築 21년 (2003년)' },
  { status: 'danger', label: '소유권 이전', sub: '비정상적 잦은 변경', value: '3회 (최근 2년)' },
];

// Tab 1 — AI 유사 사례 분석.
type CaseTag = 'confirmed' | 'investigating';
type SimilarCase = { title: string; meta: string; similarity: number; desc: string; tag: CaseTag; barColor: string };
const TAG_STYLE: Record<CaseTag, { label: string; text: string; bg: string }> = {
  confirmed: { label: '피해 확정', text: '#E7000B', bg: '#FFE2E2' },
  investigating: { label: '수사 중', text: '#BB4D00', bg: '#FEF3C6' },
};
const SIMILAR_CASES: SimilarCase[] = [
  {
    title: '서울 마포구 다세대 전세 사기',
    meta: '2024.03 · 2억 4,000만원',
    similarity: 70,
    desc: '근저당 초과 설정 후 경매 진행. 보증금 전액 손실.',
    tag: 'confirmed',
    barColor: '#F59E0B',
  },
  {
    title: '인천 미추홀구 빌라 집중 피해',
    meta: '2023.11 · 1억 8,000만원',
    similarity: 56,
    desc: '이중 계약 후 잠적. 피해자 43명 발생.',
    tag: 'confirmed',
    barColor: '#7B8BB2',
  },
  {
    title: '서울 강서구 오피스텔 사기 의심',
    meta: '2024.01 · 1억 2,000만원',
    similarity: 51,
    desc: '계약 후 선순위 근저당 추가 설정.',
    tag: 'investigating',
    barColor: '#7B8BB2',
  },
];

// Tab 2 — 체크리스트 요약 (2개 스탯 카드).
type SummaryStat = { label: string; num: string; unit: string; note: string; tint: string; border: string; accent: string; noteTint: boolean };
const SUMMARY_STATS: SummaryStat[] = [
  { label: '미확인 서류', num: '0', unit: '건', note: '모두 확인', tint: '#FEF2F2', border: '#FFE2E2', accent: '#E7000B', noteTint: false },
  { label: '위험 행태', num: '1', unit: '건 감지', note: '소유권 잦은 변경', tint: '#FFFBEB', border: '#FEF3C6', accent: '#BB4D00', noteTint: true },
];

// Tab 3 — 권고사항 (우선순위 뱃지 + 안내).
type Priority = 'immediate' | 'essential' | 'recommended';
const PRIORITY: Record<Priority, { label: string; text: string; bg: string }> = {
  immediate: { label: '즉시', text: '#E7000B', bg: '#FFE2E2' },
  essential: { label: '필수', text: '#F54900', bg: '#FFEDD4' },
  recommended: { label: '권장', text: '#155DFC', bg: '#DBEAFE' },
};
const RECOS: { priority: Priority; text: string }[] = [
  { priority: 'immediate', text: '등기부등본을 직접 발급받아 근저당·가압류 현황을 확인하세요' },
  { priority: 'immediate', text: '공인중개사 자격을 국가공간정보포털에서 직접 조회하세요' },
  { priority: 'essential', text: 'HUG(1566-9009)에 전세보증보험 가입 가능 여부를 문의하세요' },
  { priority: 'essential', text: '보증금이 공시지가의 70%를 초과하는지 반드시 확인하세요' },
  { priority: 'recommended', text: '계약 전 전세피해지원센터(1533-8119)에 무료 상담을 받으세요' },
];

/** 천 단위 콤마 (Hermes Intl 미지원 대비 직접 포맷). */
const formatManwon = (n: number): string => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

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

/** Tab 1 — a single matched 전세 피해 사례 with a similarity bar + status tag. */
function SimilarCaseCard({ item, first }: { item: SimilarCase; first: boolean }) {
  const tag = TAG_STYLE[item.tag];
  return (
    <View style={[styles.caseCard, !first && styles.caseDivider]}>
      <View style={styles.caseHead}>
        <View style={styles.flex}>
          <AppText weight="bold" style={styles.caseTitle}>
            {item.title}
          </AppText>
          <AppText color={colors.textSecondary} style={styles.caseMeta}>
            {item.meta}
          </AppText>
        </View>
        <View style={styles.caseSimBox}>
          <AppText weight="bold" color={item.barColor} style={styles.caseSim}>
            {item.similarity}%
          </AppText>
          <AppText color={colors.textSecondary} style={styles.caseSimLabel}>
            유사도
          </AppText>
        </View>
      </View>
      <AppText color={colors.textSecondary} style={styles.caseDesc}>
        {item.desc}
      </AppText>
      <View style={styles.caseFoot}>
        <View style={styles.caseTrack}>
          <View style={[styles.caseFill, { width: `${item.similarity}%`, backgroundColor: item.barColor }]} />
        </View>
        <View style={[styles.tag, { backgroundColor: tag.bg }]}>
          <AppText weight="bold" color={tag.text} style={styles.tagText}>
            {tag.label}
          </AppText>
        </View>
      </View>
    </View>
  );
}

/** Tab 2 — one of the two 체크리스트 요약 stat cards. */
function SummaryStatCard({ stat }: { stat: SummaryStat }) {
  return (
    <View style={[styles.statCard, { backgroundColor: stat.tint, borderColor: stat.border }]}>
      <AppText weight="bold" color={stat.accent} style={styles.statLabel}>
        {stat.label}
      </AppText>
      <AppText weight="bold" color={stat.accent} style={styles.statNum}>
        {stat.num}
      </AppText>
      <AppText color={colors.textSecondary} style={styles.statUnit}>
        {stat.unit}
      </AppText>
      {stat.noteTint ? (
        <View style={[styles.statChip, { backgroundColor: '#FFEDD4' }]}>
          <AppText weight="semibold" color={stat.accent} style={styles.statNote}>
            {stat.note}
          </AppText>
        </View>
      ) : (
        <View style={styles.statCheck}>
          <Feather name="check" size={12} color={colors.safe} />
          <AppText weight="semibold" color={colors.safe} style={styles.statNote}>
            {stat.note}
          </AppText>
        </View>
      )}
    </View>
  );
}

function TabContent({ tab }: { tab: number }) {
  return (
    <View style={styles.tabCard}>
      <AppText weight="bold" style={styles.tabHeading}>
        {HEADINGS[tab]}
      </AppText>

      {tab === 1 ? (
        <AppText color={colors.textSecondary} style={styles.tabSub}>
          입력 정보와 행태 패턴을 과거 전세 피해 사례와 매칭했습니다
        </AppText>
      ) : null}

      {tab === 0 ? (
        <View style={styles.rows}>
          {PUBLIC_ROWS.map((r) => (
            <DataRow key={r.label} {...r} />
          ))}
        </View>
      ) : tab === 1 ? (
        <View style={styles.cases}>
          {SIMILAR_CASES.map((c, i) => (
            <SimilarCaseCard key={c.title} item={c} first={i === 0} />
          ))}
        </View>
      ) : tab === 2 ? (
        <View style={styles.statRow}>
          {SUMMARY_STATS.map((s) => (
            <SummaryStatCard key={s.label} stat={s} />
          ))}
        </View>
      ) : (
        <View style={styles.rows}>
          {RECOS.map(({ priority, text }) => {
            const p = PRIORITY[priority];
            return (
              <View key={text} style={styles.recoRow}>
                <View style={[styles.recoBadge, { backgroundColor: p.bg }]}>
                  <AppText weight="bold" color={p.text} style={styles.recoBadgeText}>
                    {p.label}
                  </AppText>
                </View>
                <AppText color={colors.textPrimary} style={styles.recoText}>
                  {text}
                </AppText>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

/** 공용 하단 CTA(전세피해지원센터) + 면책 문구. */
function ReportFooterCards() {
  return (
    <>
      <LinearGradient colors={gradient.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ctaCard}>
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

      <View style={styles.disclaimer}>
        <Feather name="info" size={16} color={colors.textSecondary} />
        <AppText color={colors.textSecondary} style={styles.disclaimerText}>
          본 리포트는 참고용이며 법적 효력이 없습니다. 계약의 최종 판단은 본인에게 있습니다.
        </AppText>
      </View>
    </>
  );
}

/** 실제 분석 결과 리포트 (analyze 응답 기반). */
function RealReport({ result, property }: { result: AnalysisResult; property: Property | null }) {
  const [tab, setTab] = useState(0);
  const grade = gradeDescriptor(result.grade);
  const target = result.score ?? 0;

  // Count the score up + sweep the gauge on mount (payoff of the analyzing screen).
  const scoreAnim = useRef(new Animated.Value(0)).current;
  const [score, setScore] = useState(0);
  useEffect(() => {
    const id = scoreAnim.addListener(({ value }) => setScore(Math.round(value * target)));
    Animated.timing(scoreAnim, { toValue: 1, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
    return () => scoreAnim.removeListener(id);
  }, [scoreAnim, target]);
  const gaugeWidth = scoreAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', `${target}%`] });

  return (
    <>
      <AppText weight="semibold" color={colors.brand} style={styles.kicker}>
        Report
      </AppText>
      <AppText weight="bold" style={styles.title}>
        내 계약 분석 리포트
      </AppText>
      <AppText color={colors.textSecondary} style={styles.subtitle}>
        규칙 기반 위험 분석 결과입니다.
      </AppText>

      {/* 종합 위험 지수 */}
      <View style={styles.realScoreCard}>
        <View style={styles.scoreTop}>
          <View style={styles.flex}>
            <AppText weight="semibold" color={colors.textSecondary} style={styles.scoreCaption}>
              종합 위험 지수
            </AppText>
            <View style={styles.scoreRow}>
              <AppText weight="bold" color={grade.color} style={styles.scoreNum}>
                {result.score == null ? '—' : score}
              </AppText>
              <AppText weight="semibold" color={colors.textSecondary} style={styles.scoreMax}>
                /100
              </AppText>
            </View>
            <View style={styles.riskRow}>
              <View style={[styles.riskDot, { backgroundColor: grade.color }]} />
              <AppText weight="bold" color={grade.color} style={styles.riskLabel}>
                {grade.label}
              </AppText>
            </View>
          </View>
          <View style={styles.realWarnTile}>
            <Feather name="shield" size={28} color={grade.color} />
          </View>
        </View>

        <View style={styles.realGaugeTrack}>
          <Animated.View style={[styles.gaugeFill, { width: gaugeWidth, backgroundColor: grade.color }]} />
        </View>
        <AppText color={colors.textSecondary} style={styles.confidenceText}>
          근거 충족률 {result.confidence}%
        </AppText>
      </View>

      {/* 분석 대상 */}
      {property ? (
        <View style={styles.targetCard}>
          <AppText weight="semibold" color={colors.textSecondary} style={styles.scoreCaption}>
            분석 대상
          </AppText>
          <AppText weight="bold" style={styles.targetName}>
            {property.address}
          </AppText>
          <View style={styles.targetMeta}>
            <AppText color={colors.textSecondary} style={styles.targetMetaText}>
              보증금 {formatManwon(property.depositAmount)}만원
            </AppText>
            <AppText color={colors.textSecondary} style={styles.targetMetaText}>
              {buildingTypeLabel(property.buildingType)}
            </AppText>
          </View>
        </View>
      ) : null}

      {/* 세그먼트 탭 */}
      <View style={styles.segment}>
        {['분석 요약', '위험 근거', '권고사항'].map((t, i) => (
          <Pressable
            key={t}
            onPress={() => setTab(i)}
            style={({ pressed }) => [styles.segItem, i === tab && styles.segActive, pressed && styles.segPressed]}
          >
            <AppText color={i === tab ? colors.white : '#000000'} style={styles.segText} numberOfLines={1}>
              {t}
            </AppText>
          </Pressable>
        ))}
      </View>

      <View style={styles.tabCard}>
        {tab === 0 ? (
          <>
            <AppText weight="bold" style={styles.tabHeading}>
              분석 요약
            </AppText>
            <AppText color={colors.textSecondary} style={styles.summaryText}>
              {result.summary}
            </AppText>
          </>
        ) : tab === 1 ? (
          <>
            <AppText weight="bold" style={styles.tabHeading}>
              위험 근거
            </AppText>
            {result.findings.length ? (
              <View style={styles.rows}>
                {result.findings.map((f, i) => (
                  <View key={i} style={styles.findingRow}>
                    <Feather name="alert-triangle" size={16} color="#F59E0B" style={styles.dataIcon} />
                    <AppText color={colors.textPrimary} style={styles.findingText}>
                      {f}
                    </AppText>
                  </View>
                ))}
              </View>
            ) : (
              <AppText color={colors.textSecondary} style={styles.emptyText}>
                특별한 위험 신호가 발견되지 않았습니다.
              </AppText>
            )}
          </>
        ) : (
          <>
            <AppText weight="bold" style={styles.tabHeading}>
              권고사항
            </AppText>
            {result.recommendations.length ? (
              <View style={styles.rows}>
                {result.recommendations.map((r, i) => (
                  <View key={i} style={styles.recoRow}>
                    <View style={styles.recoNum}>
                      <AppText weight="bold" color={colors.brand} style={styles.recoNumText}>
                        {i + 1}
                      </AppText>
                    </View>
                    <AppText color={colors.textPrimary} style={styles.recoText}>
                      {r}
                    </AppText>
                  </View>
                ))}
              </View>
            ) : (
              <AppText color={colors.textSecondary} style={styles.emptyText}>
                권고사항이 없습니다.
              </AppText>
            )}
          </>
        )}
      </View>

      <ReportFooterCards />
    </>
  );
}

/** 데모 리포트 (대표 데모 값 — 로그인/분석 없이 진입 시). */
function DemoReport() {
  const [tab, setTab] = useState(0);

  const scoreAnim = useRef(new Animated.Value(0)).current;
  const [score, setScore] = useState(0);
  useEffect(() => {
    const id = scoreAnim.addListener(({ value }) => setScore(Math.round(value * RISK_SCORE)));
    Animated.timing(scoreAnim, {
      toValue: 1,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => scoreAnim.removeListener(id);
  }, [scoreAnim]);
  const gaugeWidth = scoreAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', `${RISK_SCORE}%`] });

  return (
    <>
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
              <AppText weight="bold" color={colors.riskLow} style={styles.scoreNum}>
                {score}
              </AppText>
              <AppText weight="semibold" color={colors.textSecondary} style={styles.scoreMax}>
                /100
              </AppText>
            </View>
            <View style={styles.riskRow}>
              <View style={styles.riskDot} />
              <AppText weight="bold" color={colors.riskLow} style={styles.riskLabel}>
                저위험
              </AppText>
            </View>
          </View>
          <View style={styles.warnTile}>
            <Feather name="alert-triangle" size={28} color={colors.riskLow} />
          </View>
        </View>

        <View style={styles.gaugeTrack}>
          <Animated.View style={[styles.gaugeFill, { width: gaugeWidth }]} />
        </View>
        <View style={styles.axis}>
          <AppText weight="semibold" color={colors.riskLow} style={styles.axisLabel}>
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
            style={({ pressed }) => [styles.segItem, i === tab && styles.segActive, pressed && styles.segPressed]}
          >
            <AppText color={i === tab ? colors.white : '#000000'} style={styles.segText} numberOfLines={1}>
              {t}
            </AppText>
          </Pressable>
        ))}
      </View>

      <TabContent tab={tab} />

      <ReportFooterCards />
    </>
  );
}

/**
 * 분석 리포트 (Figma 1-4 / "분석 카드" 48:5304). 뒤로가기·"새 분석"은 단계와 무관해
 * 세 단계가 동일 화면을 공유한다. 세션에 실제 분석 결과가 있으면 그 값을, 없으면(데모
 * 진입) 대표 데모 값을 보여준다.
 */
export function ReportScreen() {
  const insets = useSafeAreaInsets();
  const { analysisId } = useLocalSearchParams<{ analysisId?: string }>();
  const [result, setResult] = useState<AnalysisResult | null>(() => getSession()?.result ?? null);
  const [property, setProperty] = useState<Property | null>(() => getSession()?.property ?? null);
  const [saving, setSaving] = useState(false);

  // 세션에 결과가 없고(예: 웹 새로고침) analysisId 가 있으면 서버에서 복원한다.
  useEffect(() => {
    if (result || !analysisId) return;
    let alive = true;
    (async () => {
      try {
        const r = await getAnalysis(Number(analysisId));
        if (!alive) return;
        setResult(r);
        const p = await getProperty();
        if (alive) setProperty(p);
      } catch {
        // 복원 실패 시 데모 렌더로 폴백
      }
    })();
    return () => {
      alive = false;
    };
  }, [analysisId, result]);

  // "저장": 실제 결과면 PDF 다운로드(웹), 아니면 안내.
  const onSave = async () => {
    if (saving) return;
    if (!result) {
      Alert.alert('저장', '리포트가 저장되었습니다. (데모)');
      return;
    }
    if (!isDownloadSupported) {
      Alert.alert('저장 완료', '분석 결과는 마이페이지 분석 내역에 저장돼 있어요. PDF 다운로드는 웹에서 지원됩니다.');
      return;
    }
    try {
      setSaving(true);
      const blob = await fetchReportPdfBlob(result.id);
      downloadBlob(blob, `safelens-report-${result.id}.pdf`);
    } catch (e) {
      Alert.alert('다운로드 실패', e instanceof Error ? e.message : 'PDF를 받지 못했어요.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
          <Feather name="chevron-left" size={20} color={colors.textPrimary} />
        </Pressable>
        {/* Invisible spacer the same size as the back button, so the bar stays balanced. */}
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {result ? <RealReport result={result} property={property} /> : <DemoReport />}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.flex}>
          <WideButton label="새 분석" variant="outline" height={50} labelSize={14} onPress={() => router.dismissAll()} />
        </View>
        <View style={styles.flex}>
          <WideButton
            label={saving ? '저장 중...' : '저장'}
            height={50}
            labelSize={14}
            icon={<Feather name="download" size={16} color={colors.white} />}
            iconPosition="leading"
            onPress={onSave}
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
  spacer: { width: 36, height: 36 },

  body: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 },
  kicker: { fontSize: 12, lineHeight: 16 },
  title: { fontSize: 24, lineHeight: 32, color: colors.textPrimary, marginTop: 4 },
  subtitle: { fontSize: 14, lineHeight: 20, marginTop: 4 },

  scoreCard: { marginTop: 16, backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#D0FAE5', borderRadius: radius.card, padding: 20 },
  realScoreCard: {
    marginTop: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.card,
    padding: 20,
    shadowColor: '#EEF2FF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 1.5,
    elevation: 1,
  },
  scoreTop: { flexDirection: 'row', alignItems: 'flex-start' },
  scoreCaption: { fontSize: 12, lineHeight: 16 },
  scoreRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 4 },
  scoreNum: { fontSize: 48, lineHeight: 50 },
  scoreMax: { fontSize: 18, lineHeight: 24, marginBottom: 6, marginLeft: 2 },
  riskRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  riskDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.riskLow },
  riskLabel: { fontSize: 16, lineHeight: 22 },
  warnTile: { width: 56, height: 56, borderRadius: 16, backgroundColor: 'rgba(16, 185, 129, 0.09)', alignItems: 'center', justifyContent: 'center' },
  realWarnTile: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  gaugeTrack: { marginTop: 16, height: 10, borderRadius: radius.pill, backgroundColor: 'rgba(255, 255, 255, 0.6)', overflow: 'hidden' },
  realGaugeTrack: { marginTop: 16, height: 10, borderRadius: radius.pill, backgroundColor: '#EEF2FF', overflow: 'hidden' },
  gaugeFill: { height: 10, borderRadius: radius.pill, backgroundColor: colors.riskLow },
  axis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  axisLabel: { fontSize: 10, lineHeight: 15 },
  confidenceText: { fontSize: 12, lineHeight: 16, marginTop: 8 },

  targetCard: { marginTop: 12, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.hairline, borderRadius: radius.button, padding: 16 },
  targetName: { fontSize: 14, lineHeight: 20, color: colors.textPrimary, marginTop: 4 },
  targetMeta: { flexDirection: 'row', gap: 12, marginTop: 4 },
  targetMetaText: { fontSize: 12, lineHeight: 16 },

  segment: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 2,
    padding: 3,
    borderRadius: radius.chip + 3,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    backgroundColor: colors.white,
  },
  segItem: { flex: 1, paddingVertical: 6, alignItems: 'center', justifyContent: 'center', borderRadius: radius.chip },
  segActive: { backgroundColor: colors.brand },
  segPressed: { opacity: 0.7 },
  segText: { fontSize: 10, lineHeight: 15 },

  tabCard: { marginTop: 12, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.hairline, borderRadius: radius.button, padding: 16 },
  tabHeading: { fontSize: 14, lineHeight: 20, color: colors.textPrimary },
  tabSub: { fontSize: 12, lineHeight: 16, marginTop: 4 },
  summaryText: { fontSize: 13, lineHeight: 20, marginTop: 8 },
  rows: { marginTop: 12, gap: 8 },
  dataRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderRadius: radius.card, padding: 12 },
  dataIcon: { marginTop: 2 },
  dataLabel: { fontSize: 12, lineHeight: 16, color: colors.textPrimary },
  dataSub: { fontSize: 10, lineHeight: 14, marginTop: 1 },
  dataValue: { fontSize: 12, lineHeight: 16 },

  // 실제 리포트 — 위험 근거 행.
  findingRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#FFFBEB', borderRadius: radius.card, padding: 12 },
  findingText: { flex: 1, fontSize: 13, lineHeight: 19 },
  emptyText: { fontSize: 13, lineHeight: 20, marginTop: 12 },

  // Tab 1 — 유사 사례 카드.
  cases: { marginTop: 4 },
  caseCard: { paddingVertical: 14 },
  caseDivider: { borderTopWidth: 1, borderTopColor: colors.hairline },
  caseHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  caseTitle: { fontSize: 14, lineHeight: 20 },
  caseMeta: { fontSize: 11, lineHeight: 16, marginTop: 2 },
  caseSimBox: { alignItems: 'flex-end' },
  caseSim: { fontSize: 18, lineHeight: 22 },
  caseSimLabel: { fontSize: 10, lineHeight: 14 },
  caseDesc: { fontSize: 12, lineHeight: 18, marginTop: 8 },
  caseFoot: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  caseTrack: { flex: 1, height: 6, borderRadius: radius.pill, backgroundColor: '#F8F9FF', overflow: 'hidden' },
  caseFill: { height: 6, borderRadius: radius.pill },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill },
  tagText: { fontSize: 10, lineHeight: 14 },

  // Tab 2 — 체크리스트 요약 스탯 카드.
  statRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  statCard: { flex: 1, borderWidth: 1, borderRadius: radius.button, padding: 16 },
  statLabel: { fontSize: 12, lineHeight: 16 },
  statNum: { fontSize: 36, lineHeight: 42, marginTop: 8 },
  statUnit: { fontSize: 12, lineHeight: 16 },
  statChip: { alignSelf: 'flex-start', marginTop: 12, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill },
  statCheck: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 12 },
  statNote: { fontSize: 11, lineHeight: 15 },

  // Tab 3 / 실제 권고사항.
  recoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#F8F9FF', borderRadius: radius.field, padding: 12 },
  recoBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill },
  recoBadgeText: { fontSize: 10, lineHeight: 14 },
  recoNum: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center' },
  recoNumText: { fontSize: 11, lineHeight: 14 },
  recoText: { flex: 1, fontSize: 13, lineHeight: 19, marginTop: 1 },

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
