/**
 * 분석(analysis) API — 분석 템플릿·케이스·체크리스트·위험분석·결과 (OpenAPI 계약 기준).
 *
 * 흐름: 템플릿 조회 → 케이스 생성(POST /analysis-cases, propertyId 필요)
 *   → 체크리스트 저장(PUT .../checklist) → 위험분석 실행(POST .../analyze)
 *   → 결과(AnalysisResultDetail). 이력은 GET /analyses.
 */
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';

import { api } from '@/api/client';
import type { ContractStage } from '@/data/behaviorChecklist';

/** 서버 단계 enum ↔ 앱 단계('before'|'during'|'after'). */
export type ApiStage = 'BEFORE_CONTRACT' | 'DURING_CONTRACT' | 'AFTER_CONTRACT';
const STAGE_MAP: Record<ContractStage, ApiStage> = {
  before: 'BEFORE_CONTRACT',
  during: 'DURING_CONTRACT',
  after: 'AFTER_CONTRACT',
};
export const toApiStage = (s: ContractStage): ApiStage => STAGE_MAP[s];

// ── 템플릿 ────────────────────────────────────────────────────────────────
export type ChecklistItemTemplate = { itemKey: string; label: string };
export type ChecklistSectionTemplate = { sectionKey: string; label: string; items: ChecklistItemTemplate[] };
export type DocumentTemplate = { documentType: string; label: string; required: boolean };
export type AnalysisTemplate = {
  stage: ApiStage;
  version: string;
  documents: DocumentTemplate[];
  sections: ChecklistSectionTemplate[];
};

export function getTemplate(stage: ApiStage): Promise<AnalysisTemplate> {
  return api.get<AnalysisTemplate>(`/api/v1/analysis-templates/${stage}`);
}

// ── 케이스 · 체크리스트 ─────────────────────────────────────────────────────
export type CaseCreated = { id: number; propertyId: number; stage: ApiStage; templateVersion: string };

/** 분석 케이스 생성. propertyId(등록된 내 집 ID)가 반드시 필요하다. */
export function createCase(stage: ApiStage, propertyId: number): Promise<CaseCreated> {
  return api.post<CaseCreated>('/api/v1/analysis-cases', { stage, propertyId });
}

export type ChecklistAnswer = { itemKey: string; checked: boolean };

/** 체크리스트 답변 전체 저장(교체). */
export function saveChecklist(caseId: number, answers: ChecklistAnswer[]): Promise<{ answers: ChecklistAnswer[] }> {
  return api.put(`/api/v1/analysis-cases/${caseId}/checklist`, { answers });
}

// ── 케이스 조회 · 서류 업로드 ─────────────────────────────────────────────────
export type DocumentSlot = {
  documentType: string;
  label: string;
  required: boolean;
  documentId?: number | null;
  originalFileName?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
};

export type AnalysisCaseView = {
  id: number;
  propertyId: number;
  stage: ApiStage;
  templateVersion: string;
  documents: DocumentSlot[];
  uploadedCount: number;
  answers: ChecklistAnswer[];
};

/** 케이스 상태(서류 슬롯 + 업로드 여부 + 체크리스트 답변) 조회. */
export function getCase(caseId: number): Promise<AnalysisCaseView> {
  return api.get<AnalysisCaseView>(`/api/v1/analysis-cases/${caseId}`);
}

/** 파일 선택 결과(플랫폼 공통). */
export type PickedFile = { uri: string; name: string; mimeType?: string | null };

export type DocumentUploadResult = {
  document: { id: number; documentType: string; originalFileName: string; mimeType: string; fileSize: number };
  uploadedCount: number;
};

/**
 * 서류 파일 업로드 (멀티파트). documentType 은 쿼리 파라미터.
 * 웹은 Blob, 네이티브는 {uri,name,type} 로 FormData 에 담는다.
 * 주의: 케이스가 analyze 되면 잠기므로(409 ANALYSIS_CASE_LOCKED) 업로드는 분석 전에 해야 한다.
 */
