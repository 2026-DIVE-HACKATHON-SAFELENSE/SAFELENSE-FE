import { router } from 'expo-router';

import { DocumentChecklistScreen } from '@/components/flow/DocumentChecklistScreen';

/** 계약 후 · 1단계 서류 체크리스트. */
export default function Checklist() {
  return <DocumentChecklistScreen stage="after" onNext={() => router.push('/after-contract/behaviors')} />;
}
