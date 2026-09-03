import { HeartPulse, Brain, Sparkles, type LucideIcon } from 'lucide-react';
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
}[] = [
  {
    key: 'body',
    label: 'Body',
    Icon: HeartPulse,
    text: STAT_COLORS.BODY.text,
    bg: STAT_COLORS.BODY.bg,
    border: STAT_COLORS.BODY.border,
    glow: 'shadow-[0_0_18px_rgba(236,72,153,0.35)]',
    ring: 'focus:border-pink-400/80 focus:ring-pink-500/30',
  },
  {
    key: 'mind',
    label: 'Mind',
    Icon: Brain,
    text: STAT_COLORS.MIND.text,
    bg: STAT_COLORS.MIND.bg,
    border: STAT_COLORS.MIND.border,
    glow: 'shadow-[0_0_18px_rgba(6,182,212,0.35)]',
    ring: 'focus:border-cyan-400/80 focus:ring-cyan-500/30',
  },
  {
    key: 'soul',
    label: 'Soul',
    Icon: Sparkles,
    text: STAT_COLORS.SOUL.text,
    bg: STAT_COLORS.SOUL.bg,
    border: STAT_COLORS.SOUL.border,
    glow: 'shadow-[0_0_18px_rgba(168,85,247,0.35)]',
    ring: 'focus:border-purple-400/80 focus:ring-purple-500/30',
  },
];
