/**
 * Blob 다운로드 — 웹. `<a download>` 클릭으로 브라우저 다운로드를 트리거한다.
 * 네이티브는 downloadBlob.ts(미지원)로 대체된다.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export const isDownloadSupported = true;
