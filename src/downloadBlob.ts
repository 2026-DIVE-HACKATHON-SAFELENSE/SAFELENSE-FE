/**
 * Blob 다운로드 — 네이티브 no-op. 브라우저 다운로드 API 가 없어 미지원
 * (추후 expo-file-system + expo-sharing 으로 확장 가능). 웹 구현은 downloadBlob.web.ts.
 * 호출부는 `isDownloadSupported` 로 분기한다.
 */
export function downloadBlob(_blob: Blob, _filename: string): void {
  throw new Error('다운로드는 웹에서 지원됩니다.');
}

export const isDownloadSupported = false;
