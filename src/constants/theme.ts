/**
 * Centralized Theme Constants
 * 
 * All colors, gradients, and visual tokens for the Identity Cultivator app.
 * Import from here instead of hardcoding hex values in components.
 * 
 * @module constants/theme
 */

// ==================== COLOR PALETTE ====================

/**
 * Core brand colors
 */
export const COLORS = {
  // Primary Purple (Mage/Mystic theme)
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
    950: '#3b0764',
  },
  
  // Warrior Red/Pink
  warrior: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899',
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
    900: '#831843',
  },
  
  // Cyan/Teal (Tech/Items theme)
  cyan: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
  },
  
  // Gold/Amber (Currency/Rewards)
  gold: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  // Slate (Backgrounds/Text)
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },
  
  // Status colors
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
} as const;

// ==================== GRADIENTS ====================

/**
 * Pre-defined gradient strings for Tailwind
 */
export const GRADIENTS = {
  // Background gradients
  pageBackground: 'from-slate-950 via-slate-900 to-violet-950',
  cardBackground: 'from-slate-900/60 to-slate-800/40',
  
  // Button gradients
  primaryButton: 'from-purple-600 to-pink-600',
  secondaryButton: 'from-cyan-600 to-blue-600',
  goldButton: 'from-yellow-500/20 to-amber-500/20',
  
  // Ticket/Card gradients
  ticketPurple: 'from-purple-600/40 to-pink-600/40',
  ticketCyan: 'from-cyan-600/30 to-blue-600/30',
  ticketGhost: 'from-amber-900/30 to-orange-900/30',
  
  // Tier gradients
  tierSSS: 'from-amber-200 via-yellow-200 to-amber-300',
  tierSS: 'from-purple-400 via-pink-400 to-purple-400',
  tierS: 'from-cyan-400 via-blue-400 to-cyan-400',
  tierA: 'from-emerald-400 to-teal-400',
  tierB: 'from-blue-400 to-indigo-400',
  tierC: 'from-slate-400 to-zinc-400',
  tierD: 'from-stone-500 to-stone-600',
  
  // Neon accents
  neonPurple: 'from-purple-500 to-pink-500',
  neonCyan: 'from-cyan-400 to-blue-500',
  neonGold: 'from-yellow-400 to-amber-500',
} as const;

// ==================== SHADOWS ====================

/**
 * Box shadow values for glow effects
 */
export const SHADOWS = {
  // Neon glows
  purpleGlow: '0 0 15px rgba(168, 85, 247, 0.6)',
  purpleGlowStrong: '0 0 30px rgba(168, 85, 247, 0.8)',
  pinkGlow: '0 0 15px rgba(236, 72, 153, 0.6)',
  cyanGlow: '0 0 15px rgba(6, 182, 212, 0.5)',
  cyanGlowStrong: '0 0 20px rgba(6, 182, 212, 0.6)',
  goldGlow: '0 0 15px rgba(234, 179, 8, 0.5)',
  goldGlowStrong: '0 0 20px rgba(234, 179, 8, 0.6)',
  
  // Card shadows
  cardDefault: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
  cardHover: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
  cardActive: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
  
  // Text shadows
  neonText: '0 0 10px rgba(253, 224, 71, 0.5)',
} as const;

// ==================== BORDERS ====================

/**
 * Border styles for consistent theming
 */
export const BORDERS = {
  // Default states
  default: 'border-slate-700/50',
  active: 'border-purple-500/50',
  success: 'border-green-500/50',
  warning: 'border-amber-500/50',
  error: 'border-red-500/50',
  
  // Themed borders
  purple: 'border-purple-500/50',
  cyan: 'border-cyan-500/50',
  gold: 'border-yellow-500/50',
  ghost: 'border-amber-700/50',
} as const;

// ==================== STAT COLORS ====================

/**
 * Colors for each stat type
 */
