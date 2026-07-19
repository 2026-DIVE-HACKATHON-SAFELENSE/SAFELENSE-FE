import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { type ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { radius } from '@/theme';

type FeatherName = ComponentProps<typeof Feather>['name'];

const CARDS: {
  label: string;
  bg: string;
  color: string;
  icon: FeatherName | 'shield-check';
}[] = [
  { label: '등기 정보', bg: '#EFF6FF', color: '#2B7FFF', icon: 'file-text' },
  { label: '실거래가', bg: '#F5F3FF', color: '#8E51FF', icon: 'bar-chart-2' },
  { label: '보증 정보', bg: '#ECFDF5', color: '#00BC7D', icon: 'shield-check' },
  { label: '상담 사례', bg: '#FFF7ED', color: '#FF6900', icon: 'message-square' },
];

/** Onboarding slide 2 (purple): a 2×2 data-source card grid with an "AI 분석 중" chip. */
export function Slide2Illustration() {
  return (
    <View style={styles.box}>
      <View style={styles.ring} />

      <View style={styles.grid}>
        {CARDS.map((card) => (
          <View key={card.label} style={[styles.card, { backgroundColor: card.bg }]}>
            {card.icon === 'shield-check' ? (
              <MaterialCommunityIcons name="shield-check" size={20} color={card.color} />
            ) : (
              <Feather name={card.icon} size={20} color={card.color} />
            )}
            <AppText weight="bold" color={card.color} style={styles.cardLabel}>
              {card.label}
            </AppText>
          </View>
        ))}
      </View>

      <View style={styles.aiPill}>
        <View style={styles.aiRow}>
          <Feather name="settings" size={13} color="#7F22FE" />
          <AppText weight="bold" color="#7F22FE" style={styles.aiText}>
            AI 분석 중
          </AppText>
        </View>
        <View style={styles.track}>
          <View style={styles.fill} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { width: 260, height: 210, alignItems: 'center', justifyContent: 'center' },
  ring: {
    position: 'absolute',
    width: 176,
    height: 176,
    borderRadius: 88,
    borderWidth: 1.5,
    borderColor: 'rgba(221, 214, 255, 0.6)',
    top: (210 - 176) / 2,
    left: (260 - 176) / 2,
  },
  grid: {
    width: 144,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  card: {
    width: 68,
    height: 68,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 2,
  },
  cardLabel: { fontSize: 9, lineHeight: 12 },
  aiPill: {
    position: 'absolute',
    right: -8,
    bottom: -6,
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderColor: '#F5F3FF',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 13,
    paddingVertical: 9,
    shadowColor: '#C4B5FD',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  aiRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  aiText: { fontSize: 10, lineHeight: 15 },
  track: {
    width: 80,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: '#EDE9FE',
    overflow: 'hidden',
  },
  fill: { width: 60, height: 6, borderRadius: radius.pill, backgroundColor: '#8E51FF' },
});
