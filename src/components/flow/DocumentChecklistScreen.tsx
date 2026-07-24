import { Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Easing, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { createCase, type DocumentSlot, getCase, toApiStage, uploadDocument } from '@/api/analysis';
import { getProperty } from '@/api/property';
import { useAuth } from '@/auth';
import { AppText } from '@/components/AppText';
import { Badge } from '@/components/Badge';
import { WideButton } from '@/components/WideButton';
import { WizardHeader } from '@/components/WizardHeader';
import { DOCUMENT_ITEMS, STAGE_LABEL, type ContractStage } from '@/data/contractFlow';
import { getSession, patchSession, startSession } from '@/flow/analysisSession';
import { colors, gradient, radius } from '@/theme';

/** 서버 서류종류(documentType) → 설명 문구. 없으면 설명 생략. */
const DOC_DESC: Record<string, string> = {
  REGISTRY_CERTIFICATE: '발급일 1개월 이내 · 근저당·압류 여부',
  BUILDING_LEDGER: '위반 건축물 여부 및 건물 현황',
  LAND_REGISTER: '토지 용도 및 권리관계',
  BROKER_LICENSE: '공인중개사 자격 조회',
  LANDLORD_TAX_CERTIFICATE: '임대인 세금 체납 여부',
  MANAGEMENT_FEE_STATEMENT: '관리비 미납 내역',
};

type Row = {
  key: string;
  /** 실제 서류 슬롯이면 documentType, 데모면 null. */
  documentType: string | null;
  title: string;
  desc: string;
  required: boolean;
  uploaded: boolean;
  fileName?: string | null;
};

/** 서류 한 줄: (좌) 체크 토글 영역 + (우) 파일 업로드 버튼. 두 Pressable 은 형제라 서로 간섭 없음. */
function DocRow({
  row,
  checked,
  uploading,
  onToggle,
  onUpload,
}: {
  row: Row;
  checked: boolean;
  uploading: boolean;
  onToggle: () => void;
  onUpload: () => void;
}) {
  return (
    <View style={[styles.card, checked ? styles.cardChecked : styles.cardUnchecked]}>
      <Pressable style={styles.main} onPress={onToggle}>
        <View style={[styles.radio, checked && styles.radioChecked]}>
          {checked ? <Feather name="check" size={12} color={colors.white} /> : null}
        </View>
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <AppText weight="semibold" color={checked ? colors.greenDeep : colors.textPrimary} style={styles.rowTitle}>
              {row.title}
            </AppText>
            {row.required ? <Badge label="필수" textColor={colors.dangerText} bg={colors.dangerBg} /> : null}
          </View>
          {row.desc ? (
            <AppText weight="medium" color={colors.textSecondary} style={styles.desc}>
              {row.desc}
            </AppText>
          ) : null}
          {row.uploaded && row.fileName ? (
            <View style={styles.fileChip}>
              <Feather name="paperclip" size={11} color={colors.brand} />
              <AppText weight="medium" color={colors.brand} style={styles.fileName} numberOfLines={1}>
                {row.fileName}
              </AppText>
            </View>
          ) : null}
        </View>
      </Pressable>

      <Pressable
        onPress={onUpload}
        disabled={uploading}
        style={({ pressed }) => [styles.uploadBtn, row.uploaded && styles.uploadBtnDone, pressed && styles.pressed]}
      >
        {uploading ? (
          <ActivityIndicator size="small" color={colors.brand} />
        ) : (
          <Feather name={row.uploaded ? 'check' : 'upload-cloud'} size={20} color={row.uploaded ? colors.mint : colors.brand} />
        )}
      </Pressable>
    </View>
  );
}

/**
 * 1단계 서류 체크리스트 (Figma 179:719). 각 항목에 파일 업로드 버튼이 있다.
 * 로그인 + 내 집이 있으면 분석 케이스를 만들고 서버 서류 슬롯을 렌더(실제 업로드),
 * 아니면 하드코딩 목록으로 폴백(업로드 시 로그인/등록 유도). `onNext`로 다음 단계 주입.
 */
export function DocumentChecklistScreen({ stage, onNext }: { stage: ContractStage; onNext: () => void }) {
  const insets = useSafeAreaInsets();
  const { status } = useAuth();
  const [slots, setSlots] = useState<DocumentSlot[] | null>(null);
  const [realState, setRealState] = useState<'pending' | 'ready' | 'nodata'>('pending');
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  // 흐름 시작: 세션 초기화 + (로그인+내집) 케이스 생성 & 서류 슬롯 로드.
  // 서류는 analyze 전에 올려야 하므로 케이스를 여기서 만든다(analyze 단계는 이 케이스 재사용).
  useEffect(() => {
    startSession(stage);
    if (status !== 'authenticated') return;
    let alive = true;
    (async () => {
      try {
        const property = await getProperty();
        if (!property) {
          if (alive) setRealState('nodata');
          return;
        }
        patchSession({ property });
        const created = await createCase(toApiStage(stage), property.id);
        patchSession({ caseId: created.id });
        const view = await getCase(created.id);
        if (alive) {
          setSlots(view.documents);
          setRealState('ready');
        }
      } catch {
        if (alive) setRealState('nodata');
      }
    })();
    return () => {
      alive = false;
    };
  }, [stage, status]);

  const mode: 'loading' | 'real' | 'demo' =
    status === 'loading' ? 'loading'
      : status !== 'authenticated' ? 'demo'
        : realState === 'pending' ? 'loading'
          : realState === 'ready' ? 'real'
            : 'demo';

  const rows: Row[] =
    mode === 'real' && slots
      ? slots.map((d) => ({
          key: d.documentType,
          documentType: d.documentType,
          title: d.label,
          desc: DOC_DESC[d.documentType] ?? '',
          required: d.required,
          uploaded: !!d.documentId,
          fileName: d.originalFileName,
        }))
      : DOCUMENT_ITEMS.map((it) => ({
          key: it.title,
          documentType: null,
          title: it.title,
          desc: it.desc,
          required: it.required,
          uploaded: false,
        }));

  const toggle = (key: string) => setChecked((prev) => ({ ...prev, [key]: !prev[key] }));

  const onUpload = async (row: Row) => {
    if (!row.documentType) {
      Alert.alert('로그인이 필요해요', '서류를 업로드하려면 로그인 후 내 집을 등록해 주세요.', [
        { text: '취소', style: 'cancel' },
        {
          text: status === 'authenticated' ? '내 집 등록' : '로그인',
          onPress: () => router.push(status === 'authenticated' ? '/house' : '/login'),
        },
      ]);
      return;
    }
    const caseId = getSession()?.caseId;
    if (!caseId) {
      Alert.alert('잠시만요', '분석 케이스를 준비 중이에요. 잠시 후 다시 시도해 주세요.');
      return;
    }
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true, multiple: false });
      if (res.canceled || !res.assets?.[0]) return;
      const asset = res.assets[0];
      setUploadingKey(row.key);
      const result = await uploadDocument(caseId, row.documentType, {
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType,
      });
      setSlots((prev) =>
        prev?.map((d) =>
          d.documentType === row.documentType
            ? {
                ...d,
                documentId: result.document.id,
                originalFileName: result.document.originalFileName,
                mimeType: result.document.mimeType,
                fileSize: result.document.fileSize,
              }
            : d,
        ) ?? prev,
      );
      setChecked((prev) => ({ ...prev, [row.key]: true }));
    } catch (e) {
      Alert.alert('업로드 실패', e instanceof Error ? e.message : '파일 업로드에 실패했어요.');
    } finally {
      setUploadingKey(null);
    }
  };

  const count = rows.filter((r) => checked[r.key]).length;
  const total = rows.length || 1;
  const pct = Math.round((count / total) * 100);

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
          {STAGE_LABEL[stage]} 서류 체크리스트
        </AppText>
        <AppText color={colors.textSecondary} style={styles.subtitle}>
          확인한 서류를 체크하고, 파일이 있으면 업로드해 주세요
        </AppText>

        <View style={styles.progressCard}>
          <View style={styles.progressRow}>
            <AppText weight="semibold" style={styles.progressLabel}>
              확인 완료
            </AppText>
            <AppText weight="bold" color={colors.brand} style={styles.progressLabel}>
              {count}/{total}
            </AppText>
          </View>
          <View style={styles.track}>
            <Animated.View style={[styles.fillWrap, { width: fillWidth }]}>
              <LinearGradient colors={gradient.progress} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.fillGrad} />
            </Animated.View>
          </View>
        </View>

        {mode === 'loading' ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.brand} />
          </View>
        ) : (
          <View style={styles.list}>
            {rows.map((row) => (
              <DocRow
                key={row.key}
                row={row}
                checked={!!checked[row.key]}
                uploading={uploadingKey === row.key}
                onToggle={() => toggle(row.key)}
                onUpload={() => onUpload(row)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <WideButton label="다음 단계로" icon={<Feather name="arrow-right" size={20} color={colors.white} />} onPress={onNext} />
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
  track: { marginTop: 8, height: 8, borderRadius: radius.pill, backgroundColor: colors.bg, overflow: 'hidden' },
  fillWrap: { height: 8, borderRadius: radius.pill, overflow: 'hidden' },
  fillGrad: { flex: 1 },

  loading: { marginTop: 40, alignItems: 'center' },
  list: { marginTop: 16, gap: 8 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: radius.button,
    borderWidth: 1,
    padding: 14,
  },
  cardUnchecked: {
    backgroundColor: colors.white,
    borderColor: colors.hairline,
    shadowColor: '#EEF2FF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 1.5,
    elevation: 1,
  },
  cardChecked: { backgroundColor: '#F3FEF8', borderColor: 'rgba(152, 230, 213, 0.72)' },
  main: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(123, 139, 178, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioChecked: { backgroundColor: colors.mint, borderColor: colors.mint },
  content: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  rowTitle: { fontSize: 14, lineHeight: 20 },
  desc: { fontSize: 12, lineHeight: 16, marginTop: 2 },
  fileChip: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  fileName: { flex: 1, fontSize: 11, lineHeight: 15 },

  uploadBtn: {
    width: 52,
    height: 52,
    borderRadius: radius.button,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadBtnDone: { backgroundColor: '#F3FEF8' },
  pressed: { opacity: 0.7 },

  footer: { paddingHorizontal: 20, paddingTop: 12 },
});
