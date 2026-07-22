import { useEffect, useState } from 'react';
import { Animated } from 'react-native';
import Svg, { Ellipse, Path } from 'react-native-svg';

/**
 * SafeLens splash mark — a blue house with two eyes (Figma "스플래시 1~4",
 * 42:4486 → 91:106 → 91:94 → 42:4517). Geometry is in an 83×73 viewBox measured
 * from the exported "Group 63" asset: eye whites r=17 at (26,46)/(57,46), pupils
 * r=6.5 at (32.5,46.5)/(50.5,46.5).
 *
 * The blink mirrors the Figma layer structure: whites and pupils never move.
 * Instead a white "eyelid" ellipse per eye (rx 10.5, top edge pinned at y=36 —
 * Ellipse 12/13 in the splash frames) squashes between 21 tall (closed: pupil
 * hidden, blank white eye) and 3 tall (open). `leftLid`/`rightLid` run
 * 0 = open → 1 = closed.
 *
 * Lids are drawn via plain `cy`/`ry` attributes, NOT a scaled `<G>` — react-
 * native-svg leaks `scaleY`/`originY` props straight to the DOM on web (erroring
 * and never animating), while numeric attributes work the same on web + native.
 * The Animated.Values are subscribed via listeners and rendered as ordinary
 * state; the re-renders are trivial for a short splash.
 */

const LID_TOP = 36; // lids' fixed top edge (Figma y=389 − Group 63 y=353)
const LID_OPEN = 3; // lid height with the eye open (스플래시 2/4)
const LID_CLOSED = 21; // lid height with the eye blank (스플래시 1)

export function SplashLogo({
  size = 83,
  leftLid,
  rightLid,
}: {
  size?: number;
  leftLid: Animated.Value;
  rightLid: Animated.Value;
}) {
  const height = (size * 73) / 83;

  const [lids, setLids] = useState({ left: 1, right: 1 });
  useEffect(() => {
    const l = leftLid.addListener(({ value }) => setLids((s) => ({ ...s, left: value })));
    const r = rightLid.addListener(({ value }) => setLids((s) => ({ ...s, right: value })));
    return () => {
      leftLid.removeListener(l);
      rightLid.removeListener(r);
    };
  }, [leftLid, rightLid]);

  const lidHeightLeft = LID_OPEN + (LID_CLOSED - LID_OPEN) * lids.left;
  const lidHeightRight = LID_OPEN + (LID_CLOSED - LID_OPEN) * lids.right;

  return (
    <Svg width={size} height={height} viewBox="0 0 83 73">
      <Path d="M0 24 L38.9 1.5 Q41.5 0 44.1 1.5 L83 24 L83 73 L0 73 Z" fill="#4361EE" />
      <Ellipse cx={26} cy={46} rx={17} ry={17} fill="#FFFFFF" />
      <Ellipse cx={57} cy={46} rx={17} ry={17} fill="#FFFFFF" />
      <Ellipse cx={32.5} cy={46.5} rx={6.5} ry={6.5} fill="#000000" />
      <Ellipse cx={50.5} cy={46.5} rx={6.5} ry={6.5} fill="#000000" />
      <Ellipse
        cx={30.5}
        cy={LID_TOP + lidHeightLeft / 2}
        rx={10.5}
        ry={lidHeightLeft / 2}
        fill="#FFFFFF"
      />
      <Ellipse
        cx={52.5}
        cy={LID_TOP + lidHeightRight / 2}
        rx={10.5}
        ry={lidHeightRight / 2}
        fill="#FFFFFF"
      />
    </Svg>
  );
}
