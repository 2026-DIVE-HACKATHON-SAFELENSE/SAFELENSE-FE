import Svg, { Path } from 'react-native-svg';

/** Kakao speech-bubble symbol (exported from the Figma login component). */
export function KakaoLogo({ size = 24, color = '#000000' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.0001 0.8C5.37225 0.8 0 4.95066 0 10.0698C0 13.2534 2.07788 16.06 5.24205 17.7293L3.91072 22.5927C3.7931 23.0224 4.28457 23.365 4.66197 23.1159L10.4978 19.2643C10.9903 19.3118 11.4908 19.3396 12.0001 19.3396C18.6274 19.3396 24 15.1891 24 10.0698C24 4.95066 18.6274 0.8 12.0001 0.8Z"
        fill={color}
      />
    </Svg>
  );
}
