import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type {
  AnalysisExecutionRequest,
  DepositGuaranteeStatus,
  OwnershipStatus,
  SeizureOrAuctionStatus,
  SeniorRightStatus,
} from '@/api/analysis';
import { getProperty, type Property } from '@/api/property';
import { useAuth } from '@/auth';
import { AppText } from '@/components/AppText';
import { WideButton } from '@/components/WideButton';
import { WizardHeader } from '@/components/WizardHeader';
import type { ContractStage } from '@/data/contractFlow';
import { patchSession } from '@/flow/analysisSession';
import { colors, font, radius } from '@/theme';

const PLACEHOLDER = 'rgba(123, 139, 178, 0.4)';

const SENIOR_RIGHT: { label: string; value: SeniorRightStatus }[] = [
  { label: '없음', value: 'NONE' },
  { label: '근저당', value: 'MORTGAGE' },
  { label: '선순위 임차인', value: 'PRIOR_TENANT' },
  { label: '압류', value: 'SEIZURE' },
  { label: '모름', value: 'UNKNOWN' },
];
const GUARANTEE: { label: string; value: DepositGuaranteeStatus }[] = [
  { label: '가입', value: 'ENROLLED' },
  { label: '미가입', value: 'NOT_ENROLLED' },
  { label: '모름', value: 'UNKNOWN' },
];
const OWNERSHIP: { label: string; value: OwnershipStatus }[] = [
  { label: '일치', value: 'MATCHED' },
  { label: '불일치', value: 'MISMATCHED' },
  { label: '모름', value: 'UNKNOWN' },
];
const SEIZURE: { label: string; value: SeizureOrAuctionStatus }[] = [
  { label: '없음', value: 'NONE' },
  { label: '압류', value: 'SEIZURE' },
  { label: '경매', value: 'AUCTION' },
  { label: '모름', value: 'UNKNOWN' },
];

const toNum = (s: string): number | null => {
  const n = parseInt(s.replace(/[^0-9]/g, ''), 10);
  return Number.isFinite(n) ? n : null;
};

/** 만원 숫자 입력 필드. */
function AmountInput({ value, onChangeText, placeholder }: { value: string; onChangeText: (t: string) => void; placeholder: string }) {
  return (
    <View style={styles.amountRow}>
      <View style={styles.inputPill}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={PLACEHOLDER}
          keyboardType="number-pad"
        />
      </View>
      <AppText weight="semibold" color={colors.textSecondary} style={styles.unit}>
        만원
      </AppText>
    </View>
  );
}

