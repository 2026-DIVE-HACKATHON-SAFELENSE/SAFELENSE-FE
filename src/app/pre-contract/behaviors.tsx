import { router } from 'expo-router';

import { BehaviorChecklistScreen } from '@/components/flow/BehaviorChecklistScreen';

/** 계약 전 · 2단계 행태 체크리스트. */
export default function Behaviors() {
  return <BehaviorChecklistScreen stage="before" onNext={() => router.push('/pre-contract/risk-input')} />;
}
