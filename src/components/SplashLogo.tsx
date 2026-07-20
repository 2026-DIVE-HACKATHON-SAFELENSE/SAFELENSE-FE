import { Animated } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';

const AnimatedG = Animated.createAnimatedComponent(G);

/**
 * SafeLens splash mark — a blue house with two eyes (Figma "스플래시", node
 * 42:4486 / 42:4517). The eyes (whites + pupils) live in a group that scales
 * vertically about the eye line, so `blink` (1 = open → ~0 = closed) makes the
 * mascot blink.
 *
 * Geometry is in an 83×73 viewBox lifted from the Figma logo bounds.
 */
export function SplashLogo({ size = 104, blink }: { size?: number; blink: Animated.Value }) {
  const height = (size * 73) / 83;

  return (
    <Svg width={size} height={height} viewBox="0 0 83 73">
      <Path d="M0 24 L38.9 1.5 Q41.5 0 44.1 1.5 L83 24 L83 73 L0 73 Z" fill="#4361EE" />
      <AnimatedG originX={41.5} originY={46.5} scaleY={blink}>
        <Circle cx={30.5} cy={46.5} r={10.5} fill="#FFFFFF" />
        <Circle cx={52.5} cy={46.5} r={10.5} fill="#FFFFFF" />
        <Circle cx={32} cy={46.5} r={6.5} fill="#111111" />
        <Circle cx={50.5} cy={46.5} r={6.5} fill="#111111" />
      </AnimatedG>
    </Svg>
  );
}
