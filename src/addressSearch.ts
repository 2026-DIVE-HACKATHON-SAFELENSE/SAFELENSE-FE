/**
 * 주소 검색 — 네이티브 no-op. Kakao 우편번호 위젯은 웹 전용(DOM 스크립트)이라
 * 네이티브에서는 미지원(추후 react-native-webview 로 대체 가능). 웹 구현은
 * addressSearch.web.ts. 호출부는 `isAddressSearchAvailable` 로 노출 여부를 가른다.
 */
export type AddressResult = {
  address: string;
  roadAddress: string;
  jibunAddress: string;
  zonecode: string;
  buildingName: string;
};

export async function openAddressSearch(): Promise<AddressResult | null> {
  return null;
}

export const isAddressSearchAvailable = false;
