import { memo, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Lock, Zap, Shield, Flame, Eye, Sword, Crown, ChevronDown } from 'lucide-react';
import type { PathNode, PathTheme } from '@/constants/pathTreeData';
import { THEME_COLORS } from '@/constants/pathTreeData';
import { BaseModal } from '@/components/common';

/**
 * CollapsibleMastery - Expandable mastery card component
 * 
 * Shows title by default, expands to reveal benefit description on click
 */
interface CollapsibleMasteryProps {
  title: string;
  benefit: string;
  index: number;
  themeColor: string; // Add theme color prop
}

const CollapsibleMastery = memo(({ title, benefit, index, themeColor }: CollapsibleMasteryProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="rounded-lg bg-slate-800/50 border-l-4 overflow-hidden"
      style={{ borderLeftColor: themeColor }}
    >
      {/* Header - Always visible, clickable */}
      <button
        type="button"
        onClick={toggleExpand}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-700/30 transition-colors"
      >
        <h4 className="text-sm font-bold uppercase text-white">
          {title}
        </h4>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-slate-400" />
        </motion.div>
      </button>
      
      {/* Description - Collapsible */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Divider */}
            <div className="mx-4 border-t border-slate-600/50" />
            {/* Benefit text */}
            <p className="p-4 pt-3 text-sm text-slate-400 italic leading-relaxed">
              {benefit}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

CollapsibleMastery.displayName = 'CollapsibleMastery';

interface NodeInfoModalProps {
  isOpen: boolean;
  node: PathNode | null;
  pathTheme: PathTheme;
  pathTitle: string;
  userStars: number;
  previousStageCompleted?: boolean;
  onClose: () => void;
  onUnlock: (nodeId: string) => void;
}

// Node descriptions and special abilities based on node title
const NODE_CONTENT: Record<string, { description: string; abilities: string[] }> = {
  // Warrior Path
  'Tempering': {
    description: 'The foundational ritual for the Iron Way. Tempering is the process of compressing the physical frame to build a resilient structure, transitioning from a civilian body to a hardened warrior vessel.',
    abilities: [], // Uses coreMasteries from node data instead
  },
  'Trainee': {
    description: 'Begin your journey as a humble trainee. Learn the basics of combat and discipline that will form the foundation of your warrior path.',
    abilities: ['Basic Combat Stance', 'Endurance Training', 'Weapon Familiarity'],
  },
  'Body': {
    description: 'Focus on physical prowess and raw strength. Masters of this path become unstoppable forces on the battlefield.',
    abilities: ['Iron Body', 'Strength Surge', 'Physical Resistance +10%'],
  },
  'Balance': {
    description: 'Seek harmony between offense and defense. A balanced warrior adapts to any situation with grace.',
    abilities: ['Adaptive Combat', 'Equilibrium Stance', 'Versatile Training'],
  },
  'Will': {
    description: 'Forge an unbreakable spirit. Willpower warriors overcome impossible odds through sheer determination.',
    abilities: ['Indomitable Spirit', 'Mental Fortitude', 'Will Power +15%'],
  },
  'Ronin': {
    description: 'Walk the path of the masterless swordsman. Ronin warriors develop unique fighting styles through solitary training.',
    abilities: ['Lone Wolf Technique', 'Quick Draw', 'Wanderer\'s Wisdom'],
  },
  'Knight': {
    description: 'Embody honor and protection. Knights are defenders of the weak and masters of defensive combat.',
    abilities: ['Shield Wall', 'Honor\'s Guard', 'Protective Aura'],
  },
  'Berserker': {
    description: 'Channel fury into devastating power. Berserkers trade caution for overwhelming offensive might.',
    abilities: ['Battle Rage', 'Unstoppable Fury', 'Pain Conversion'],
  },
  'Blade Master': {
    description: 'Achieve perfect mastery of the blade. Every strike is precise, every movement calculated.',
    abilities: ['Perfect Cut', 'Blade Dance', 'Weapon Mastery'],
  },
  'Champion': {
    description: 'Rise as a beacon of excellence. Champions inspire allies and strike fear into enemies.',
    abilities: ['Inspiring Presence', 'Champion\'s Challenge', 'Victory Rush'],
  },
  'Warlord': {
    description: 'Command the battlefield with tactical genius. Warlords turn chaos into controlled destruction.',
    abilities: ['Battle Command', 'War Cry', 'Tactical Supremacy'],
  },
  'Sword Saint': {
    description: 'Transcend mortal limits of swordsmanship. Sword Saints are legendary warriors spoken of in hushed whispers.',
    abilities: ['Divine Blade', 'Transcendent Strike', 'Legendary Mastery'],
  },
  'War God': {
    description: 'Ascend to godhood through combat. War Gods are avatars of battle itself.',
    abilities: ['Divine Wrath', 'Immortal Warrior', 'God of War\'s Blessing'],
  },
  'Conqueror': {
    description: 'Dominate all who oppose you. Conquerors reshape the world through sheer force of will.',
    abilities: ['Absolute Dominion', 'Conqueror\'s Aura', 'Undefeated'],
  },
  // Mage Path
  'Apprentice': {
    description: 'Begin your magical studies. Every great mage started by learning the fundamental principles of arcane energy.',
    abilities: ['Basic Spellcasting', 'Mana Sense', 'Arcane Studies'],
  },
  'Elements': {
    description: 'Master the primal forces of nature. Elementalists wield fire, water, earth, and air.',
    abilities: ['Elemental Attunement', 'Nature\'s Fury', 'Elemental Shield'],
  },
  'Arcane': {
    description: 'Delve into pure magical energy. Arcane mages manipulate the raw fabric of reality.',
    abilities: ['Arcane Missiles', 'Mana Manipulation', 'Magical Insight'],
  },
  'Ritual': {
    description: 'Learn the ancient rites of power. Ritualists prepare devastating spells through careful ceremony.',
    abilities: ['Ritual Casting', 'Empowered Spells', 'Ceremonial Magic'],
  },
  'Elementalist': {
    description: 'Become one with the elements. Command storms, earthquakes, and infernos at will.',
    abilities: ['Elemental Mastery', 'Storm Calling', 'Primal Connection'],
  },
  'Sorcerer': {
    description: 'Channel innate magical power. Sorcerers cast instinctively, their magic flowing naturally.',
    abilities: ['Innate Magic', 'Spontaneous Casting', 'Power Surge'],
  },
  'Ritualist': {
    description: 'Perfect the art of ritual magic. Your preparations yield spells of incredible potency.',
    abilities: ['Grand Ritual', 'Enhanced Ceremonies', 'Lasting Enchantments'],
  },
  'Storm Weaver': {
    description: 'Command the fury of the skies. Lightning and thunder answer your call.',
    abilities: ['Lightning Mastery', 'Thunder Clap', 'Storm Avatar'],
  },
  'Sage': {
    description: 'Attain profound magical wisdom. Sages understand magic at its deepest level.',
    abilities: ['Arcane Wisdom', 'Spell Efficiency', 'Knowledge Mastery'],
  },
  'Summoner': {
    description: 'Call forth beings from other realms. Your allies come from beyond the veil.',
    abilities: ['Summon Familiar', 'Planar Binding', 'Army of One'],
  },
  'Elemental Lord': {
    description: 'Rule over the elemental planes. The primal forces bow to your command.',
    abilities: ['Elemental Dominion', 'Primal Avatar', 'World Shaper'],
  },
  'Archmage': {
    description: 'Achieve the pinnacle of magical power. Archmages are the most powerful spellcasters in existence.',
    abilities: ['Ultimate Magic', 'Reality Warp', 'Arcane Supremacy'],
  },
  'High Invoker': {
    description: 'Master the greatest summoning arts. Call forth beings of godlike power.',
    abilities: ['Divine Summoning', 'Planar Mastery', 'Army of Legends'],
  },
  // Mystic Path
  'Seeker': {
    description: 'Begin your journey of enlightenment. Seekers look beyond the physical world for truth.',
    abilities: ['Inner Sight', 'Meditation', 'Spiritual Awareness'],
  },
  'Vision': {
    description: 'Develop the sight beyond sight. See what others cannot perceive.',
    abilities: ['True Sight', 'Prophetic Dreams', 'Aura Reading'],
  },
  'Soul': {
    description: 'Connect with the essence of being. Soul mystics understand the nature of existence.',
    abilities: ['Soul Bond', 'Life Sense', 'Spiritual Healing'],
  },
  'Spirit': {
    description: 'Commune with the spirit world. Spirits become your allies and guides.',
    abilities: ['Spirit Guide', 'Ethereal Touch', 'Ghost Walk'],
  },
  'Oracle': {
    description: 'Receive visions of what is to come. Oracles are conduits of fate itself.',
    abilities: ['Prophecy', 'Fate Sight', 'Divine Revelation'],
  },
  'Medium': {
    description: 'Bridge the gap between worlds. Speak with those who have passed beyond.',
    abilities: ['Spirit Communication', 'Channel Spirits', 'Otherworldly Insight'],
  },
  'Shaman': {
    description: 'Walk between the physical and spiritual. Shamans are healers and guides.',
    abilities: ['Spiritual Journey', 'Totemic Power', 'Nature\'s Wisdom'],
  },
  'Seer': {
    description: 'Master the art of divination. No secret is hidden from a true Seer.',
    abilities: ['Perfect Foresight', 'Mind Reading', 'Clairvoyance'],
  },
  'Enlightened': {
    description: 'Achieve spiritual awakening. The Enlightened have transcended ordinary consciousness.',
    abilities: ['Higher Consciousness', 'Inner Peace', 'Spiritual Mastery'],
  },
  'Spiritwalker': {
    description: 'Walk freely in the spirit realm. The boundaries between worlds mean nothing to you.',
    abilities: ['Realm Walker', 'Spirit Form', 'Dimensional Shift'],
  },
  'Prophet': {
    description: 'Speak with the voice of destiny. Prophets shape the future through their words.',
    abilities: ['Words of Power', 'Destiny\'s Voice', 'Fate Manipulation'],
  },
  'Transcendent': {
    description: 'Transcend all mortal limitations. Achieve a state of pure spiritual existence.',
    abilities: ['Pure Spirit', 'Beyond Mortality', 'Cosmic Consciousness'],
  },
  'Ancestral': {
    description: 'Channel the power of all who came before. The ancestors speak through you.',
    abilities: ['Ancestral Power', 'Legacy of Ages', 'Eternal Wisdom'],
  },
};

const getNodeIcon = (title: string) => {
  const titleLower = title.toLowerCase();
  if (titleLower.includes('body') || titleLower.includes('foundation') || titleLower.includes('knight')) return Shield;
  if (titleLower.includes('will') || titleLower.includes('flame') || titleLower.includes('fire') || titleLower.includes('berserker')) return Flame;
  if (titleLower.includes('soul') || titleLower.includes('sight') || titleLower.includes('eye') || titleLower.includes('vision') || titleLower.includes('oracle') || titleLower.includes('seer')) return Eye;
  if (titleLower.includes('ronin') || titleLower.includes('sword') || titleLower.includes('blade') || titleLower.includes('trainee') || titleLower.includes('warrior')) return Sword;
  if (titleLower.includes('master') || titleLower.includes('god') || titleLower.includes('lord') || titleLower.includes('archmage') || titleLower.includes('transcendent')) return Crown;
  if (titleLower.includes('storm') || titleLower.includes('element') || titleLower.includes('mage') || titleLower.includes('apprentice')) return Zap;
  return Star;
};

export const NodeInfoModal = memo(({
  isOpen,
  node,
  pathTheme,
  pathTitle,
  userStars,
  previousStageCompleted = true,
  onClose,
  onUnlock,
}: NodeInfoModalProps) => {
  const colors = THEME_COLORS[pathTheme];
  
  const content = node ? NODE_CONTENT[node.title] : null;
  const Icon = node ? getNodeIcon(node.title) : Star;
  
  const canAfford = node ? userStars >= node.starsRequired : false;
  const isUnlockable = node?.status === 'unlockable';
  const isLocked = node?.status === 'locked';
  const isActive = node?.status === 'active';
  const isCompleted = node?.status === 'completed';
  
  // Can only unlock if previous stage is completed (or this is stage 1)
  const canUnlock = isUnlockable && canAfford && previousStageCompleted;

  const handleUnlock = useCallback(() => {
    if (node && canUnlock) {
      onUnlock(node.id);
      onClose();
    }
  }, [node, canUnlock, onUnlock, onClose]);

  const getStatusText = () => {
    if (isCompleted) return 'Completed';
    if (isActive) return 'Active';
    if (isUnlockable) return 'Ready to Unlock';
    return 'Locked';
  };

  const getStatusColor = () => {
    if (isCompleted) return 'text-emerald-400';
    if (isActive) return 'text-cyan-400';
    if (isUnlockable) return 'text-amber-400';
    return 'text-slate-500';
  };

  if (!node) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      showCloseButton={true}
      className="rounded-2xl"
      overlayClassName="bg-black/90"
      borderColor={colors.primary}
      glowColor={colors.glow}
    >
      <div className="px-6 pb-6">
        {/* Icon and Title Section */}
        <div className="flex items-center mt-4 gap-3 mb-4">
          <div 
            className="w-14 h-14 rounded-full flex items-center justify-center border-2"
            style={{ 
              borderColor: isUnlockable ? 'rgb(192, 192, 192)' : colors.primary,
              background: `linear-gradient(135deg, ${colors.bg}, rgba(15, 23, 42, 0.9))`,
              boxShadow: isUnlockable ? '0 0 20px rgba(192, 192, 192, 0.4)' : `0 0 20px ${colors.glow}`,
            }}
          >
            <Icon 
              className="w-7 h-7" 
              style={{ 
                color: isUnlockable ? 'rgb(192, 192, 192)' : colors.primary,
                filter: isUnlockable ? 'drop-shadow(0 0 8px rgba(192, 192, 192, 0.6))' : `drop-shadow(0 0 8px ${colors.glow})`,
              }} 
            />
          </div>
          <div className="flex-1">
            <h2 
              className="text-xl font-bold text-white mb-0.5"
              style={{ textShadow: `0 0 15px ${colors.glow}` }}
            >
              {node.title}
            </h2>
            <p className="text-xs text-slate-400">
              {node.title === 'Tempering' ? 'The Awakening of the Vessel' : `${pathTitle} Path • Stage ${node.stage}`}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor()}`}
            style={{ 
              borderColor: isActive || isCompleted ? colors.primary : undefined,
              backgroundColor: isActive || isCompleted ? `${colors.bg}` : 'rgba(51, 65, 85, 0.5)',
            }}
          >
            {(isLocked || isUnlockable) && <Lock className="w-3 h-3" />}
            {getStatusText()}
          </span>
        </div>

        {/* Divider */}
        <div 
          className="h-px mb-3"
          style={{ background: `linear-gradient(to right, ${colors.primary}50, ${colors.primary}20, transparent)` }}
        />

              {/* Description */}
              <div className="mb-4">
                <h3 
                  className="text-xs font-bold mb-1.5 uppercase tracking-wider"
                  style={{ color: colors.primary }}
                >
                  Description
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {content?.description || 'A mysterious node on your cultivation path. Unlock it to discover its secrets.'}
                </p>
              </div>

              {/* Special Abilities / Core Masteries */}
              <div className="mb-4">
                <h3 
                  className="text-xs font-bold mb-2 uppercase tracking-wider"
                  style={{ color: colors.primary }}
                >
                  {node.coreMasteries ? 'Core Masteries' : 'Special Abilities'}
                </h3>
                <div className="space-y-2">
                  {node.coreMasteries ? (
                    // Core Masteries Template (for Tempering node) - Collapsible
                    node.coreMasteries.map((mastery, index) => (
                      <CollapsibleMastery
                        key={mastery.title}
                        title={mastery.title}
                        benefit={mastery.benefit}
                        index={index}
                        themeColor={colors.primary}
                      />
                    ))
                  ) : (
                    // Default Abilities Template
                    (content?.abilities || ['Unknown Ability', 'Hidden Power', 'Secret Technique']).map((ability, index) => (
                      <motion.div
                        key={ability}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50 border border-slate-700/50"
                      >
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: colors.primary, boxShadow: `0 0 8px ${colors.glow}` }}
                        />
                        <span className="text-sm text-slate-300">{ability}</span>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

              {/* Price Tag */}
              <div 
                className="p-3 rounded-lg border mb-4"
                style={{ 
                  borderColor: `${colors.primary}30`,
                  background: `linear-gradient(135deg, ${colors.bg}, rgba(15, 23, 42, 0.5))`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-cyan-400" strokeWidth={1.25} />
                    <span className="text-xs text-slate-400">Cost to Unlock</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xl font-bold ${canAfford ? 'text-cyan-400' : 'text-red-400'}`}>
                      {node.starsRequired}
                    </span>
                    <Star className={`w-4 h-4 ${canAfford ? 'text-cyan-400' : 'text-red-400'}`} strokeWidth={1.25} />
                  </div>
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Your Stars: <span className={canAfford ? 'text-cyan-400' : 'text-red-400'}>{userStars}</span>
                </div>
              </div>

              {/* Unlock Button */}
              {isUnlockable && (
                <motion.button
                  onClick={handleUnlock}
                  disabled={!canUnlock}
                  whileHover={canUnlock ? { scale: 1.02 } : {}}
                  whileTap={canUnlock ? { scale: 0.98 } : {}}
                  animate={canUnlock && node.title === 'Tempering' ? {
                    boxShadow: [
                      '0 0 20px rgba(225, 29, 72, 0.6)',
                      '0 0 40px rgba(225, 29, 72, 0.8)',
                      '0 0 20px rgba(225, 29, 72, 0.6)',
                    ],
                  } : {}}
                  transition={{
                    boxShadow: {
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    },
                  }}
                  className={`w-full py-3 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2.5 ${
                    canUnlock
                      ? node.title === 'Tempering'
                        ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white hover:from-rose-500 hover:to-red-500 shadow-lg'
                        : 'bg-gradient-to-r from-cyan-600 to-purple-600 text-white hover:from-cyan-500 hover:to-purple-500 shadow-lg'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  }`}
                  style={canUnlock && node.title !== 'Tempering' ? { boxShadow: `0 0 20px ${colors.glow}` } : {}}
                >
                  {!previousStageCompleted ? (
                    <>
                      <Lock className="w-4 h-4" />
                      Complete Previous Node First
                    </>
                  ) : canAfford ? (
                    <>
                      <Star className="w-4 h-4" strokeWidth={1.25} />
                      {node.title === 'Tempering' 
                        ? `Begin Tempering (${node.starsRequired} Stars)` 
                        : `Unlock for ${node.starsRequired} Stars`}
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Not Enough Stars
                    </>
                  )}
                </motion.button>
              )}

              {/* Already Active/Completed Message */}
              {(isActive || isCompleted) && (
                <div 
                  className="w-full py-3 rounded-xl font-bold text-center border-2"
                  style={{ 
                    borderColor: colors.primary,
                    color: colors.primary,
                    backgroundColor: colors.bg,
                  }}
                >
                  {isActive && node.title === 'Tempering' 
                    ? `Current Progress: ${node.starsCurrent}/10 Levels` 
                    : isActive 
                    ? '✨ Currently Active' 
                    : '✓ Completed'}
                </div>
              )}

              {/* Locked Message */}
              {isLocked && (
                <div className="w-full py-4 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-500 font-medium text-center">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Complete previous nodes to unlock
                </div>
              )}
            </div>
          </BaseModal>
  );
});

NodeInfoModal.displayName = 'NodeInfoModal';

export default NodeInfoModal;
