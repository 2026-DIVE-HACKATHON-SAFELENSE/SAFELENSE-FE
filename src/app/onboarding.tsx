import { router } from 'expo-router';
import { useRef } from 'react';
import { ScrollView, useWindowDimensions, View } from 'react-native';

import { OnboardingSlide, type SlideContent } from '@/components/onboarding/OnboardingSlide';
import { Slide1Illustration } from '@/components/onboarding/Slide1Illustration';
import { Slide2Illustration } from '@/components/onboarding/Slide2Illustration';
import { Slide3Illustration } from '@/components/onboarding/Slide3Illustration';
import { colors } from '@/theme';

const SLIDES: SlideContent[] = [
  {
    accent: '#4361EE',
    gradient: ['#4361EE', 'rgba(67, 97, 238, 0.8)'],
    label: '세이프:렌즈',
    title: '계약은 한 번이지만,\n위험은 평생 남을 수 있습니다.',
    subtitle: 'AI가 계약 전·중·후 단계에서 숨겨진 위험을\n미리 찾아드립니다.',
    buttonLabel: '다음',
    Illustration: Slide1Illustration,
  },
  {
    accent: '#8B5CF6',
    gradient: ['#8B5CF6', 'rgba(139, 92, 246, 0.8)'],
    label: '세이, 프렌즈!',
    title: '공공 데이터와 실제 상담 사례를\n함께 분석합니다.',
    subtitle: '시세, 등기 정보, 보증 정보와 실제 상담 사례를 비교하여\n계약의 위험 요소를 알려드립니다.',
    buttonLabel: '다음',
    Illustration: Slide2Illustration,
  },
  {
    accent: '#10B981',
    gradient: ['#10B981', 'rgba(16, 185, 129, 0.8)'],
    label: '세입, 프렌즈',
    title: '위험을 알려주는 것을 넘어,\n행동까지 제안합니다.',
    subtitle: '계약 전 확인해야 할 사항부터 지금 해야 할 예방 행동까지\nAI 리포트로 안내해드립니다.',
    buttonLabel: '시작하기',
    Illustration: Slide3Illustration,
  },
];

export default function Onboarding() {
  const { width, height } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);

  const goToLogin = () => router.replace('/login');
  const goToSlide = (i: number) => scrollRef.current?.scrollTo({ x: i * width, animated: true });

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      style={{ flex: 1, backgroundColor: colors.bg }}
    >
      {SLIDES.map((slide, i) => (
        <View key={slide.label} style={{ width, height }}>
          <OnboardingSlide
            {...slide}
            index={i}
            total={SLIDES.length}
            onSkip={goToLogin}
            onNext={() => (i === SLIDES.length - 1 ? goToLogin() : goToSlide(i + 1))}
          />
        </View>
      ))}
    </ScrollView>
  );
}