export const STAT_COLORS = {
  BODY: {
    primary: COLORS.warrior[500],
    light: COLORS.warrior[300],
    dark: COLORS.warrior[700],
    gradient: GRADIENTS.neonPurple,
    text: 'text-pink-400',
    bg: 'bg-pink-500/20',
    border: 'border-pink-500/50',
  },
  MIND: {
    primary: COLORS.cyan[500],
    light: COLORS.cyan[300],
    dark: COLORS.cyan[700],
    gradient: GRADIENTS.neonCyan,
    text: 'text-cyan-400',
    bg: 'bg-cyan-500/20',
    border: 'border-cyan-500/50',
  },
  SOUL: {
    primary: COLORS.purple[500],
    light: COLORS.purple[300],
    dark: COLORS.purple[700],
    gradient: GRADIENTS.neonPurple,
    text: 'text-purple-400',
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/50',
  },
} as const;

// ==================== TIER COLORS ====================

/**
 * Colors for each tier level
 */
export const TIER_COLORS = {
  SSS: { gradient: GRADIENTS.tierSSS, text: 'text-amber-300', glow: SHADOWS.goldGlowStrong },
  'SS+': { gradient: GRADIENTS.tierSS, text: 'text-purple-300', glow: SHADOWS.purpleGlowStrong },
  SS: { gradient: GRADIENTS.tierSS, text: 'text-purple-300', glow: SHADOWS.purpleGlow },
  'S+': { gradient: GRADIENTS.tierS, text: 'text-cyan-300', glow: SHADOWS.cyanGlowStrong },
  S: { gradient: GRADIENTS.tierS, text: 'text-cyan-300', glow: SHADOWS.cyanGlow },
  'A+': { gradient: GRADIENTS.tierA, text: 'text-emerald-300', glow: '' },
  A: { gradient: GRADIENTS.tierA, text: 'text-emerald-300', glow: '' },
  'B+': { gradient: GRADIENTS.tierB, text: 'text-blue-300', glow: '' },
  B: { gradient: GRADIENTS.tierB, text: 'text-blue-300', glow: '' },
  'C+': { gradient: GRADIENTS.tierC, text: 'text-slate-300', glow: '' },
  C: { gradient: GRADIENTS.tierC, text: 'text-slate-300', glow: '' },
  'D+': { gradient: GRADIENTS.tierD, text: 'text-stone-400', glow: '' },
  D: { gradient: GRADIENTS.tierD, text: 'text-stone-400', glow: '' },
} as const;

// ==================== UI COMPONENT STYLES ====================

/**
 * Common component style classes
 */
export const UI_STYLES = {
  // Buttons
  button: {
    primary: `bg-gradient-to-r ${GRADIENTS.primaryButton} text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/30 transition-shadow`,
    secondary: `bg-gradient-to-r ${GRADIENTS.secondaryButton} text-white font-semibold rounded-xl shadow-lg hover:shadow-cyan-500/30 transition-shadow`,
    ghost: 'bg-slate-800/50 border-2 border-slate-700/50 text-slate-400 rounded-xl',
    gold: `bg-gradient-to-r ${GRADIENTS.goldButton} border-2 border-yellow-500/50 text-yellow-300 rounded-xl`,
  },
  
  // Cards
  card: {
    default: 'bg-slate-900/60 backdrop-blur-md border-2 border-slate-700/50 rounded-2xl',
    active: 'bg-slate-900/60 backdrop-blur-md border-2 border-purple-500/50 rounded-2xl shadow-[0_0_15px_rgba(168,85,247,0.3)]',
    disabled: 'bg-slate-900/40 backdrop-blur-md border-2 border-slate-700/30 rounded-2xl opacity-60',
  },
  
  // Text
  text: {
    heading: 'text-white font-bold',
    subheading: 'text-slate-300 font-semibold',
    body: 'text-slate-400',
    muted: 'text-slate-500',
    accent: 'text-purple-300',
  },
} as const;

// ==================== TYPE EXPORTS ====================

export type GradientKey = keyof typeof GRADIENTS;
export type ShadowKey = keyof typeof SHADOWS;
export type ColorKey = keyof typeof COLORS;
export type StatType = keyof typeof STAT_COLORS;
export type TierType = keyof typeof TIER_COLORS;
