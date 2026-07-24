import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { type ComponentProps, useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { createCase, runAnalyze, toApiStage } from '@/api/analysis';
import { AppText } from '@/components/AppText';
import { WideButton } from '@/components/WideButton';
import { getSession, patchSession } from '@/flow/analysisSession';
import { colors, gradient, radius } from '@/theme';

type FeatherName = ComponentProps<typeof Feather>['name'];

const STAGES: { title: string; subtitle: string; icon: FeatherName; color: string }[] = [
  { title: '공공 데이터 수집 중', subtitle: '국토교통부 · 법원 등기소', icon: 'search', color: '#2B7FFF' },
  { title: '민간 데이터 분석 중', subtitle: '실거래가 · 피해 신고 이력', icon: 'bar-chart-2', color: '#FF6900' },
  { title: 'AI 유사 사례 분석', subtitle: '전세 사기 패턴 매칭', icon: 'cpu', color: '#AD46FF' },
  { title: '리포트 생성 중', subtitle: '위험 지수 산출', icon: 'file-text', color: '#00C950' },
];

const STAGE_MS = 1100;

/** Three loading dots that pulse in a staggered wave. */
function ThreeDots() {
  const d0 = useRef(new Animated.Value(0.25)).current;
  const d1 = useRef(new Animated.Value(0.25)).current;
  const d2 = useRef(new Animated.Value(0.25)).current;

  useEffect(() => {
    const anims = [d0, d1, d2].map((d, i) =>
      Animated.sequence([
        Animated.delay(i * 160),
        Animated.loop(
          Animated.sequence([
            Animated.timing(d, { toValue: 1, duration: 340, easing: Easing.out(Easing.quad), useNativeDriver: true }),
            Animated.timing(d, { toValue: 0.25, duration: 340, easing: Easing.in(Easing.quad), useNativeDriver: true }),
          ]),
        ),
      ]),
    );
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, [d0, d1, d2]);

  return (
    <View style={styles.dots}>
      {[d0, d1, d2].map((d, i) => (
        <Animated.View key={i} style={[styles.dot, { opacity: d, transform: [{ scale: d }] }]} />
      ))}
    </View>
  );
}

/** Central shield emblem with radar "ping" rings and a gentle breathing pulse. */
function PulsingEmblem() {
  const ping1 = useRef(new Animated.Value(0)).current;
  const ping2 = useRef(new Animated.Value(0)).current;
  const breathe = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const ping = (v: Animated.Value) =>
      Animated.loop(
        Animated.timing(v, { toValue: 1, duration: 2000, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      );
    const a1 = ping(ping1);
    const a2 = Animated.sequence([Animated.delay(1000), ping(ping2)]);
    const a3 = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    a1.start();
    a2.start();
    a3.start();
    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, [ping1, ping2, breathe]);

  const ringStyle = (v: Animated.Value) => ({
    opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] }),
    transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.9] }) }],
  });

  return (
    <View style={styles.emblemWrap}>
      <Animated.View style={[styles.ping, ringStyle(ping1)]} />
      <Animated.View style={[styles.ping, ringStyle(ping2)]} />
      <View style={styles.ringOuter} />
      <View style={styles.ringInner} />
      <Animated.View style={{ transform: [{ scale: breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) }] }}>
        <LinearGradient colors={gradient.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.emblem}>
          <Feather name="shield" size={24} color={colors.white} />
        </LinearGradient>
      </Animated.View>
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
          { backgroundColor: state === 'done' ? colors.doneGreen : state === 'active' ? stage.color : colors.chevronBg },
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
        <AppText weight="semibold" color={colors.doneText} style={styles.done}>
          완료
        </AppText>
      ) : state === 'active' ? (
        <ThreeDots />
      ) : null}
    </View>
  );
}

/**
 * 분석 화면. 4단계 애니메이션을 보여주며, 실제 모드(위험정보 입력 + 내 집 존재)면
 * `createCase → analyze`를 실행해 결과를 세션에 저장한 뒤 `onDone`으로 리포트로 이동한다.
 * 데모 모드(세션에 risk 없음)면 애니메이션만 재생 후 `onDone`. 전/중/후 공통.
 */
