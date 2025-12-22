/**
 * Rank Styling System - "Spectral Ascension" Aesthetic
 * Power Scaling: Higher ranks = White Core + Colored Glow
 * Lower ranks = Solid Matter (No Glow)
 * 
 * All ranks now have a black outline shadow for readability
 */

export interface RankStyle {
  color: string;
  textShadow: string;
}

// Black outline shadow for text readability - creates sharp letter boundaries
const BLACK_OUTLINE = '0 0 2px #000, 0 0 4px #000, 1px 1px 1px #000, -1px -1px 1px #000, 1px -1px 1px #000, -1px 1px 1px #000';

/**
 * Get visual styling for a stat rank based on "Spectral Ascension" system
 * @param rank - The stat rank (F, E, D, C, B, A, S with +/- variants)
 * @returns CSS color and text-shadow properties
 */
export const getRankStyle = (rank: string): RankStyle => {
  // Normalize rank to base letter
  const baseRank = rank.replace(/[+-]/g, '');

  switch (baseRank) {
    // F & E: The Dormant Phase - Iron/Slate (No Glow, just black outline)
    case 'F':
    case 'E':
      return {
        color: '#64748b', // Slate-500 - Darker for better visibility
        textShadow: BLACK_OUTLINE, // Black outline only
      };

    // D: The Spark - Bronze/Rust (Faint Glow + outline)
    case 'D':
      return {
        color: '#fb923c', // Orange-400
        textShadow: `${BLACK_OUTLINE}, 0 0 8px rgba(251, 146, 60, 0.4)`, // Black outline + faint glow
      };

    // C: The Refined - Silver/Chrome (Soft Ambient Light + outline)
    case 'C':
      return {
        color: '#06b6d4', // Cyan-500 - More vibrant than gray
        textShadow: `${BLACK_OUTLINE}, 0 0 10px rgba(6, 182, 212, 0.5)`, // Black outline + ambient light
      };

    // B: The Electric - Neon Cyan (Moderate Glow + outline)
    case 'B':
      return {
        color: '#3b82f6', // Blue-500 - Distinct from cyan
        textShadow: `${BLACK_OUTLINE}, 0 0 8px #3b82f6, 0 0 15px rgba(59, 130, 246, 0.6)`, // Black outline + Blue Glow
      };

    // A: The Plasma - Mystical Purple (Strong Glow + outline)
    case 'A':
      return {
        color: '#a855f7', // Purple-500
        textShadow: `${BLACK_OUTLINE}, 0 0 6px #a855f7, 0 0 15px #a855f7, 0 0 30px rgba(147, 51, 234, 0.6)`, // Black outline + Purple Triple Layer
      };

    // S: The Divine - Solar Gold (Maximum Glow + outline)
    case 'S':
      return {
        color: '#ffffff', // Pure White Core
        textShadow: `${BLACK_OUTLINE}, 0 0 8px #fde047, 0 0 20px #fbbf24, 0 0 35px #f59e0b, 0 0 50px rgba(245, 158, 11, 0.5)`, // Black outline + Solar Quad Layer
      };

    default:
      // Fallback to F/E styling
      return {
        color: '#94a3b8',
        textShadow: BLACK_OUTLINE,
      };
  }
};

/**
 * Get the base glow color for a rank (for progress bars, icons, etc.)
 * Returns the primary accent color without white core
 */
export const getRankGlowColor = (rank: string): string => {
  const baseRank = rank.replace(/[+-]/g, '');

  switch (baseRank) {
    case 'F':
    case 'E':
      return '#64748b'; // Slate
    case 'D':
      return '#fb923c'; // Orange
    case 'C':
      return '#06b6d4'; // Cyan
    case 'B':
      return '#3b82f6'; // Blue
    case 'A':
      return '#a855f7'; // Purple
    case 'S':
      return '#fbbf24'; // Gold
    default:
      return '#64748b';
  }
};
