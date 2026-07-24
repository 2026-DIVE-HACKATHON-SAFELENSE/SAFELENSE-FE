/**
 * dist/index.html 에 링크 미리보기(Open Graph / Twitter) 메타태그를 주입한다.
 *
 * 이 앱은 web.output:"single" SPA 라 app/+html.tsx 가 무시되므로(AGENTS.md), <head>
 * 커스터마이즈는 빌드 후처리로 넣어야 한다. og:image 는 public/og-image.png →
 * dist/og-image.png 로 복사된 것을 절대 URL 로 참조한다(크롤러는 JS 를 실행하지 않으므로
 * 런타임 <Head> 로는 미리보기가 안 나온다). build:web 에 체이닝. 재실행해도 중복 주입 안 함.
 */
const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, '..', 'dist');
const FILE = path.join(DIST, 'index.html');
const IMG = path.join(DIST, 'og-image.png');
const MARKER = '<!-- og:injected -->';
const ORIGIN = 'https://safelense.site';

const TITLE = '세이프렌즈 · 전세 사기 위험 분석';
const DESC = 'AI가 계약 전·중·후 단계별로 전세 사기 위험을 분석해 보증금을 지켜드립니다.';
const OG_TITLE = '세이프렌즈 (SafeLens)';
const OG_DESC = '전세 사기로부터 내 보증금을 지킵니다 · AI 전세 위험 분석';

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

/** 의존성 없이 PNG 헤더(IHDR)에서 크기를 읽는다. */
function pngSize(file) {
  try {
    const buf = fs.readFileSync(file);
    if (buf.length < 24 || buf.readUInt32BE(0) !== 0x89504e47) return null;
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  } catch {
    return null;
  }
}

if (!fs.existsSync(FILE)) {
  console.error('inject-meta: dist/index.html 없음 — expo export 를 먼저 실행하세요');
  process.exit(1);
}

let html = fs.readFileSync(FILE, 'utf8');
if (html.includes(MARKER)) {
  console.log('inject-meta: 이미 주입됨, 건너뜀');
  process.exit(0);
}

const size = pngSize(IMG);
const wide = size ? size.width / size.height >= 1.5 : false;

const imageTags = size
  ? `
    <meta property="og:image" content="${ORIGIN}/og-image.png" />
    <meta property="og:image:width" content="${size.width}" />
    <meta property="og:image:height" content="${size.height}" />
    <meta name="twitter:image" content="${ORIGIN}/og-image.png" />`
  : '';

const tags = `${MARKER}
    <meta name="description" content="${esc(DESC)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="세이프렌즈" />
    <meta property="og:title" content="${esc(OG_TITLE)}" />
    <meta property="og:description" content="${esc(OG_DESC)}" />
    <meta property="og:url" content="${ORIGIN}" />
    <meta property="og:locale" content="ko_KR" />${imageTags}
    <meta name="twitter:card" content="${wide ? 'summary_large_image' : 'summary'}" />
    <meta name="twitter:title" content="${esc(OG_TITLE)}" />
    <meta name="twitter:description" content="${esc(OG_DESC)}" />
  `;

html = html.replace('<html lang="en">', '<html lang="ko">');
html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(TITLE)}</title>`);
html = html.replace('</head>', `${tags}</head>`);

fs.writeFileSync(FILE, html);
console.log(`inject-meta: 메타 주입 완료 (og:image ${size ? `${size.width}x${size.height}` : '없음'})`);
