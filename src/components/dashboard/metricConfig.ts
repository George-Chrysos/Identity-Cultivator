import { HeartPulse, Brain, Star, type LucideIcon } from 'lucide-react';
import { STAT_COLORS } from '@/constants/theme';
import type { MetricKey } from '@/types/dashboard';

export const METRIC_CONFIG: {
  key: MetricKey;
  label: string;
  Icon: LucideIcon;
  text: string;
  bg: string;
  border: string;
  glow: string;
  ring: string;
  stroke: string;
  anchors: [string, string, string, string, string];
}[] = [
  {
    key: 'body',
    label: 'Vitality',
    Icon: HeartPulse,
    text: STAT_COLORS.BODY.text,
    bg: STAT_COLORS.BODY.bg,
    border: STAT_COLORS.BODY.border,
    glow: 'shadow-[0_0_18px_rgba(236,72,153,0.35)]',
    ring: 'focus:border-pink-400/80 focus:ring-pink-500/30',
    stroke: '#f472b6',
    anchors: [
      'Dragging myself through the day',
      'Functional but heavy, forcing things',
      'Neutral baseline',
      'Energized, want to move',
      'Overflowing — could take extra load and still have juice',
    ],
  },
  {
    key: 'soul',
    label: 'Sovereignty',
    Icon: Star,
    text: STAT_COLORS.SOUL.text,
    bg: STAT_COLORS.SOUL.bg,
    border: STAT_COLORS.SOUL.border,
    glow: 'shadow-[0_0_18px_rgba(168,85,247,0.35)]',
    ring: 'focus:border-purple-400/80 focus:ring-purple-500/30',
    stroke: '#c084fc',
    anchors: [
      'Fully defaulted all day, zero conscious choices',
      'Mostly reactive, one or two real wins',
      'Mixed — some non-negotiables kept, some skipped',
      'Consciously chose most of the day, kept my word',
      'Every major choice today was mine — not the path of least resistance',
    ],
  },
  {
    key: 'mind',
    label: 'Clarity',
    Icon: Brain,
    text: STAT_COLORS.MIND.text,
    bg: STAT_COLORS.MIND.bg,
    border: STAT_COLORS.MIND.border,
    glow: 'shadow-[0_0_18px_rgba(6,182,212,0.35)]',
    ring: 'focus:border-cyan-400/80 focus:ring-cyan-500/30',
    stroke: '#22d3ee',
    anchors: [
      "Foggy/dissociated, couldn't tell you what today was",
      'Scattered, reactive thinking',
      'Baseline clear, functional',
      'Sharp — could name what mattered, caught the seat driving in real time',
      'Single-pointed, no noise, decisions felt obvious',
    ],
  },
];