/** 단일 선택 칩 그룹 (enum 값 선택). */
function ChipGroup<T extends string>({ options, value, onChange }: { options: { label: string; value: T }[]; value: T; onChange: (v: T) => void }) {
  return (
    <View style={styles.chipGrid}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={({ pressed }) => [styles.chip, active ? styles.chipActive : styles.chipInactive, pressed && styles.pressed]}
          >
            <AppText weight="semibold" color={active ? colors.white : colors.textSecondary} style={styles.chipText}>
              {o.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <AppText weight="semibold" color={colors.textSecondary} style={styles.label}>
        {label}
      </AppText>
      {children}
    </View>
  );
}

/**
 * 3단계 위험 정보 입력. 규칙형 위험분석(analyze)이 요구하는 6개 값을 사용자가 직접
 * 입력한다. 실제 분석에는 로그인 + 내 집 등록이 필요하며, 없으면 데모 리포트로 안내한다.
 * `onNext`로 분석(analyzing) 라우팅을 주입받는다.
 */
export function RiskInputScreen({ stage: _stage, onNext }: { stage: ContractStage; onNext: () => void }) {
  const insets = useSafeAreaInsets();
  const { status } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [checkedProperty, setCheckedProperty] = useState(false);

  const [propertyValue, setPropertyValue] = useState('');
  const [seniorClaim, setSeniorClaim] = useState('');
  const [seniorRight, setSeniorRight] = useState<SeniorRightStatus>('UNKNOWN');
  const [guarantee, setGuarantee] = useState<DepositGuaranteeStatus>('UNKNOWN');
  const [ownership, setOwnership] = useState<OwnershipStatus>('UNKNOWN');
  const [seizure, setSeizure] = useState<SeizureOrAuctionStatus>('UNKNOWN');

  // 실제 분석 대상(내 집) 확보. 로그인 상태에서만 조회.
  useEffect(() => {
    if (status !== 'authenticated') return;
    let alive = true;
    (async () => {
      try {
        const p = await getProperty();
        if (alive) {
          setProperty(p);
          patchSession({ property: p });
        }
      } catch {
        // 조회 실패는 미등록으로 간주
      } finally {
        if (alive) setCheckedProperty(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [status]);

  // 인증 복원/내 집 조회가 끝나기 전에는 안내·버튼을 확정하지 않는다(플리커 방지).
  const busy = status === 'loading' || (status === 'authenticated' && !checkedProperty);
  const canAnalyze = status === 'authenticated' && !!property;

  const startReal = () => {
    const risk: AnalysisExecutionRequest = {
      estimatedPropertyValueManwon: toNum(propertyValue),
      seniorClaimAmountManwon: toNum(seniorClaim),
      seniorRightStatus: seniorRight,
      depositGuaranteeStatus: guarantee,
      ownershipStatus: ownership,
      seizureOrAuctionStatus: seizure,
    };
    patchSession({ risk });
    onNext();
  };

  const startDemo = () => {
    patchSession({ risk: null });
    onNext();
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <WizardHeader step={2} total={3} onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <AppText weight="semibold" color={colors.brand} style={styles.kicker}>
          3단계
        </AppText>
        <AppText weight="bold" style={styles.title}>
          위험 정보 입력
        </AppText>
        <AppText color={colors.textSecondary} style={styles.subtitle}>
          정확한 분석을 위해 아는 만큼 입력해 주세요. 모르면 “모름”으로 두세요.
        </AppText>

        {/* 로그인/내 집 상태 안내 */}
        {!busy && !canAnalyze ? (
          <View style={styles.notice}>
            <Feather name="info" size={16} color={colors.brand} style={styles.noticeIcon} />
            <View style={styles.flex}>
              <AppText weight="semibold" style={styles.noticeTitle}>
                {status === 'authenticated' ? '내 집 정보가 필요해요' : '실제 분석은 로그인이 필요해요'}
              </AppText>
              <AppText color={colors.textSecondary} style={styles.noticeText}>
                {status === 'authenticated'
                  ? '분석 대상이 될 내 집 정보를 먼저 등록해 주세요. 아래로 입력만 체험하거나 데모 리포트를 볼 수 있어요.'
                  : '로그인 후 내 집을 등록하면 실제 위험 분석을 받을 수 있어요. 지금은 데모 리포트를 볼 수 있어요.'}
              </AppText>
              <Pressable
                onPress={() => router.push(status === 'authenticated' ? '/house' : '/login')}
                style={({ pressed }) => [styles.noticeBtn, pressed && styles.pressed]}
              >
                <AppText weight="semibold" color={colors.brand} style={styles.noticeBtnText}>
                  {status === 'authenticated' ? '내 집 등록하기' : '로그인하기'}
                </AppText>
              </Pressable>
            </View>
          </View>
        ) : null}

        {canAnalyze && property ? (
          <View style={styles.targetChip}>
            <Feather name="home" size={14} color={colors.brand} />
            <AppText weight="semibold" color={colors.textSecondary} style={styles.targetText} numberOfLines={1}>
              분석 대상 · {property.address}
            </AppText>
          </View>
        ) : null}

        <Field label="추정 주택가액">
          <AmountInput value={propertyValue} onChangeText={setPropertyValue} placeholder="예: 30000" />
        </Field>

        <Field label="선순위 채권액 (근저당 등)">
          <AmountInput value={seniorClaim} onChangeText={setSeniorClaim} placeholder="예: 5000" />
        </Field>

        <Field label="선순위 권리 상태">
          <ChipGroup options={SENIOR_RIGHT} value={seniorRight} onChange={setSeniorRight} />
        </Field>

        <Field label="전세보증보험 가입">
          <ChipGroup options={GUARANTEE} value={guarantee} onChange={setGuarantee} />
        </Field>

        <Field label="임대인 · 소유자 일치">
          <ChipGroup options={OWNERSHIP} value={ownership} onChange={setOwnership} />
        </Field>

        <Field label="압류 · 경매 진행">
          <ChipGroup options={SEIZURE} value={seizure} onChange={setSeizure} />
        </Field>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        {busy ? (
          <ActivityIndicator color={colors.brand} />
        ) : canAnalyze ? (
          <WideButton label="AI 분석 시작하기" icon={<Feather name="settings" size={20} color={colors.white} />} onPress={startReal} />
        ) : (
          <WideButton label="데모 리포트 보기" variant="outline" onPress={startDemo} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  pressed: { opacity: 0.85 },
  body: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 },
  kicker: { fontSize: 12, lineHeight: 16 },
  title: { fontSize: 24, lineHeight: 32, color: colors.textPrimary, marginTop: 4 },
  subtitle: { fontSize: 14, lineHeight: 20, marginTop: 4 },

  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 16,
    backgroundColor: 'rgba(67, 97, 238, 0.05)',
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.button,
    padding: 14,
  },
  noticeIcon: { marginTop: 1 },
  noticeTitle: { fontSize: 13, lineHeight: 18, color: colors.textPrimary },
  noticeText: { fontSize: 12, lineHeight: 18, marginTop: 2 },
  noticeBtn: { alignSelf: 'flex-start', marginTop: 8 },
  noticeBtnText: { fontSize: 13, lineHeight: 18 },

  targetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    alignSelf: 'flex-start',
    backgroundColor: colors.bannerBg,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  targetText: { fontSize: 12, lineHeight: 16, maxWidth: 260 },

  card: {
    marginTop: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.button,
    padding: 16,
    shadowColor: '#EEF2FF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 1.5,
    elevation: 1,
  },
  label: { fontSize: 12, lineHeight: 16 },

  amountRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  inputPill: {
    flex: 1,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: '#F8F9FF',
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  input: { height: 44, fontFamily: font.regular, fontSize: 14, color: colors.textPrimary },
  unit: { fontSize: 14, lineHeight: 20 },

  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  chip: { borderRadius: radius.pill, paddingHorizontal: 14, height: 40, alignItems: 'center', justifyContent: 'center' },
  chipActive: {
    backgroundColor: colors.brand,
    shadowColor: '#C6D2FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 3,
  },
  chipInactive: { backgroundColor: '#F8F9FF' },
  chipText: { fontSize: 13, lineHeight: 18 },

  footer: { paddingHorizontal: 20, paddingTop: 12 },
});
