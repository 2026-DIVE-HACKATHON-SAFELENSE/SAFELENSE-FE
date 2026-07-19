import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { type ComponentProps, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { colors, radius } from '@/theme';

type FeatherName = ComponentProps<typeof Feather>['name'];

const STAGES: { title: string; subtitle: string; icon: FeatherName; color: string }[] = [
  { title: '공공 데이터 수집 중', subtitle: '국토교통부 · 법원 등기소', icon: 'search', color: '#2B7FFF' },
  { title: '민간 데이터 분석 중', subtitle: '실거래가 · 피해 신고 이력', icon: 'bar-chart-2', color: '#FF6900' },
  { title: 'AI 유사 사례 분석', subtitle: '전세 사기 패턴 매칭', icon: 'settings', color: '#AD46FF' },
  { title: '리포트 생성 중', subtitle: '위험 지수 산출', icon: 'file-text', color: '#00C950' },
];

const STAGE_MS = 1100;

function ThreeDots() {
  return (
    <View style={styles.dots}>
      {[0.29, 0.66, 0.78].map((o) => (
        <View key={o} style={[styles.dot, { opacity: o }]} />
      ))}
    </View>
  );
}

function StepRow({ stage, index, active }: { stage: (typeof STAGES)[number]; index: number; active: number }) {
  const state = index < active ? 'done' : index === active ? 'active' : 'pending';

  return (
    <View
      style={[
        styles.row,
        state === 'active' && styles.rowActive,
        state === 'done' && styles.rowDone,
        state === 'pending' && styles.rowPending,
      ]}
    >
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: state === 'done' ? '#00C950' : state === 'active' ? stage.color : colors.chevronBg },
        ]}
      >
        {state === 'done' ? (
          <Feather name="check" size={16} color={colors.white} />
        ) : (
          <Feather name={stage.icon} size={16} color={state === 'active' ? colors.white : colors.textSecondary} />
        )}
      </View>

      <AppText
        weight="semibold"
        color={state === 'pending' ? colors.textSecondary : colors.textPrimary}
        style={styles.rowLabel}
      >
        {stage.title}
      </AppText>

      {state === 'done' ? (
        <AppText weight="semibold" color="#00A63E" style={styles.done}>
          완료
        </AppText>
      ) : state === 'active' ? (
        <ThreeDots />
      ) : null}
    </View>
  );
}

export default function Analyzing() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    let idx = 0;
    const advance = () => {
      idx += 1;
      if (idx >= STAGES.length) {
        timers.push(setTimeout(() => router.replace('/pre-contract/report'), 600));
      } else {
        setActive(idx);
        timers.push(setTimeout(advance, STAGE_MS));
      }
    };
    timers.push(setTimeout(advance, STAGE_MS));
    return () => timers.forEach(clearTimeout);
  }, []);

  const current = STAGES[Math.min(active, STAGES.length - 1)];

  return (
    <View style={styles.screen}>
      <View style={styles.emblemWrap}>
        <View style={styles.ringOuter} />
        <View style={styles.ringInner} />
        <LinearGradient colors={['#4361EE', '#432DD7']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.emblem}>
          <Feather name="shield" size={24} color={colors.white} />
        </LinearGradient>
      </View>

      <AppText weight="bold" style={styles.title}>
        {current.title}
      </AppText>
      <AppText color={colors.textSecondary} style={styles.subtitle}>
        {current.subtitle}
      </AppText>

      <View style={styles.list}>
        {STAGES.map((stage, i) => (
          <StepRow key={stage.title} stage={stage} index={i} active={active} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: 20 },
  emblemWrap: { width: 96, height: 96, alignItems: 'center', justifyContent: 'center' },
  ringOuter: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1.5,
    borderColor: 'rgba(67, 97, 238, 0.08)',
  },
  ringInner: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: 'rgba(67, 97, 238, 0.19)',
  },
  emblem: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C6D2FF',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.9,
    shadowRadius: 12,
    elevation: 8,
  },
  title: { fontSize: 20, lineHeight: 28, color: colors.textPrimary, marginTop: 24, textAlign: 'center' },
  subtitle: { fontSize: 14, lineHeight: 20, marginTop: 4, textAlign: 'center' },
  list: { marginTop: 40, width: 280, gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: radius.button,
    borderWidth: 1,
    padding: 14,
  },
  rowActive: {
    backgroundColor: colors.white,
    borderColor: 'rgba(67, 97, 238, 0.2)',
    shadowColor: '#E0E7FF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 5,
  },
  rowDone: { backgroundColor: '#F0FDF4', borderColor: '#DCFCE7' },
  rowPending: { backgroundColor: colors.white, borderColor: colors.hairline, opacity: 0.4 },
  iconCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { flex: 1, fontSize: 14, lineHeight: 20 },
  done: { fontSize: 14, lineHeight: 20 },
  dots: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.brand },
});
