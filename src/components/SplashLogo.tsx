import { useEffect, useState } from 'react';
import { Animated } from 'react-native';
import Svg, { Ellipse, Path } from 'react-native-svg';

/**
 * SafeLens splash mark — a blue house with two eyes (Figma "스플래시", node
 * 42:4486 / 42:4517). The eyes blink: `blink` (1 = open → ~0 = closed) squashes
 * their vertical radius about the eye line.
 *
 * Geometry is in an 83×73 viewBox lifted from the Figma logo bounds.
 *
 * The blink is drawn by shrinking each eye's `ry`, NOT by scaling a `<G>`. Every
 * eye sits on the same eye line (cy = 46.5), so a vertical group-scale about that
 * line is identical to setting `ry = r × blink` per eye — and unlike `<G>`'s
 * `scaleY`/`originX`/`originY` props (which react-native-svg leaks straight to the
 * DOM on web, erroring and never animating), `ry` is a plain SVG attribute that
 * works the same on web + native. `blink` is subscribed via a listener and
 * rendered as ordinary numeric state; the re-renders are trivial for a splash.
 */
export function SplashLogo({ size = 104, blink }: { size?: number; blink: Animated.Value }) {
  const height = (size * 73) / 83;

  const [eyeScaleY, setEyeScaleY] = useState(1);
  useEffect(() => {
    const id = blink.addListener(({ value }) => setEyeScaleY(value));
    return () => blink.removeListener(id);
  }, [blink]);

  return (
    <Svg width={size} height={height} viewBox="0 0 83 73">
      <Path d="M0 24 L38.9 1.5 Q41.5 0 44.1 1.5 L83 24 L83 73 L0 73 Z" fill="#4361EE" />
      <Ellipse cx={30.5} cy={46.5} rx={10.5} ry={10.5 * eyeScaleY} fill="#FFFFFF" />
      <Ellipse cx={52.5} cy={46.5} rx={10.5} ry={10.5 * eyeScaleY} fill="#FFFFFF" />
      <Ellipse cx={32} cy={46.5} rx={6.5} ry={6.5 * eyeScaleY} fill="#111111" />
      <Ellipse cx={50.5} cy={46.5} rx={6.5} ry={6.5 * eyeScaleY} fill="#111111" />
    </Svg>
  );
}
