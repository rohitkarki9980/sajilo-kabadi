import React from "react";
import Svg, { Path } from "react-native-svg";
import { ICONS, IconName } from "../theme/icons";

type Props = {
  name: IconName | string;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export function Icon({ name, size = 20, color = "#201e1d", strokeWidth = 2.75 }: Props) {
  const d = ICONS[name];
  if (!d) return null;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d={d} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
