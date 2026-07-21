import { router } from 'expo-router';

import { AnalyzingScreen } from '@/components/flow/AnalyzingScreen';

/** 계약 후 · 분석 애니메이션 → 리포트. */
export default function Analyzing() {
  return <AnalyzingScreen onDone={() => router.replace('/after-contract/report')} />;
}