export function AnalyzingScreen({ onDone }: { onDone: (analysisId?: number) => void }) {
  const [active, setActive] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const session = getSession();
    const real = !!session && session.risk != null && session.property?.id != null;

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let animDone = false;
    let apiDone = !real; // 데모 모드면 API 대기 불필요
    let analysisId: number | undefined;
    const finish = () => {
      if (animDone && apiDone && !cancelled) timers.push(setTimeout(() => onDoneRef.current(analysisId), 400));
    };

    // 4단계 애니메이션 (항상 재생). active 초기화는 마운트/재시도 시 이미 0.
    let idx = 0;
    const advance = () => {
      idx += 1;
      if (idx >= STAGES.length) {
        animDone = true;
        finish();
      } else {
        setActive(idx);
        timers.push(setTimeout(advance, STAGE_MS));
      }
    };
    timers.push(setTimeout(advance, STAGE_MS));

    // 실제 분석: 케이스 생성 → 위험분석 실행 → 결과 저장.
    if (real && session) {
      (async () => {
        try {
          // 서류 단계에서 만든 케이스를 재사용. 없으면(예외 경로) 새로 생성.
          const caseId = session.caseId ?? (await createCase(toApiStage(session.stage), session.property!.id)).id;
          const result = await runAnalyze(caseId, session.risk!);
          if (cancelled) return;
          patchSession({ result });
          analysisId = result.id;
          apiDone = true;
          finish();
        } catch (e) {
          if (!cancelled) setError(e instanceof Error ? e.message : '분석 중 오류가 발생했습니다.');
        }
      })();
    }

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
    // attempt 가 바뀌면(재시도) 전체 파이프라인을 다시 실행한다.
  }, [attempt]);

  if (error) {
    return (
      <View style={styles.screen}>
        <View style={styles.errorIcon}>
          <Feather name="alert-triangle" size={28} color={colors.danger} />
        </View>
        <AppText weight="bold" style={styles.title}>
          분석에 실패했어요
        </AppText>
        <AppText color={colors.textSecondary} style={styles.subtitle}>
          {error}
        </AppText>
        <View style={styles.errorActions}>
          <View style={styles.flex}>
            <WideButton
              label="뒤로"
              variant="outline"
              height={50}
              labelSize={14}
              onPress={() => router.back()}
            />
          </View>
          <View style={styles.flex}>
            <WideButton
              label="다시 시도"
              height={50}
              labelSize={14}
              onPress={() => {
                setActive(0);
                setError(null);
                setAttempt((a) => a + 1);
              }}
            />
          </View>
        </View>
      </View>
    );
  }

  const current = STAGES[Math.min(active, STAGES.length - 1)];

  return (
    <View style={styles.screen}>
      <PulsingEmblem />

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
  flex: { flex: 1 },
  emblemWrap: { width: 96, height: 96, alignItems: 'center', justifyContent: 'center' },
  ping: { position: 'absolute', width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: 'rgba(67, 97, 238, 0.45)' },
  ringOuter: { position: 'absolute', width: 96, height: 96, borderRadius: 48, borderWidth: 1.5, borderColor: 'rgba(67, 97, 238, 0.08)' },
  ringInner: { position: 'absolute', width: 64, height: 64, borderRadius: 32, borderWidth: 1.5, borderColor: 'rgba(67, 97, 238, 0.19)' },
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
  errorIcon: { width: 64, height: 64, borderRadius: 20, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, lineHeight: 28, color: colors.textPrimary, marginTop: 24, textAlign: 'center' },
  subtitle: { fontSize: 14, lineHeight: 20, marginTop: 4, textAlign: 'center', paddingHorizontal: 24 },
  errorActions: { flexDirection: 'row', gap: 10, marginTop: 28, width: 280 },
  list: { marginTop: 40, width: 280, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: radius.button, borderWidth: 1, padding: 14 },
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
