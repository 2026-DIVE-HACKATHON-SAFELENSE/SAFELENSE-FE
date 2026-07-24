import { router } from 'expo-router';

import { BehaviorChecklistScreen } from '@/components/flow/BehaviorChecklistScreen';

/** 계약 후 · 2단계 행태 체크리스트. */
export default function Behaviors() {
  return <BehaviorChecklistScreen stage="after" onNext={() => router.push('/after-contract/risk-input')} />;
}
