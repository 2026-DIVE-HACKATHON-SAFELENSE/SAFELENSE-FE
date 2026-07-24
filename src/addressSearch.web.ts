/**
 * 주소 검색 — 웹. Kakao(다음) 우편번호 서비스. API 키 불필요, 스크립트만 로드.
 * 네이티브는 addressSearch.ts(no-op, WebView 는 추후)로 대체된다.
 */
export type AddressResult = {
  /** 표시용 주소(도로명 우선). */
  address: string;
  roadAddress: string;
  jibunAddress: string;
  zonecode: string;
  buildingName: string;
};

type PostcodeData = {
  address: string;
  roadAddress: string;
  jibunAddress: string;
  zonecode: string;
  buildingName: string;
};
type PostcodeInstance = { open: () => void };
type PostcodeCtor = new (opts: {
  oncomplete: (data: PostcodeData) => void;
  onclose?: () => void;
}) => PostcodeInstance;

const SCRIPT_SRC = 'https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';

const globalPostcode = (): PostcodeCtor | undefined => {
  const g = window as unknown as {
    daum?: { Postcode?: PostcodeCtor };
    kakao?: { Postcode?: PostcodeCtor };
  };
  return g.daum?.Postcode ?? g.kakao?.Postcode;
};

let scriptPromise: Promise<void> | null = null;
function loadScript(): Promise<void> {
  if (typeof document === 'undefined') return Promise.reject(new Error('브라우저 환경이 아닙니다.'));
  if (globalPostcode()) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = SCRIPT_SRC;
    s.onload = () => resolve();
    s.onerror = () => {
      scriptPromise = null;
      reject(new Error('주소 검색 스크립트를 불러오지 못했어요.'));
    };
    document.head.appendChild(s);
  });
  return scriptPromise;
}

/** 우편번호 검색 팝업을 열고 선택 결과를 반환한다. 취소하면 null. */
export async function openAddressSearch(): Promise<AddressResult | null> {
  await loadScript();
  const Postcode = globalPostcode();
  if (!Postcode) throw new Error('주소 검색을 불러오지 못했어요.');
  return new Promise((resolve) => {
    let picked = false;
    const pc = new Postcode({
      oncomplete: (data) => {
        picked = true;
        resolve({
          address: data.roadAddress || data.address || data.jibunAddress,
          roadAddress: data.roadAddress,
          jibunAddress: data.jibunAddress,
          zonecode: data.zonecode,
          buildingName: data.buildingName,
        });
      },
      onclose: () => {
        if (!picked) resolve(null);
      },
    });
    pc.open();
  });
}

/** 웹에서 주소 검색 사용 가능 여부. */
export const isAddressSearchAvailable = true;
