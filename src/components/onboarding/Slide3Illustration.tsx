import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { FloatingBadge } from '@/components/onboarding/FloatingBadge';
import { colors, radius } from '@/theme';

const HEADER_GRADIENT = ['#00BC7D', '#00BBA7'] as const;
const ICON_GREEN = '#059669';
const GRAY_BARS = [72, 56, 84, 44];

/** Onboarding slide 3 (green): an AI "report" card with a checklist and a lightbulb tip. */
export function Slide3Illustration() {
  return (
    <View style={styles.box}>
      <View style={styles.ring} />

      <View style={styles.card}>
        <LinearGradient
          colors={HEADER_GRADIENT}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        />

        <View style={styles.body}>
          {/* Confirmed item */}
          <View style={styles.row}>
            <View style={[styles.dotCircle, { backgroundColor: '#D0FAE5' }]}>
              <Feather name="check" size={12} color={ICON_GREEN} />
            </View>
            <View style={[styles.bar, { flex: 1, backgroundColor: '#ECFDF5' }]} />
          </View>

          {/* Placeholder items */}
          {GRAY_BARS.map((w, i) => (
            <View key={i} style={styles.row}>
              <View style={[styles.dotCircle, { backgroundColor: '#F8FAFC' }]}>
                <View style={styles.innerDot} />
              </View>
              <View style={[styles.bar, { width: w, backgroundColor: '#F8FAFC' }]} />
            </View>
          ))}

          {/* Tip / action */}
          <View style={styles.tipRow}>
            <Ionicons name="bulb-outline" size={13} color={ICON_GREEN} />
            <View style={[styles.bar, { flex: 1, height: 6, backgroundColor: '#D0FAE5' }]} />
          </View>
        </View>
      </View>

      <View style={styles.badge}>
        <FloatingBadge
          icon={<Feather name="arrow-right" size={12} color={colors.safe} />}
          text="행동 제안"
          textColor={colors.safe}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { width: 260, height: 240, alignItems: 'center', justifyContent: 'center' },
  ring: {
    position: 'absolute',
    width: 176,
    height: 176,
    borderRadius: 88,
    borderWidth: 1.5,
    borderColor: 'rgba(164, 244, 207, 0.6)',
    top: (240 - 176) / 2,
    left: (260 - 176) / 2,
  },
  card: {
    width: 144,
    height: 201,
    backgroundColor: colors.white,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: '#ECFDF5',
    overflow: 'hidden',
    shadowColor: '#8CE5C0',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.55,
    shadowRadius: 22,
    elevation: 8,
  },
  header: { height: 8, width: '100%' },
  body: { padding: 12, gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dotCircle: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  innerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E2E8F0' },
  bar: { height: 8, borderRadius: radius.pill },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 8,
    marginTop: 2,
  },
  badge: { position: 'absolute', top: 6, right: -4 },
});
