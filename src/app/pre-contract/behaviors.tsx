import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Badge } from '@/components/Badge';
import { ChecklistCard } from '@/components/ChecklistCard';
import { WideButton } from '@/components/WideButton';
import { WizardHeader } from '@/components/WizardHeader';
import { colors, radius } from '@/theme';

type Severity = 'danger' | 'warn' | 'observe';

const SEVERITY: Record<Severity, { label: string; text: string; bg: string }> = {
  danger: { label: '위험', text: colors.dangerText, bg: colors.dangerBg },
  warn: { label: '주의', text: colors.warnText, bg: colors.warnBg },
  observe: { label: '관찰', text: colors.observeText, bg: colors.observeBg },
};

const ITEMS: { title: string; desc: string; sev: Severity }[] = [
  { title: '등기부등본 열람 거부', desc: '서류 확인 회피 또는 "믿어달라" 요구', sev: 'danger' },
  { title: '선순위 근저당 다수 설정', desc: '보증금보다 담보 채권이 더 많은 상태', sev: 'danger' },
  { title: '계약서 내용 임의 수정 요구', desc: '서명 후 특약 추가 또는 금액 수정 시도', sev: 'danger' },
  { title: '계약을 급하게 서두름', desc: '"오늘 아니면 다른 분에게" 등 시간 압박', sev: 'warn' },
  { title: '주변 시세보다 현저히 낮음', desc: '유사 물건 대비 20% 이상 저렴', sev: 'warn' },
  { title: '소유권이 최근 자주 변경됨', desc: '1년 내 2회 이상 소유자 변경', sev: 'warn' },
  { title: '현금 거래 요구', desc: '계좌 추적을 피하기 위한 현금 선호', sev: 'warn' },
  { title: '연락이 자주 끊김', desc: '전화·문자 무응답 또는 번호 변경', sev: 'warn' },
  { title: '공인중개사 없이 직거래 강요', desc: '"중개비 아끼자" 구실의 무자격 거래', sev: 'observe' },
];

export default function BehaviorChecklist() {
  const insets = useSafeAreaInsets();
  const [checked, setChecked] = useState<boolean[]>(() => ITEMS.map(() => false));

  const toggle = (i: number) => setChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  const count = checked.filter(Boolean).length;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <WizardHeader step={1} total={3} onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <AppText weight="semibold" color={colors.brand} style={styles.kicker}>
          2단계
        </AppText>
        <AppText weight="bold" style={styles.title}>
          행태 체크리스트
        </AppText>
        <AppText color={colors.textSecondary} style={styles.subtitle}>
          해당되는 상황에 체크해 주세요
        </AppText>

        <View style={styles.list}>
          {count > 0 ? (
            <View style={styles.banner}>
              <View style={styles.bannerIcon}>
                <Feather name="alert-triangle" size={16} color={colors.white} />
              </View>
              <View style={styles.flex}>
                <AppText weight="bold" color={colors.dangerTitle} style={styles.bannerTitle}>
                  {count}개 의심 행태 감지
                </AppText>
                <AppText color={colors.dangerText} style={styles.bannerSub}>
                  계약을 신중하게 재검토하세요
                </AppText>
              </View>
            </View>
          ) : null}

          {ITEMS.map((item, i) => {
            const sev = SEVERITY[item.sev];
            return (
              <ChecklistCard
                key={item.title}
                title={item.title}
                description={item.desc}
                badge={<Badge label={sev.label} textColor={sev.text} bg={sev.bg} />}
                checked={checked[i]}
                onToggle={() => toggle(i)}
                checkedBg={colors.dangerHighlight}
                checkedBorder={colors.dangerBorder}
                radioColor={colors.danger}
                checkedTitleColor={colors.dangerTitle}
              />
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <WideButton
          label="AI 분석 시작하기"
          icon={<Feather name="settings" size={20} color={colors.white} />}
          onPress={() => router.push('/pre-contract/analyzing')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  body: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 },
  kicker: { fontSize: 12, lineHeight: 16 },
  title: { fontSize: 24, lineHeight: 32, color: colors.textPrimary, marginTop: 4 },
  subtitle: { fontSize: 14, lineHeight: 20, marginTop: 4 },
  list: { marginTop: 20, gap: 8 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.dangerHighlight,
    borderWidth: 1,
    borderColor: colors.dangerBg,
    borderRadius: radius.button,
    padding: 14,
  },
  bannerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: { fontSize: 14, lineHeight: 20 },
  bannerSub: { fontSize: 12, lineHeight: 16, marginTop: 1 },
  footer: { paddingHorizontal: 20, paddingTop: 12 },
});
