/**
 * 분석 위저드의 진행 상태를 화면 간에 옮기는 모듈 단위 스토어.
 *
 * 위저드는 각기 다른 라우트 화면(서류→행태→위험정보→분석→리포트)이라 화면 전환 시
 * 컴포넌트 로컬 state 는 사라진다. 단일 진행 세션이므로 모듈 싱글턴으로 충분하다
 * (리액티브 필요 없음 — 각 화면은 마운트 시 읽고, "다음"에서 쓴다). 웹 새로고침으로
 * 유실될 수 있으므로, 최종 리포트는 별도로 analysisId 라우트 파라미터로도 복원한다.
 */
import type { AnalysisExecutionRequest, AnalysisResult } from '@/api/analysis';
import type { Property } from '@/api/property';
import type { ContractStage } from '@/data/behaviorChecklist';

export type AnalysisSession = {
  stage: ContractStage;
  /** 분석 대상 내 집. 실제 분석에는 property.id(=propertyId)가 필요하다. */
  property: Property | null;
  /** 서류 단계에서 생성한 케이스 ID. 서류 업로드와 analyze 가 공유한다. */
  caseId: number | null;
  /** 위험정보 입력값. null 이면 데모 모드(실제 analyze 미실행). */
  risk: AnalysisExecutionRequest | null;
  /** analyze 결과. 리포트에서 읽는다. */
  result: AnalysisResult | null;
};

let current: AnalysisSession | null = null;

/** 새 분석 흐름 시작 시(서류 체크리스트 진입) 세션 초기화. */
export function startSession(stage: ContractStage): void {
  current = { stage, property: null, caseId: null, risk: null, result: null };
}

export function getSession(): AnalysisSession | null {
  return current;
}

export function patchSession(patch: Partial<AnalysisSession>): void {
  if (!current) return;
  current = { ...current, ...patch };
}
