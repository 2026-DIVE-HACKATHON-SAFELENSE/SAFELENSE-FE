import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Badge } from '@/components/Badge';
import { ChecklistCard } from '@/components/ChecklistCard';
import { WideButton } from '@/components/WideButton';
import { WizardHeader } from '@/components/WizardHeader';
import { colors, gradient, radius } from '@/theme';

const ITEMS: { title: string; desc: string; required: boolean }[] = [
  { title: '등기부등본 확인', desc: '발급일 1개월 이내 · 근저당·압류 여부', required: true },
  { title: '건축물대장 확인', desc: '위반 건축물 여부 및 건물 현황', required: true },
  { title: '토지대장 확인', desc: '토지 용도 및 권리관계', required: false },
  { title: '표준 임대차계약서 사용', desc: '국토교통부 표준 양식 사용', required: true },
  { title: '공인중개사 중개 확인', desc: '국가공간정보포털에서 자격 조회', required: true },
  { title: '전세보증보험 가입 가능', desc: 'HUG 또는 SGI 서울보증 사전 확인', required: false },
];

export default function DocumentChecklist() {
  const insets = useSafeAreaInsets();
  const [checked, setChecked] = useState<boolean[]>(() => ITEMS.map(() => false));

  const toggle = (i: number) => setChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  const count = checked.filter(Boolean).length;
  const pct = Math.round((count / ITEMS.length) * 100);

  // Sweep the progress fill to its new width instead of snapping between steps.
  const fillAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fillAnim, {
      toValue: pct,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [pct, fillAnim]);
  const fillWidth = fillAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <WizardHeader step={0} total={3} onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <AppText weight="semibold" color={colors.brand} style={styles.kicker}>
          1단계
        </AppText>
        <AppText weight="bold" style={styles.title}>
          서류 체크리스트
        </AppText>
        <AppText color={colors.textSecondary} style={styles.subtitle}>
          확인한 서류를 모두 체크해 주세요
        </AppText>

        <View style={styles.progressCard}>
          <View style={styles.progressRow}>
            <AppText weight="semibold" style={styles.progressLabel}>
              확인 완료
            </AppText>
            <AppText weight="bold" color={colors.brand} style={styles.progressLabel}>
              {count}/{ITEMS.length}
            </AppText>
          </View>
          <View style={styles.track}>
            <Animated.View style={[styles.fillWrap, { width: fillWidth }]}>
              <LinearGradient
                colors={gradient.progress}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.fillGrad}
              />
            </Animated.View>
          </View>
        </View>

        <View style={styles.list}>
          {ITEMS.map((item, i) => (
            <ChecklistCard
              key={item.title}
              title={item.title}
              description={item.desc}
              badge={
                item.required ? (
                  <Badge label="필수" textColor={colors.dangerText} bg={colors.dangerBg} />
                ) : undefined
              }
              checked={checked[i]}
              onToggle={() => toggle(i)}
              checkedBg="#F3FEF8"
              checkedBorder="rgba(152, 230, 213, 0.72)"
              radioColor={colors.mint}
              checkedTitleColor={colors.greenDeep}
            />
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <WideButton
          label="다음 단계로"
          icon={<Feather name="arrow-right" size={20} color={colors.white} />}
          onPress={() => router.push('/pre-contract/behaviors')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 },
  kicker: { fontSize: 12, lineHeight: 16 },
  title: { fontSize: 24, lineHeight: 32, color: colors.textPrimary, marginTop: 4 },
  subtitle: { fontSize: 14, lineHeight: 20, marginTop: 4 },
  progressCard: {
    marginTop: 20,
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
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressLabel: { fontSize: 14, lineHeight: 20, color: colors.textPrimary },
  track: {
    marginTop: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.bg,
    overflow: 'hidden',
  },
  fillWrap: { height: 8, borderRadius: radius.pill, overflow: 'hidden' },
  fillGrad: { flex: 1 },
  list: { marginTop: 16, gap: 8 },
  footer: { paddingHorizontal: 20, paddingTop: 12 },
});