export async function uploadDocument(
  caseId: number,
  documentType: string,
  file: PickedFile,
): Promise<DocumentUploadResult> {
  const form = new FormData();
  if (Platform.OS === 'web') {
    const blob = await (await fetch(file.uri)).blob();
    form.append('file', blob, file.name);
  } else {
    form.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.mimeType ?? 'application/octet-stream',
    } as unknown as Blob);
  }
  return api.post<DocumentUploadResult>(
    `/api/v1/analysis-cases/${caseId}/documents?documentType=${encodeURIComponent(documentType)}`,
    form,
  );
}

// ── 위험분석 실행 ───────────────────────────────────────────────────────────
export type SeniorRightStatus = 'NONE' | 'MORTGAGE' | 'PRIOR_TENANT' | 'SEIZURE' | 'UNKNOWN';
export type DepositGuaranteeStatus = 'ENROLLED' | 'NOT_ENROLLED' | 'UNKNOWN';
export type OwnershipStatus = 'MATCHED' | 'MISMATCHED' | 'UNKNOWN';
export type SeizureOrAuctionStatus = 'NONE' | 'SEIZURE' | 'AUCTION' | 'UNKNOWN';

/** 규칙형 위험분석 입력값. 금액은 만원, 미상은 UNKNOWN/null. */
export type AnalysisExecutionRequest = {
  estimatedPropertyValueManwon?: number | null;
  seniorClaimAmountManwon?: number | null;
  seniorRightStatus: SeniorRightStatus;
  depositGuaranteeStatus: DepositGuaranteeStatus;
  ownershipStatus: OwnershipStatus;
  seizureOrAuctionStatus: SeizureOrAuctionStatus;
};

export type RiskGrade = 'UNKNOWN' | 'LOW' | 'MEDIUM' | 'HIGH';

/** AnalysisResultDetail. */
export type AnalysisResult = {
  id: number;
  caseId: number;
  propertyId: number;
  stage: ApiStage;
  /** 위험 점수 0~100. 근거 부족 시 null. */
  score: number | null;
  grade: RiskGrade;
  /** 입력 근거 충족률 0~100. */
  confidence: number;
  summary: string;
  findings: string[];
  recommendations: string[];
  ruleVersion: string;
  analyzedAt: string;
};

/**
 * 위험분석 실행 → 결과.
 * `Idempotency-Key` 헤더는 스펙상 optional 이지만 백엔드가 실제로는 필수로 요구한다
 * (없으면 400 INVALID_REQUEST). 매 실행마다 새 UUID 로 보낸다.
 */
export function runAnalyze(caseId: number, input: AnalysisExecutionRequest): Promise<AnalysisResult> {
  return api.post<AnalysisResult>(`/api/v1/analysis-cases/${caseId}/analyze`, input, true, {
    'Idempotency-Key': Crypto.randomUUID(),
  });
}

// ── 이력 · 결과 조회 ────────────────────────────────────────────────────────
export type AnalysisSummary = {
  id: number;
  caseId: number;
  propertyId: number;
  stage: ApiStage;
  score: number | null;
  grade: RiskGrade;
  confidence: number;
  summary: string;
  analyzedAt: string;
};
export type AnalysisHistoryPage = { analyses: AnalysisSummary[]; nextCursor?: number | null; hasNext: boolean };

export function listAnalyses(): Promise<AnalysisHistoryPage> {
  return api.get<AnalysisHistoryPage>('/api/v1/analyses');
}

export function getAnalysis(analysisId: number): Promise<AnalysisResult> {
  return api.get<AnalysisResult>(`/api/v1/analyses/${analysisId}`);
}

// ── UI 표시 헬퍼 ────────────────────────────────────────────────────────────
/** 위험 등급 → 한글 라벨·색. 리포트 화면 등에서 사용. */
export function gradeDescriptor(grade: RiskGrade): { label: string; color: string } {
  switch (grade) {
    case 'LOW':
      return { label: '저위험', color: '#10B981' };
    case 'MEDIUM':
      return { label: '중위험', color: '#FE9A00' };
    case 'HIGH':
      return { label: '고위험', color: '#FB2C36' };
    default:
      return { label: '정보 부족', color: '#7B8BB2' };
  }
}
