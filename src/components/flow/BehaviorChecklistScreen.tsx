import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { WideButton } from '@/components/WideButton';
import { WizardHeader } from '@/components/WizardHeader';
import { BEHAVIOR_CHECKLISTS } from '@/data/behaviorChecklist';
import { type ContractStage } from '@/data/contractFlow';
import { colors, radius } from '@/theme';

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
 * 2단계 행태 체크리스트 (Figma 179:827 / 179:1246 / 179:2580). 단계별로 카테고리
 * 탭과 항목이 다르며, 제목("행태 체크리스트")은 공통. `onNext`로 분석 라우팅 주입.
 */
export function BehaviorChecklistScreen({ stage, onNext }: { stage: ContractStage; onNext: () => void }) {
  const insets = useSafeAreaInsets();
  const categories = BEHAVIOR_CHECKLISTS[stage];
  const [tab, setTab] = useState(0);
  // Checked state keyed by "categoryIndex:itemIndex", preserved across tab switches.
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const toggle = (key: string) => setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  const category = categories[tab];

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

        <View style={styles.card}>
          {/* Connected segmented control by category (Figma 179:827). */}
          <View style={styles.segment}>
            {categories.map((c, i) => {
              const active = i === tab;
              return (
                <Pressable
                  key={c.key}
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
                    {c.key}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          <AppText weight="bold" style={styles.heading}>
            {category.heading}
          </AppText>

          <View style={styles.list}>
            {category.items.map((label, i) => {
              const key = `${tab}:${i}`;
              return <CheckRow key={key} label={label} checked={!!checked[key]} onToggle={() => toggle(key)} />;
            })}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <WideButton label="AI 분석 시작하기" icon={<Feather name="settings" size={20} color={colors.white} />} onPress={onNext} />
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
  segText: { fontSize: 10, lineHeight: 15 },

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
