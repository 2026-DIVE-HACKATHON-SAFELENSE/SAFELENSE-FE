import { router } from 'expo-router';

import { RiskInputScreen } from '@/components/flow/RiskInputScreen';

/** 계약 중 · 3단계 위험 정보 입력. */
export default function RiskInput() {
  return <RiskInputScreen stage="during" onNext={() => router.push('/during-contract/analyzing')} />;
}
