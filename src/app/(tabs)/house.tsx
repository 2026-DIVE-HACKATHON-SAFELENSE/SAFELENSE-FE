import { Feather } from '@expo/vector-icons';
import { type ComponentProps, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  type StyleProp,
  TextInput,
  type TextInputProps,
  View,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { WideButton } from '@/components/WideButton';
import { colors, font, radius } from '@/theme';

type FeatherName = ComponentProps<typeof Feather>['name'];

const BUILDING_TYPES = ['빌라/다세대', '아파트', '오피스텔', '단독주택'];
const PLACEHOLDER = 'rgba(123, 139, 178, 0.4)';

function Label({ text, required }: { text: string; required?: boolean }) {
  return (
    <AppText weight="semibold" color={colors.textSecondary} style={styles.label}>
      {text}
      {required ? <AppText color="#FF6467"> *</AppText> : null}
    </AppText>
  );
}

function InputPill({
  icon,
  containerStyle,
  ...props
}: TextInputProps & { icon?: FeatherName; containerStyle?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.inputPill, containerStyle]}>
      {icon ? <Feather name={icon} size={16} color={colors.textSecondary} /> : null}
      <TextInput style={styles.input} placeholderTextColor={PLACEHOLDER} {...props} />
    </View>
  );
}

export default function House() {
  const insets = useSafeAreaInsets();
  const [address, setAddress] = useState('');
  const [deposit, setDeposit] = useState('');
  const [buildingType, setBuildingType] = useState('빌라/다세대');
  const [landlord, setLandlord] = useState('');
  const [date, setDate] = useState('');

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <AppText weight="bold" style={styles.title}>
          내 집
        </AppText>
        <AppText color={colors.textSecondary} style={styles.subtitle}>
          분석에 사용할 물건 정보를 입력해 주세요
        </AppText>

        <View style={styles.card}>
          <Label text="주소" required />
          <InputPill
            value={address}
            onChangeText={setAddress}
            placeholder="서울시 마포구 합정동 123-45"
          />
        </View>

        <View style={styles.card}>
          <Label text="보증금" required />
          <View style={styles.depositRow}>
            <InputPill
              containerStyle={styles.flex}
              value={deposit}
              onChangeText={setDeposit}
              placeholder="25000"
              keyboardType="number-pad"
            />
            <AppText weight="semibold" color={colors.textSecondary} style={styles.unit}>
              만원
            </AppText>
          </View>
        </View>

        <View style={styles.card}>
          <Label text="건물 유형" />
          <View style={styles.typeGrid}>
            {BUILDING_TYPES.map((t) => {
              const active = buildingType === t;
              return (
                <Pressable
                  key={t}
                  onPress={() => setBuildingType(t)}
                  style={({ pressed }) => [
                    styles.typeBtn,
                    active ? styles.typeActive : styles.typeInactive,
                    pressed && styles.pressed,
                  ]}
                >
                  <AppText
                    weight="semibold"
                    color={active ? colors.white : colors.textSecondary}
                    style={styles.typeText}
                  >
                    {t}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Label text="추가 정보 (선택)" />
          <AppText weight="medium" color={colors.textSecondary} style={styles.subLabel}>
            임대인 성명
          </AppText>
          <InputPill value={landlord} onChangeText={setLandlord} placeholder="홍길동" />
          <AppText weight="medium" color={colors.textSecondary} style={[styles.subLabel, styles.gap]}>
            계약 예정일
          </AppText>
          <InputPill value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
        </View>

        <View style={styles.note}>
          <Feather name="info" size={16} color={colors.brand} style={styles.noteIcon} />
          <AppText style={styles.noteText}>
            홈 화면에서 계약 단계를 선택하면 여기 입력한 물건 정보로 자동 분석됩니다.
          </AppText>
        </View>

        <View style={styles.submit}>
          <WideButton
            label="저장하기"
            onPress={() => Alert.alert('저장 완료', '물건 정보가 저장되었습니다. (데모)')}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  pressed: { opacity: 0.9 },
  body: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24 },
  title: { fontSize: 24, lineHeight: 32, color: colors.textPrimary },
  subtitle: { fontSize: 14, lineHeight: 20, marginTop: 4 },

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
  subLabel: { fontSize: 12, lineHeight: 16, marginTop: 12, marginBottom: 6 },
  gap: { marginTop: 12 },

  inputPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: '#F8F9FF',
    paddingHorizontal: 16,
  },
  input: { flex: 1, height: 44, fontFamily: font.regular, fontSize: 14, color: colors.textPrimary },
  depositRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  unit: { fontSize: 14, lineHeight: 20 },

  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  typeBtn: {
    width: '48%',
    flexGrow: 1,
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeActive: {
    backgroundColor: colors.brand,
    shadowColor: '#C6D2FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 3,
  },
  typeInactive: { backgroundColor: '#F8F9FF' },
  typeText: { fontSize: 14, lineHeight: 20 },

  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 12,
    backgroundColor: 'rgba(67, 97, 238, 0.05)',
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.button,
    padding: 14,
  },
  noteIcon: { opacity: 0.8, marginTop: 1 },
  noteText: { flex: 1, fontSize: 11, lineHeight: 18, color: 'rgba(67, 97, 238, 0.8)' },

  submit: { marginTop: 20 },
});
