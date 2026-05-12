import React from "react";
import Svg, { Path, Circle, Rect, Line } from "react-native-svg";

type IconProps = {
  color: string;
  size?: number;
  focused?: boolean;
};

// ─── Dashboard (grid of 4 squares) ─────────────────────────────────────────────
export const DashboardIcon = ({ color, size = 22 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="3" width="8" height="8" rx="2" stroke={color} strokeWidth={2} />
    <Rect x="13" y="3" width="8" height="5" rx="2" stroke={color} strokeWidth={2} />
    <Rect x="3" y="13" width="8" height="5" rx="2" stroke={color} strokeWidth={2} />
    <Rect x="13" y="10" width="8" height="8" rx="2" stroke={color} strokeWidth={2} fill="none" />
    {/* Small accent bar inside bottom-right */}
    <Rect x="15" y="13" width="4" height="2" rx="1" fill={color} opacity={0.5} />
  </Svg>
);

// ─── History (clock with rewind arrow) ──────────────────────────────────────────
export const HistoryIcon = ({ color, size = 22 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="13" r="8" stroke={color} strokeWidth={2} />
    <Path d="M12 9v4l2.5 2.5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M4.5 5.5L4 9h3.5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M4 9a9 9 0 0 1 8-4.5" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

// ─── Add (circle with plus) ────────────────────────────────────────────────────
export const AddIcon = ({ color, size = 22 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={2} />
    <Line x1="12" y1="8" x2="12" y2="16" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Line x1="8" y1="12" x2="16" y2="12" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

// ─── Budget (wallet / sliders) ──────────────────────────────────────────────────
export const BudgetIcon = ({ color, size = 22 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Horizontal slider lines */}
    <Line x1="4" y1="7" x2="20" y2="7" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Line x1="4" y1="12" x2="20" y2="12" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Line x1="4" y1="17" x2="20" y2="17" stroke={color} strokeWidth={2} strokeLinecap="round" />
    {/* Slider knobs at different positions */}
    <Circle cx="8" cy="7" r="2" fill={color} />
    <Circle cx="15" cy="12" r="2" fill={color} />
    <Circle cx="11" cy="17" r="2" fill={color} />
  </Svg>
);

// ─── Menu (2x2 grid dots) ──────────────────────────────────────────────────────
export const MenuIcon = ({ color, size = 22 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="6" cy="6" r="2.5" fill={color} />
    <Circle cx="18" cy="6" r="2.5" fill={color} />
    <Circle cx="6" cy="18" r="2.5" fill={color} />
    <Circle cx="18" cy="18" r="2.5" fill={color} />
  </Svg>
);

// ─── Subscriptions (repeat/loop arrows) ─────────────────────────────────────────
export const SubscriptionsIcon = ({ color, size = 22 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M17 1l4 4-4 4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3 11V9a4 4 0 0 1 4-4h14" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M7 23l-4-4 4-4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M21 13v2a4 4 0 0 1-4 4H3" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ─── Insights (sparkle / lightbulb) ─────────────────────────────────────────────
export const InsightsIcon = ({ color, size = 22 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Main sparkle star */}
    <Path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" fill={color} opacity={0.15} />
    <Path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    {/* Small sparkle */}
    <Path d="M19 16l0.75 2.25L22 19l-2.25 0.75L19 22l-0.75-2.25L16 19l2.25-0.75L19 16z" stroke={color} strokeWidth={1.5} strokeLinejoin="round" fill={color} opacity={0.3} />
  </Svg>
);

// ─── Profile (user circle) ──────────────────────────────────────────────────────
export const ProfileIcon = ({ color, size = 22 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth={2} />
    <Path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);
