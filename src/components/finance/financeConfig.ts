import { createElement, type CSSProperties } from 'react';
import { Briefcase, Lightbulb, Plus, ShoppingBag, ShoppingCart, Utensils, type LucideIcon } from 'lucide-react';
import type { CategoryKey } from '@/types/finance';

export const CATEGORY_KEYS: CategoryKey[] = [
  'food',
  'business',
  'utilities',
  'groceries',
  'shopping',
  'bills',
  'other',
];

/** Yearly Insights averages skip fixed/ops spend. */
export const INSIGHT_CATEGORY_KEYS: CategoryKey[] = CATEGORY_KEYS.filter(
  (key) => key !== 'business' && key !== 'utilities'
);

export const CATEGORY_CONFIG: Record<
  CategoryKey,
  { key: CategoryKey; label: string; Icon?: LucideIcon; emoji?: string; hex: string }
> = {
  food: { key: 'food', label: 'Food/Drinks', Icon: Utensils, hex: '#F59E0B' },
  business: { key: 'business', label: 'Business', Icon: Briefcase, hex: '#6366F1' },
  utilities: { key: 'utilities', label: 'Utilities', Icon: Lightbulb, hex: '#FACC15' },
  groceries: { key: 'groceries', label: 'Groceries', Icon: ShoppingCart, hex: '#84CC16' },
  shopping: { key: 'shopping', label: 'Shopping', Icon: ShoppingBag, hex: '#A78BFA' },
  bills: { key: 'bills', label: 'Social', emoji: '🎉', hex: '#78716C' },
  other: { key: 'other', label: 'Other', Icon: Plus, hex: '#64748B' },
};

export const CategoryIcon = ({
  category,
  className,
  style,
  'aria-label': ariaLabel,
}: {
  category: CategoryKey;
  className?: string;
  style?: CSSProperties;
  'aria-label'?: string;
}) => {
  const cfg = CATEGORY_CONFIG[category];
  if (cfg.emoji) {
    return createElement(
      'span',
      {
        className: [className, 'inline-flex items-center justify-center leading-none select-none']
          .filter(Boolean)
          .join(' '),
        style,
        role: ariaLabel ? 'img' : undefined,
        'aria-label': ariaLabel,
        'aria-hidden': ariaLabel ? undefined : true,
      },
      cfg.emoji
    );
  }
  const Icon = cfg.Icon;
  if (!Icon) return null;
  return createElement(Icon, { className, strokeWidth: 1.5, style, 'aria-label': ariaLabel });
};

export const PULSE_GREEN = '#34D399';
export const PULSE_AMBER = '#F59E0B';
export const PULSE_RED = '#F87171';
export const INCOME_GREEN = '#34D399';
export const QUICK_AMOUNTS = [5, 10, 20] as const;

export const ringColorForPct = (pct: number | null): string => {
  if (pct === null) return PULSE_GREEN;
  if (pct < 70) return PULSE_GREEN;
  if (pct <= 95) return PULSE_AMBER;
  return PULSE_RED;
};

export const capStateColor = (state: 'neutral' | 'safe' | 'warning' | 'over', hex: string): string => {
  if (state === 'warning') return PULSE_AMBER;
  if (state === 'over') return PULSE_RED;
  return hex;
};
