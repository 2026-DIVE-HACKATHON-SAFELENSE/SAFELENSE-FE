import { router } from 'expo-router';

import { DocumentChecklistScreen } from '@/components/flow/DocumentChecklistScreen';

/** 계약 중 · 1단계 서류 체크리스트. */
export default function Checklist() {
  return <DocumentChecklistScreen stage="during" onNext={() => router.push('/during-contract/behaviors')} />;
}
