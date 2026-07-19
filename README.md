# 세이프렌즈 (SafeLens) — Frontend

전세 사기로부터 보증금을 지키는 계약 리스크 분석 앱. AI가 계약 전·중·후 단계에서
공공 데이터와 실제 상담 사례를 분석해 숨겨진 위험을 찾고, 취해야 할 행동까지 제안합니다.

React Native (Expo · TypeScript)로 구현합니다.

## 구현 범위

**온보딩**
- **스플래시** (`src/app/index.tsx`) — 집 로고 → 돋보기가 겹쳐지며 SafeLens 로고 완성, 이후 온보딩으로 이동
- **온보딩 캐러셀** (`src/app/onboarding.tsx`) — 3개 인트로 슬라이드(파랑/보라/초록), Skip · 다음 · 시작하기 · 페이지 인디케이터
- **로그인** (`src/app/login.tsx`) — 카카오 로그인(현재 stub → 홈 진입), 회원가입 · 둘러보기, 약관 안내

**메인 앱** (로그인 이후)
- **홈** (`src/app/(tabs)/home.tsx`) — 내 집 정보 배너 + 계약 전/중/후 단계 카드 + 하단 탭(홈·내 집·마이페이지)
- **계약 전 플로우** (`src/app/pre-contract/`) — 3단계 위저드
  - `checklist.tsx` — 1단계 서류 체크리스트(6항목, 체크 시 초록 + 진행바)
  - `behaviors.tsx` — 2단계 행태 체크리스트(9항목, 의심 행태 감지 배너)
  - `analyzing.tsx` — AI 분석 로딩(공공→민간→유사사례→리포트 4단계 자동 진행)
  - `report.tsx` — 종합 위험 지수 리포트(게이지 + 세그먼트 탭 + 지원센터 안내)
- **내 집** (`src/app/(tabs)/house.tsx`) — 물건 정보 입력 폼(주소·보증금·건물 유형·추가 정보)
- **마이페이지** (`src/app/(tabs)/mypage.tsx`) — 게스트/로그인 상태(통계·로그아웃), `src/auth.tsx` mock 인증

## 기술 스택

| | |
|---|---|
| 런타임 | Expo SDK 57 · React Native 0.86 · React 19.2 |
| 라우팅 | Expo Router (파일 기반, `src/app/`) |
| 언어 | TypeScript |
| UI | expo-linear-gradient · react-native-svg · @expo/vector-icons |
| 폰트 | Pretendard (Regular/Medium/SemiBold/Bold, 번들) |

## 실행 방법

```bash
npm install
npx expo start           # QR로 Expo Go 실행, 또는 아래 플랫폼 선택
npx expo start --android # Android
npx expo start --ios     # iOS (macOS 필요)
npx expo start --web     # 웹 미리보기
```

## 프로젝트 구조

```
src/
  app/                      # Expo Router 라우트
    _layout.tsx             # 루트 Stack, Pretendard 로드, 스플래시 게이팅
    index.tsx               # 스플래시
    onboarding.tsx          # 온보딩 캐러셀
    login.tsx               # 로그인
    (tabs)/                 # 하단 탭 네비게이터 (홈·내 집·마이페이지)
    pre-contract/           # 계약 전 위저드 (checklist→behaviors→analyzing→report)
  components/               # AppText, GradientButton, WideButton, Badge,
                            # ChecklistCard, WizardHeader, Pagination, ComingSoon,
                            # KakaoLogo, onboarding/ 일러스트
  theme.ts                  # 색상·폰트·radius 등 디자인 토큰
assets/
  fonts/                    # Pretendard OTF
  images/onboarding/        # 스플래시 프레임
```

## 남은 작업 (다음 마일스톤)

- 카카오 로그인 실연동 (`@react-native-seoul/kakao-login`, dev build + 앱키)
- 계약 중 / 계약 후 분석 플로우
- 내 집 폼 입력값을 분석에 실제 연동 (현재는 로컬 상태)
- 리포트 유사사례/체크리스트요약/권고사항 탭 실데이터 연동
- 실제 공공·민간 데이터 API 연동 (현재 리포트 수치는 데모 값)

## 웹 배포 (Cloudflare Pages)

`main` push 시 GitHub Actions가 자동 빌드·배포합니다(시크릿 2개만 등록하면 활성화).
로컬 빌드는 `npm run build:web` → `dist/`. 자세한 설정은 [DEPLOY.md](./DEPLOY.md) 참고.

## 디자인

Figma `DIVE` 파일 기준으로 구현. 온보딩 색상 토큰은 `src/theme.ts` 참고.
