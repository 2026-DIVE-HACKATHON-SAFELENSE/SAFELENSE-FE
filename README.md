# 세이프렌즈 (SafeLens) — Frontend

전세 사기로부터 보증금을 지키는 계약 리스크 분석 앱. AI가 계약 전·중·후 단계에서
공공 데이터와 실제 상담 사례를 분석해 숨겨진 위험을 찾고, 취해야 할 행동까지 제안합니다.

React Native (Expo · TypeScript)로 구현합니다.

## 현재 구현 범위: 온보딩

- **스플래시** (`src/app/index.tsx`) — 집 로고 → 돋보기가 겹쳐지며 SafeLens 로고 완성, 이후 온보딩으로 이동
- **온보딩 캐러셀** (`src/app/onboarding.tsx`) — 3개 인트로 슬라이드(파랑/보라/초록), Skip · 다음 · 시작하기 · 페이지 인디케이터
- **로그인** (`src/app/login.tsx`) — 카카오 로그인(현재 stub), 회원가입 · 둘러보기, 약관 안내

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
    onboarding.tsx          # 온보딩 캐러셀 (슬라이드 데이터 포함)
    login.tsx               # 로그인
  components/
    AppText.tsx             # Pretendard 텍스트 프리미티브
    GradientButton.tsx      # 다음/시작하기 CTA
    SkipButton.tsx          # 건너뛰기
    Pagination.tsx          # 페이지 인디케이터
    KakaoLogo.tsx           # 카카오 심볼 (SVG)
    onboarding/             # 슬라이드 레이아웃 + 일러스트 3종
  theme.ts                  # 색상·폰트·radius 등 디자인 토큰
assets/
  fonts/                    # Pretendard OTF
  images/onboarding/        # 스플래시 프레임
```

## 남은 작업 (다음 마일스톤)

- 카카오 로그인 실연동 (`@react-native-seoul/kakao-login`, dev build + 앱키)
- 홈/분석 등 온보딩 이후 화면
- "둘러보기"(비로그인) · "회원가입" 플로우

## 디자인

Figma `DIVE` 파일 기준으로 구현. 온보딩 색상 토큰은 `src/theme.ts` 참고.
