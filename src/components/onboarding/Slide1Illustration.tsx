import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { FloatingBadge } from '@/components/onboarding/FloatingBadge';
import { colors } from '@/theme';

const BOX = 280;
const SHIELD_GRADIENT = ['#615FFF', '#155DFC'] as const;

/** Onboarding slide 1 (blue): a shield inside two concentric rings, flanked by chips. */
export function Slide1Illustration() {
  return (
    <View style={styles.box}>
      <View style={styles.ring1} />
      <View style={styles.ring2} />

      <LinearGradient
        colors={SHIELD_GRADIENT}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.shield}
      >
        <Ionicons name="shield" size={44} color={colors.white} />
      </LinearGradient>

      <View style={[styles.badge, { top: 8, right: -6 }]}>
        <FloatingBadge
          icon={<Feather name="alert-triangle" size={12} color={colors.danger} />}
          text="위험 감지"
          textColor={colors.danger}
        />
      </View>
      <View style={[styles.badge, { bottom: 26, left: -6 }]}>
        <FloatingBadge
          icon={<Feather name="check-circle" size={12} color={colors.safe} />}
          text="안전 확인"
          textColor={colors.safe}
        />
      </View>
    </View>
  );
}

const ringBase = {
  position: 'absolute',
  borderWidth: 1.5,
} as const;

const styles = StyleSheet.create({
  box: { width: BOX, height: BOX, alignItems: 'center', justifyContent: 'center' },
  ring1: {
    ...ringBase,
    width: 176,
    height: 176,
    borderRadius: 88,
    borderColor: 'rgba(198, 210, 255, 0.6)',
    top: (BOX - 176) / 2,
    left: (BOX - 176) / 2,
  },
  ring2: {
    ...ringBase,
    width: 128,
    height: 128,
    borderRadius: 64,
    borderColor: 'rgba(163, 179, 255, 0.5)',
    top: (BOX - 128) / 2,
    left: (BOX - 128) / 2,
  },
  shield: {
    width: 96,
    height: 96,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#A3B3FF',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.9,
    shadowRadius: 22,
    elevation: 10,
  },
  badge: { position: 'absolute' },
});
