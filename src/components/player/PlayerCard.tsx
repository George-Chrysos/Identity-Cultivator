import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Sparkles, Sword, Brain, Shield } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { getRankStyle, getRankGlowColor } from '@/utils/rankStyles';
import { calculateOverallRank } from '@/utils/overallRank';
import { shallow } from 'zustand/shallow';

const PlayerCard = () => {
  // Use selector with shallow comparison for proper reactivity to stat changes
  const userProfile = useGameStore(
    (state) => state.userProfile,
    shallow
  );
  const [isExpanded, setIsExpanded] = useState(false);

  if (!userProfile) return null;

  // Calculate overall rank dynamically
  const overallRank = calculateOverallRank({
    body: userProfile.body_points,
    mind: userProfile.mind_points,
    soul: userProfile.soul_points,
    will: userProfile.will_points || 0,
  });

  // Convert stat points to rank letter
  const getStatRank = (points: number): string => {
    if (points >= 60) return 'S';
    if (points >= 55) return 'A+';
    if (points >= 50) return 'A';
    if (points >= 45) return 'B+';
    if (points >= 40) return 'B';
    if (points >= 35) return 'C+';
    if (points >= 30) return 'C';
    if (points >= 25) return 'D+';
    if (points >= 20) return 'D';
    if (points >= 15) return 'E+';
    if (points >= 10) return 'E';
    if (points >= 5) return 'F+';
    return 'F';
  };



  // Calculate progress to next rank (0-100%)
  const getProgressToNextRank = (points: number): number => {
    const thresholds = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];
    
    // Find current threshold
    let currentThreshold = 0;
    let nextThreshold = 5;
    
    for (let i = 0; i < thresholds.length - 1; i++) {
      if (points >= thresholds[i] && points < thresholds[i + 1]) {
        currentThreshold = thresholds[i];
        nextThreshold = thresholds[i + 1];
        break;
      }
    }
    
    // If max rank, return 100%
    if (points >= 60) return 100;
    
    // Calculate percentage
    const progress = ((points - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-12 flex justify-center mt-8"
    >
      <div className="relative max-w-2xl w-full">
        {/* Main Card */}
        <div 
          className="relative bg-slate-900/80 backdrop-blur-md border border-purple-500/50 rounded-2xl cursor-pointer shadow-[0_0_12px_rgba(76,29,149,0.4)] hover:border-purple-500/70 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          
          {/* Collapsed View - Stats flanking Rank */}
          {!isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative px-8 py-6 min-h-[240px]"
            >
              {/* Absolute positioned stats - icon above rank, closer to center */}
              <div className="absolute inset-0 p-6">
                {/* Top-Left: BODY */}
                <div className="absolute top-6 left-12">
                  <div className="flex flex-col items-center gap-5">
                    <motion.div
                      animate={getStatRank(userProfile.body_points).startsWith('S') ? {
                        filter: [
                          'drop-shadow(0 0 3px rgba(251, 191, 36, 0.8))',
                          'drop-shadow(0 0 6px rgba(251, 191, 36, 0.4))',
                          'drop-shadow(0 0 3px rgba(251, 191, 36, 0.8))'
                        ]
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Sword className="h-7 w-7" strokeWidth={2} style={{ 
                        color: getRankGlowColor(getStatRank(userProfile.body_points))
                      }} />
                    </motion.div>
                    <motion.span 
                      className="text-3xl font-black" 
                      style={getRankStyle(getStatRank(userProfile.body_points))}
                      animate={getStatRank(userProfile.body_points).startsWith('S') ? {
                        filter: [
                          'drop-shadow(0 0 5px rgba(251, 191, 36, 0.8))',
                          'drop-shadow(0 0 8px rgba(251, 191, 36, 0.4))',
                          'drop-shadow(0 0 5px rgba(251, 191, 36, 0.8))'
                        ]
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      {getStatRank(userProfile.body_points)}
                    </motion.span>
                  </div>
                </div>

                {/* Top-Right: MIND */}
                <div className="absolute top-6 right-12">
                  <div className="flex flex-col items-center gap-5">
                    <motion.div
                      animate={getStatRank(userProfile.mind_points).startsWith('S') ? {
                        filter: [
                          'drop-shadow(0 0 3px rgba(251, 191, 36, 0.8))',
                          'drop-shadow(0 0 6px rgba(251, 191, 36, 0.4))',
                          'drop-shadow(0 0 3px rgba(251, 191, 36, 0.8))'
                        ]
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Brain className="h-7 w-7" strokeWidth={2} style={{ 
                        color: getRankGlowColor(getStatRank(userProfile.mind_points))
                      }} />
                    </motion.div>
                    <motion.span 
                      className="text-3xl font-black" 
                      style={getRankStyle(getStatRank(userProfile.mind_points))}
                      animate={getStatRank(userProfile.mind_points).startsWith('S') ? {
                        filter: [
                          'drop-shadow(0 0 5px rgba(251, 191, 36, 0.8))',
                          'drop-shadow(0 0 8px rgba(251, 191, 36, 0.4))',
                          'drop-shadow(0 0 5px rgba(251, 191, 36, 0.8))'
                        ]
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      {getStatRank(userProfile.mind_points)}
                    </motion.span>
                  </div>
                </div>

                {/* Horizontal divider - left side */}
                <div className="absolute top-1/2 left-6 right-1/2 -translate-y-1/2 mr-16">
                  <div className="h-px bg-gradient-to-r from-slate-400/60 to-transparent" />
                </div>

                {/* Horizontal divider - right side */}
                <div className="absolute top-1/2 left-1/2 right-6 -translate-y-1/2 ml-16">
                  <div className="h-px bg-gradient-to-l from-slate-400/60 to-transparent" />
                </div>

                {/* Bottom-Left: SOUL */}
                <div className="absolute bottom-6 left-12">
                  <div className="flex flex-col items-center gap-5">
                    <motion.span 
                      className="text-3xl font-black" 
                      style={getRankStyle(getStatRank(userProfile.soul_points))}
                      animate={getStatRank(userProfile.soul_points).startsWith('S') ? {
                        filter: [
                          'drop-shadow(0 0 5px rgba(251, 191, 36, 0.8))',
                          'drop-shadow(0 0 8px rgba(251, 191, 36, 0.4))',
                          'drop-shadow(0 0 5px rgba(251, 191, 36, 0.8))'
                        ]
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      {getStatRank(userProfile.soul_points)}
                    </motion.span>
                    <motion.div
                      animate={getStatRank(userProfile.soul_points).startsWith('S') ? {
                        filter: [
                          'drop-shadow(0 0 3px rgba(251, 191, 36, 0.8))',
                          'drop-shadow(0 0 6px rgba(251, 191, 36, 0.4))',
                          'drop-shadow(0 0 3px rgba(251, 191, 36, 0.8))'
                        ]
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Sparkles className="h-7 w-7" strokeWidth={2} style={{ 
                        color: getRankGlowColor(getStatRank(userProfile.soul_points))
                      }} />
                    </motion.div>
                  </div>
                </div>

                {/* Bottom-Right: WILL */}
                <div className="absolute bottom-6 right-12">
                  <div className="flex flex-col items-center gap-5">
                    <motion.span 
                      className="text-3xl font-black" 
                      style={getRankStyle(getStatRank(userProfile.will_points || 0))}
                      animate={getStatRank(userProfile.will_points || 0).startsWith('S') ? {
                        filter: [
                          'drop-shadow(0 0 5px rgba(251, 191, 36, 0.8))',
                          'drop-shadow(0 0 8px rgba(251, 191, 36, 0.4))',
                          'drop-shadow(0 0 5px rgba(251, 191, 36, 0.8))'
                        ]
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      {getStatRank(userProfile.will_points || 0)}
                    </motion.span>
                    <motion.div
                      animate={getStatRank(userProfile.will_points || 0).startsWith('S') ? {
                        filter: [
                          'drop-shadow(0 0 3px rgba(251, 191, 36, 0.8))',
                          'drop-shadow(0 0 6px rgba(251, 191, 36, 0.4))',
                          'drop-shadow(0 0 3px rgba(251, 191, 36, 0.8))'
                        ]
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Shield className="h-7 w-7" strokeWidth={2} style={{ 
                        color: getRankGlowColor(getStatRank(userProfile.will_points || 0))
                      }} />
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Center Rank Circle - absolutely centered vertically */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-28 h-28 rounded-full flex items-center justify-center"
                     style={{
                       background: `radial-gradient(circle, ${getRankGlowColor(userProfile.rank_tier || 'F')}33 0%, ${getRankGlowColor(userProfile.rank_tier || 'F')}0D 70%, transparent 100%)`,
                       border: `2px solid ${getRankGlowColor(userProfile.rank_tier || 'F')}80`,
                       boxShadow: `0 0 5px ${getRankGlowColor(userProfile.rank_tier || 'F')}4D, inset 0 0 5px ${getRankGlowColor(userProfile.rank_tier || 'F')}1A`
                     }}>
                  <motion.span 
                    className="text-5xl font-black" 
                    style={getRankStyle(userProfile.rank_tier || 'F')}
                    animate={(userProfile.rank_tier || 'F').startsWith('S') ? {
                      filter: [
                        'drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))',
                        'drop-shadow(0 0 12px rgba(251, 191, 36, 0.4))',
                        'drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))'
                      ]
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {userProfile.rank_tier || 'F'}
                  </motion.span>
                </div>
              </div>
              
              {/* Expand/Collapse Button - positioned at bottom */}
              <div className="absolute bottom-[10px] left-0 right-0 flex justify-center pointer-events-none">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-slate-400 transition-opacity pointer-events-auto"
                >
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Stats Section - Expandable */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-6 pb-8 px-6">
                  {/* Center Rank Circle */}
                  <div className="flex flex-col items-center mb-6">
                    <div className="w-32 h-32 rounded-full flex items-center justify-center"
                         style={{
                           background: `radial-gradient(circle, ${getRankGlowColor(overallRank.rankTier)}33 0%, ${getRankGlowColor(overallRank.rankTier)}0D 70%, transparent 100%)`,
                           border: `2px solid ${getRankGlowColor(overallRank.rankTier)}80`,
                           boxShadow: `0 0 5px ${getRankGlowColor(overallRank.rankTier)}4D, inset 0 0 5px ${getRankGlowColor(overallRank.rankTier)}1A`
                         }}>
                      <motion.span 
                        className="text-6xl font-black" 
                        style={getRankStyle(overallRank.rankTier)}
                        animate={overallRank.rankTier.startsWith('S') ? {
                          filter: [
                            'drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))',
                            'drop-shadow(0 0 12px rgba(251, 191, 36, 0.4))',
                            'drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))'
                          ]
                        } : {}}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        {overallRank.rankTier}
                      </motion.span>
                    </div>
                    
                    {/* Expand/Collapse Button */}
                    <motion.div
                      whileHover={{ scale: 1.1, opacity: 0.5 }}
                      whileTap={{ scale: 0.9 }}
                      className="mt-2 text-gray-500 transition-opacity opacity-20"
                    >
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </motion.div>
                    </motion.div>
                    
                    <div className="text-lg font-bold mt-1 tracking-widest" style={{ color: getRankGlowColor(overallRank.rankTier) }}>RANK</div>
                  </div>

                  {/* Stats Grid - Glassmorphism Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* BODY - STR equivalent */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                      className="relative overflow-hidden rounded-xl"
                      style={{
                        background: 'rgba(0, 0, 0, 0.4)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
                      }}
                    >
                      <div className="p-5 flex flex-col items-center gap-2">
                        <motion.span 
                          className="text-4xl font-black" 
                          style={getRankStyle(getStatRank(userProfile.body_points))}
                          animate={getStatRank(userProfile.body_points).startsWith('S') ? {
                            filter: [
                              'drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))',
                              'drop-shadow(0 0 12px rgba(251, 191, 36, 0.4))',
                              'drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))'
                            ]
                          } : {}}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                          {getStatRank(userProfile.body_points)}
                        </motion.span>
                        <span className="text-sm text-gray-400 font-bold tracking-wider">BODY</span>
                      </div>
                      {/* Progress Line */}
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-800">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${getProgressToNextRank(userProfile.body_points)}%` }}
                          transition={{ duration: 0.6, delay: 0.2 }}
                          className="h-full"
                          style={{ 
                            backgroundColor: getRankGlowColor(getStatRank(userProfile.body_points)), 
                            boxShadow: `0 0 5px ${getRankGlowColor(getStatRank(userProfile.body_points))}` 
                          }}
                        />
                      </div>
                    </motion.div>

                    {/* SOUL - STA equivalent */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.15 }}
                      className="relative overflow-hidden rounded-xl"
                      style={{
                        background: 'rgba(0, 0, 0, 0.4)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
                      }}
                    >
                      <div className="p-5 flex flex-col items-center gap-2">
                        <motion.span 
                          className="text-4xl font-black" 
                          style={getRankStyle(getStatRank(userProfile.soul_points))}
                          animate={getStatRank(userProfile.soul_points).startsWith('S') ? {
                            filter: [
                              'drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))',
                              'drop-shadow(0 0 12px rgba(251, 191, 36, 0.4))',
                              'drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))'
                            ]
                          } : {}}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                          {getStatRank(userProfile.soul_points)}
                        </motion.span>
                        <span className="text-sm text-gray-400 font-bold tracking-wider">SOUL</span>
                      </div>
                      {/* Progress Line */}
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-800">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${getProgressToNextRank(userProfile.soul_points)}%` }}
                          transition={{ duration: 0.6, delay: 0.25 }}
                          className="h-full"
                          style={{ 
                            backgroundColor: getRankGlowColor(getStatRank(userProfile.soul_points)), 
                            boxShadow: `0 0 5px ${getRankGlowColor(getStatRank(userProfile.soul_points))}` 
                          }}
                        />
                      </div>
                    </motion.div>

                    {/* MIND - INT equivalent */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="relative overflow-hidden rounded-xl"
                      style={{
                        background: 'rgba(0, 0, 0, 0.4)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
                      }}
                    >
                      <div className="p-5 flex flex-col items-center gap-2">
                        <motion.span 
                          className="text-4xl font-black" 
                          style={getRankStyle(getStatRank(userProfile.mind_points))}
                          animate={getStatRank(userProfile.mind_points).startsWith('S') ? {
                            filter: [
                              'drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))',
                              'drop-shadow(0 0 12px rgba(251, 191, 36, 0.4))',
                              'drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))'
                            ]
                          } : {}}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                          {getStatRank(userProfile.mind_points)}
                        </motion.span>
                        <span className="text-sm text-gray-400 font-bold tracking-wider">MIND</span>
                      </div>
                      {/* Progress Line */}
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-800">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${getProgressToNextRank(userProfile.mind_points)}%` }}
                          transition={{ duration: 0.6, delay: 0.3 }}
                          className="h-full"
                          style={{ 
                            backgroundColor: getRankGlowColor(getStatRank(userProfile.mind_points)), 
                            boxShadow: `0 0 5px ${getRankGlowColor(getStatRank(userProfile.mind_points))}` 
                          }}
                        />
                      </div>
                    </motion.div>

                    {/* WILL - WIS equivalent */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.25 }}
                      className="relative overflow-hidden rounded-xl"
                      style={{
                        background: 'rgba(0, 0, 0, 0.4)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
                      }}
                    >
                      <div className="p-5 flex flex-col items-center gap-2">
                        <motion.span 
                          className="text-4xl font-black" 
                          style={getRankStyle(getStatRank(userProfile.will_points || 0))}
                          animate={getStatRank(userProfile.will_points || 0).startsWith('S') ? {
                            filter: [
                              'drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))',
                              'drop-shadow(0 0 12px rgba(251, 191, 36, 0.4))',
                              'drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))'
                            ]
                          } : {}}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                          {getStatRank(userProfile.will_points || 0)}
                        </motion.span>
                        <span className="text-sm text-gray-400 font-bold tracking-wider">WILL</span>
                      </div>
                      {/* Progress Line */}
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-800">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${getProgressToNextRank(userProfile.will_points || 0)}%` }}
                          transition={{ duration: 0.6, delay: 0.35 }}
                          className="h-full"
                          style={{ 
                            backgroundColor: getRankGlowColor(getStatRank(userProfile.will_points || 0)), 
                            boxShadow: `0 0 5px ${getRankGlowColor(getStatRank(userProfile.will_points || 0))}` 
                          }}
                        />
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default PlayerCard;
