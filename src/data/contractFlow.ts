/**
 * 계약 단계(전/중/후) 공통 플로우 데이터.
 *
 * 세 단계 모두 동일한 4-step 마법사를 따른다:
 *   1-1 서류 체크리스트 → 1-2 행태 체크리스트 → 분석(analyzing) → 리포트(report)
 *
 * 행태 체크리스트 항목은 단계별로 다르며 `behaviorChecklist.ts`에 있다.
 * 서류 체크리스트 항목은 세 단계가 공통이고(제목만 단계별로 다름), 분석·리포트는
 * 공용 데모 데이터를 재사용한다.
 */

import type { ContractStage } from './behaviorChecklist';

export type { ContractStage };

/** 단계 라벨 — 서류 체크리스트 제목("계약 전 서류 체크리스트" 등)에 사용. */
export const STAGE_LABEL: Record<ContractStage, string> = {
  before: '계약 전',
  during: '계약 중',
  after: '계약 후',
};

/**
 * 서류 체크리스트 — 세 단계 공통 (Figma 179:719 / 179:1139 / 179:2473).
 * 디자인상 항목은 동일하고 제목만 단계별로 달라진다.
 */
export type DocumentItem = { title: string; desc: string; required: boolean };
export const DOCUMENT_ITEMS: DocumentItem[] = [
  { title: '등기부등본 확인', desc: '발급일 1개월 이내 · 근저당·압류 여부', required: true },
  { title: '건축물대장 확인', desc: '위반 건축물 여부 및 건물 현황', required: true },
  { title: '토지대장 확인', desc: '토지 용도 및 권리관계', required: false },
  { title: '표준 임대차계약서 사용', desc: '국토교통부 표준 양식 사용', required: true },
  { title: '공인중개사 중개 확인', desc: '국가공간정보포털에서 자격 조회', required: true },
  { title: '전세보증보험 가입 가능', desc: 'HUG 또는 SGI 서울보증 사전 확인', required: false },
];
