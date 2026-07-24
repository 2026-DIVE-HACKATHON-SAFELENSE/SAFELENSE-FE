/**
 * 내 집(property) API — `/api/v1/me/property` (OpenAPI 계약 기준).
 */
import { api } from '@/api/client';

export type BuildingType = 'MULTI_FAMILY' | 'APARTMENT' | 'OFFICETEL' | 'DETACHED_HOUSE';

/** UI 라벨 ↔ 서버 enum 매핑 (건물 유형). */
export const BUILDING_TYPE_OPTIONS: { label: string; value: BuildingType }[] = [
  { label: '빌라/다세대', value: 'MULTI_FAMILY' },
  { label: '아파트', value: 'APARTMENT' },
  { label: '오피스텔', value: 'OFFICETEL' },
  { label: '단독주택', value: 'DETACHED_HOUSE' },
];

export const buildingTypeLabel = (v: BuildingType): string =>
  BUILDING_TYPE_OPTIONS.find((o) => o.value === v)?.label ?? BUILDING_TYPE_OPTIONS[0].label;

export const buildingTypeValue = (label: string): BuildingType =>
  BUILDING_TYPE_OPTIONS.find((o) => o.label === label)?.value ?? 'MULTI_FAMILY';

/** GET /me/property (HomePropertyResponse). */
export type Property = {
  id: number;
  address: string;
  /** 전세 보증금, 단위 만원. */
  depositAmount: number;
  buildingType: BuildingType;
  landlordName?: string | null;
  /** 계약 예정일 (YYYY-MM-DD). */
  plannedContractDate?: string | null;
};

/** POST/PATCH 요청 바디. */
export type PropertyInput = {
  address: string;
  depositAmount: number;
  buildingType: BuildingType;
  landlordName?: string | null;
  plannedContractDate?: string | null;
};

type PropertyEnvelope = { property: Property | null };

/** 등록된 내 집 조회. 미등록이면 null. */
export async function getProperty(): Promise<Property | null> {
  const env = await api.get<PropertyEnvelope>('/api/v1/me/property');
  return env.property ?? null;
}

/** 최초 등록 (POST). 응답 바디가 없어 반환값 없음 — 필요 시 getProperty 로 재조회. */
export function createProperty(input: PropertyInput): Promise<void> {
  return api.post<void>('/api/v1/me/property', input);
}

/** 부분 수정 (PATCH) → 갱신된 property. */
export async function updateProperty(input: Partial<PropertyInput>): Promise<Property | null> {
  const env = await api.patch<PropertyEnvelope>('/api/v1/me/property', input);
  return env.property ?? null;
}
