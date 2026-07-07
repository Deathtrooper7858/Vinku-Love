import React from 'react';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';
import { colors } from '../theme';

export type PetStageKey = 'egg' | 'baby' | 'teen' | 'adult';

export function stageForXp(xp: number): {
  key: PetStageKey;
  label: string;
  threshold: number;
  prevThreshold: number;
} {
  if (xp < 20) return { key: 'egg', label: 'Huevo', threshold: 20, prevThreshold: 0 };
  if (xp < 60) return { key: 'baby', label: 'Bebé', threshold: 60, prevThreshold: 20 };
  if (xp < 150) return { key: 'teen', label: 'Juvenil', threshold: 150, prevThreshold: 60 };
  return { key: 'adult', label: 'Adulto', threshold: xp, prevThreshold: 150 };
}

export function Pet({ stage, size = 96 }: { stage: PetStageKey; size?: number }) {
  const body = colors.gold;
  const cheeks = colors.coral;
  const accent = colors.teal;
  const face = colors.bg;

  if (stage === 'egg') {
    return (
      <Svg width={size} height={size} viewBox="0 0 96 96">
        <Ellipse cx={48} cy={52} rx={30} ry={36} fill={body} />
        <Ellipse cx={38} cy={38} rx={6} ry={8} fill="#FFFFFF" opacity={0.35} />
        <Circle cx={40} cy={52} r={3} fill={face} />
        <Circle cx={56} cy={52} r={3} fill={face} />
        <Path d="M40 62 Q48 68 56 62" stroke={face} strokeWidth={2.5} fill="none" strokeLinecap="round" />
      </Svg>
    );
  }
  if (stage === 'baby') {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Circle cx={50} cy={55} r={34} fill={body} />
        <Circle cx={28} cy={40} r={10} fill={body} />
        <Circle cx={72} cy={40} r={10} fill={body} />
        <Circle cx={36} cy={55} r={6} fill={cheeks} opacity={0.7} />
        <Circle cx={64} cy={55} r={6} fill={cheeks} opacity={0.7} />
        <Circle cx={40} cy={52} r={3.5} fill={face} />
        <Circle cx={60} cy={52} r={3.5} fill={face} />
        <Path d="M42 64 Q50 70 58 64" stroke={face} strokeWidth={3} fill="none" strokeLinecap="round" />
      </Svg>
    );
  }
  if (stage === 'teen') {
    return (
      <Svg width={size} height={size} viewBox="0 0 104 104">
        <Ellipse cx={52} cy={58} rx={38} ry={34} fill={body} />
        <Circle cx={24} cy={36} r={11} fill={body} />
        <Circle cx={80} cy={36} r={11} fill={body} />
        <Path d="M14 84 Q52 100 90 84" stroke={accent} strokeWidth={6} fill="none" strokeLinecap="round" />
        <Circle cx={38} cy={55} r={7} fill={cheeks} opacity={0.7} />
        <Circle cx={66} cy={55} r={7} fill={cheeks} opacity={0.7} />
        <Circle cx={42} cy={52} r={4} fill={face} />
        <Circle cx={62} cy={52} r={4} fill={face} />
        <Path d="M42 66 Q52 74 62 66" stroke={face} strokeWidth={3} fill="none" strokeLinecap="round" />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 108 108">
      <Ellipse cx={54} cy={60} rx={42} ry={36} fill={body} />
      <Circle cx={20} cy={34} r={13} fill={body} />
      <Circle cx={88} cy={34} r={13} fill={body} />
      <Path d="M8 92 Q54 112 100 92" stroke={accent} strokeWidth={7} fill="none" strokeLinecap="round" />
      <Path d="M54 20 L58 30 L48 30 Z" fill={colors.gold} />
      <Circle cx={40} cy={58} r={8} fill={cheeks} opacity={0.7} />
      <Circle cx={68} cy={58} r={8} fill={cheeks} opacity={0.7} />
      <Circle cx={44} cy={54} r={4.5} fill={face} />
      <Circle cx={64} cy={54} r={4.5} fill={face} />
      <Path d="M44 70 Q54 80 64 70" stroke={face} strokeWidth={3.5} fill="none" strokeLinecap="round" />
    </Svg>
  );
}
