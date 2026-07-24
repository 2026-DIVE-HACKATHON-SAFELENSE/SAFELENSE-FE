import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getTemplate, saveChecklist, toApiStage } from '@/api/analysis';
import { AppText } from '@/components/AppText';
import { WideButton } from '@/components/WideButton';
import { WizardHeader } from '@/components/WizardHeader';
import { BEHAVIOR_CHECKLISTS } from '@/data/behaviorChecklist';
import { type ContractStage } from '@/data/contractFlow';
import { getSession } from '@/flow/analysisSession';
import { colors, radius } from '@/theme';

type Section = {
  id: string;
  /** 세그먼트 탭에 표시할 짧은 라벨. */
  tabLabel: string;
  /** 항목 위 제목. */
  heading: string;
  items: { key: string; label: string }[];
};

/** 하드코딩 데이터(데모)를 정규화한 섹션. */
const buildDemoSections = (stage: ContractStage): Section[] =>
  BEHAVIOR_CHECKLISTS[stage].map((c) => ({
    id: c.key,
    tabLabel: c.key,
    heading: c.heading,
    items: c.items.map((label, i) => ({ key: `${c.key}:${i}`, label })),
  }));

/** A tappable positive-action row: mint radio + (possibly multi-line) label. */
function CheckRow({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
  // Pop the check mark in/out instead of a hard cut on toggle.
  const pop = useRef(new Animated.Value(checked ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(pop, { toValue: checked ? 1 : 0, friction: 5, tension: 160, useNativeDriver: true }).start();
  }, [checked, pop]);

  return (
    <Pressable
      onPress={onToggle}
      style={({ pressed }) => [styles.item, checked ? styles.itemChecked : styles.itemUnchecked, pressed && styles.pressed]}
    >
      <View style={[styles.radio, checked && styles.radioChecked]}>
        <Animated.View
          style={{ opacity: pop, transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }] }}
        >
          <Feather name="check" size={12} color={colors.white} />
        </Animated.View>
      </View>
      <AppText weight="semibold" color={checked ? colors.greenDeep : colors.textPrimary} style={styles.itemText}>
        {label}
      </AppText>
    </Pressable>
  );
}

/**
 * 2단계 행태 체크리스트 (Figma 179:827). 로그인+내 집(=케이스 존재)이면 서버 템플릿
 * (getTemplate)의 섹션/항목을 렌더하고 "다음"에서 답변을 저장(saveChecklist)한다.
 * 아니면 하드코딩 데이터로 폴백(저장 없음). `onNext`로 다음 단계 주입.
 */
export function BehaviorChecklistScreen({ stage, onNext }: { stage: ContractStage; onNext: () => void }) {
  const insets = useSafeAreaInsets();
  const caseId = getSession()?.caseId ?? null;
  const isReal = caseId != null;

  // 데모면 초기값으로 하드코딩 섹션(effect 동기 setState 회피), 실제면 null→effect 로드.
  const [sections, setSections] = useState<Section[] | null>(() =>
    getSession()?.caseId == null ? buildDemoSections(stage) : null,
  );
  const [tab, setTab] = useState(0);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (caseId == null) return; // 데모는 초기값으로 이미 준비됨
    let alive = true;
    (async () => {
      try {
        const template = await getTemplate(toApiStage(stage));
        if (alive) {
          setSections(
            template.sections.map((s) => ({
              id: s.sectionKey,
              tabLabel: s.label,
              heading: s.label,
              items: s.items.map((it) => ({ key: it.itemKey, label: it.label })),
            })),
          );
        }
      } catch {
        if (alive) setSections(buildDemoSections(stage)); // 실패 시 데모로 폴백
      }
    })();
    return () => {
      alive = false;
    };
  }, [stage, caseId]);

  const toggle = (key: string) => setChecked((prev) => ({ ...prev, [key]: !prev[key] }));

  const onProceed = async () => {
    if (saving) return;
    // 실제 모드면 체크리스트 답변 저장(best-effort — 실패해도 흐름 진행).
    if (isReal && caseId != null && sections) {
      try {
        setSaving(true);
        const answers = sections.flatMap((s) => s.items).map((it) => ({ itemKey: it.key, checked: !!checked[it.key] }));
        await saveChecklist(caseId, answers);
      } catch {
        // 저장 실패는 무시하고 진행
      } finally {
        setSaving(false);
      }
    }
    onNext();
  };

  const category = sections?.[Math.min(tab, (sections?.length ?? 1) - 1)];

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
          해당되는 상황에 모두 체크해 주세요
        </AppText>

        {sections === null || !category ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.brand} />
          </View>
        ) : (
          <View style={styles.card}>
            {/* Connected segmented control by category (Figma 179:827). */}
            <View style={styles.segment}>
              {sections.map((c, i) => {
                const active = i === tab;
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => setTab(i)}
                    style={({ pressed }) => [
                      styles.segItem,
                      i > 0 && !active && styles.segDivider,
                      active && styles.segActive,
                      pressed && !active && styles.segPressed,
                    ]}
                  >
                    <AppText
                      weight={active ? 'semibold' : 'regular'}
                      color={active ? colors.white : colors.textPrimary}
                      style={styles.segText}
                      numberOfLines={1}
                    >
                      {c.tabLabel}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>

            <AppText weight="bold" style={styles.heading}>
              {category.heading}
            </AppText>

            <View style={styles.list}>
              {category.items.map((it) => (
                <CheckRow key={it.key} label={it.label} checked={!!checked[it.key]} onToggle={() => toggle(it.key)} />
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <WideButton
          label={saving ? '저장 중...' : '다음 단계로'}
          icon={<Feather name="arrow-right" size={20} color={colors.white} />}
          onPress={onProceed}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  pressed: { opacity: 0.85 },
  body: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 },
  kicker: { fontSize: 12, lineHeight: 16 },
  title: { fontSize: 24, lineHeight: 32, color: colors.textPrimary, marginTop: 4 },
  subtitle: { fontSize: 14, lineHeight: 20, marginTop: 4 },

  loading: { marginTop: 40, alignItems: 'center' },

  card: {
    marginTop: 24,
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

  segment: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: radius.chip,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  segItem: { flex: 1, paddingVertical: 7, alignItems: 'center', justifyContent: 'center' },
  segDivider: { borderLeftWidth: 1, borderLeftColor: '#D9D9D9' },
  segActive: { backgroundColor: colors.brand },
  segPressed: { opacity: 0.6 },
  segText: { fontSize: 10, lineHeight: 15, paddingHorizontal: 4 },

  heading: { fontSize: 14, lineHeight: 20, color: colors.textPrimary, marginTop: 16 },

  list: { marginTop: 8, gap: 8 },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: radius.button,
    borderWidth: 1,
    padding: 16,
  },
  itemUnchecked: {
    backgroundColor: colors.white,
    borderColor: colors.hairline,
    shadowColor: '#EEF2FF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 1.5,
    elevation: 1,
  },
  itemChecked: { backgroundColor: '#F3FEF8', borderColor: 'rgba(152, 230, 213, 0.72)' },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(123, 139, 178, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  radioChecked: { backgroundColor: colors.mint, borderColor: colors.mint },
  itemText: { flex: 1, fontSize: 14, lineHeight: 20 },

  footer: { paddingHorizontal: 20, paddingTop: 12 },
});
