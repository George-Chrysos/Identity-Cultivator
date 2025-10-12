// Format XP numbers for display
export const formatXP = (xp: number): string => {
  if (xp >= 1000000) return `${(xp / 1000000).toFixed(1)}M`;
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}K`;
  return xp.toString();
};

// Format numbers with commas
export const formatNumber = (num: number): string => {
  return num.toLocaleString();
};
