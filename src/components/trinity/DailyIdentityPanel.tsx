/**
 * DailyIdentityPanel — the left-hand hero panel of the Homepage.
 *
 * Shows the PathCard for the identity bound to the currently active Seed.
 * This is the "Repetition surface" — where the user does the daily identity
 * reps that compose who they are becoming.
 *
 * Empty state: when no identity is bound to the active Seed, we render a
 * "Plant this Seed" call-to-action routing to the Path Tree where the user
 * can activate an identity.
 *
 * Rendering responsibilities (rewards, level-up branching per path, trial
 * info) match what the pre-refactor Homepage did inline. That logic lived
 * in the page; moving it here keeps Homepage.tsx thin.
 */
import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, Dumbbell, Brain } from 'lucide-react';
import { shallow } from 'zustand/shallow';
import { useGameStore } from '@/store/gameStore';
import PathCard from '@/components/path/PathCard';
import {
  getTemperingLevel,
  generateTemperingTaskTemplates,
  TEMPERING_TEMPLATE_ID,
} from '@/constants/temperingPath';
import {
  getPresenceLevel,
  generatePresenceTaskTemplates,
  PRESENCE_TEMPLATE_ID,
} from '@/constants/presencePath';
import {
  getMageLevel,
  generateMageTaskTemplates,
  MAGE_TEMPLATE_ID,
} from '@/constants/magePath';
import { logger } from '@/utils/logger';
import type { SeedAxis } from '@/types/database';

const AXIS_LABEL: Record<SeedAxis, string> = {
  body: 'BODY',
  mind: 'MIND',
  soul: 'SOUL',
};

const AXIS_COPY: Record<SeedAxis, { tagline: string; cta: string; Icon: typeof Dumbbell }> = {
  body: {
    tagline: 'The vessel awaits its forge.',
    cta: 'Bind a Body Seed',
    Icon: Dumbbell,
  },
  mind: {
    tagline: 'The signal awaits its tuning.',
    cta: 'Bind a Mind Seed',
    Icon: Brain,
  },
  soul: {
    tagline: 'The chamber awaits its flame.',
    cta: 'Bind a Soul Seed',
    Icon: Sparkles,
  },
};

interface EmptySeedProps {
  axis: SeedAxis;
}

const EmptySeedPlanter = memo(({ axis }: EmptySeedProps) => {
  const { tagline, cta, Icon } = AXIS_COPY[axis];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      className="card-style flex flex-col items-center text-center gap-4 py-10 px-6"
    >
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-700/40 to-cyan-600/30 flex items-center justify-center shadow-[0_0_24px_-6px_rgba(139,92,246,0.6)]">
        <Icon className="w-8 h-8 text-cyan-200" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-title uppercase tracking-[0.18em] text-white">
          {AXIS_LABEL[axis]} Seed · unbound
        </h3>
        <p className="text-sm text-slate-400 font-accent italic">{tagline}</p>
      </div>
      <Link
        to="/path-tree"
        className="btn-primary inline-flex items-center gap-2"
      >
        <Sparkles className="w-4 h-4" />
        {cta}
      </Link>
    </motion.div>
  );
});
EmptySeedPlanter.displayName = 'EmptySeedPlanter';

const DailyIdentityPanel = memo(() => {
  const { activeSeed, trinity, activeIdentities } = useGameStore(
    (state) => ({
      activeSeed: state.activeSeed,
      trinity: state.trinity,
      activeIdentities: state.activeIdentities,
    }),
    shallow
  );

  const identity = useMemo(() => {
    const boundId = trinity[activeSeed];
    if (!boundId) return null;
    return activeIdentities.find((i) => i.id === boundId) ?? null;
  }, [trinity, activeSeed, activeIdentities]);

  if (!identity) {
    return <EmptySeedPlanter axis={activeSeed} />;
  }

  // Path-type detection (mirrors legacy Homepage rendering logic).
  const isTempering = identity.template.id.startsWith(TEMPERING_TEMPLATE_ID);
  const isPresence = identity.template.id.startsWith(PRESENCE_TEMPLATE_ID);
  const isMage = identity.template.id.startsWith(MAGE_TEMPLATE_ID);
  const currentLevel = identity.current_level;
  const pathConfig = isTempering
    ? getTemperingLevel(currentLevel)
    : isPresence
    ? getPresenceLevel(currentLevel)
    : isMage
    ? getMageLevel(currentLevel)
    : null;
  const pathId = isTempering
    ? TEMPERING_TEMPLATE_ID
    : isPresence
    ? PRESENCE_TEMPLATE_ID
    : isMage
    ? MAGE_TEMPLATE_ID
    : undefined;

  const transformedTasks = identity.available_tasks.map((task) => ({
    id: task.id,
    title: task.name,
    description:
      task.description ||
      `Complete ${task.name} to earn rewards and progress your cultivation journey.`,
    rewards: {
      xp: task.xp_reward,
      stat: task.target_stat,
      points: task.base_points_reward,
      coins: task.coin_reward,
    },
    subtasks: task.subtasks?.map((st) => ({
      id: st.id,
      name: st.name,
      description: st.description,
    })),
    path_id: task.path_id || pathId,
    path_level: task.path_level || currentLevel,
  }));

  const maxXP = pathConfig?.xpToLevelUp || 100 * (currentLevel + 1);
  const trialInfo = pathConfig
    ? {
        name: pathConfig.trial.name,
        description: pathConfig.trial.focus,
        tasks: pathConfig.trial.tasks,
        rewards: pathConfig.trial.rewards,
      }
    : undefined;

  // Level-up branching lifted directly from the legacy Homepage block.
  const getNextLevelData = (newLevel: number) => {
    if (isTempering) {
      const nextConfig = getTemperingLevel(newLevel);
      if (!nextConfig) return null;
      const nextTasks = generateTemperingTaskTemplates(newLevel);
      return {
        title: `Tempering Lv.${newLevel}`,
        subtitle: nextConfig.subtitle,
        tasks: nextTasks.map((t) => ({
          id: t.id,
          title: t.name,
          description: t.description || '',
          rewards: {
            xp: t.xp_reward,
            stat: t.target_stat,
            points: t.base_points_reward,
            coins: t.coin_reward,
          },
          subtasks: t.subtasks?.map((st) => ({
            id: st.id,
            name: st.name,
            description: st.description,
          })),
          path_id: t.path_id || TEMPERING_TEMPLATE_ID,
          path_level: t.path_level || newLevel,
        })),
        trialInfo: {
          name: nextConfig.trial.name,
          description: nextConfig.trial.focus,
          tasks: nextConfig.trial.tasks,
          rewards: nextConfig.trial.rewards,
        },
        maxXP: nextConfig.xpToLevelUp,
      };
    }
    if (isPresence) {
      const nextConfig = getPresenceLevel(newLevel);
      if (!nextConfig) return null;
      const nextTasks = generatePresenceTaskTemplates(newLevel);
      return {
        title: `Presence Lv.${newLevel}`,
        subtitle: nextConfig.subtitle,
        tasks: nextTasks.map((t) => ({
          id: t.id,
          title: t.name,
          description: t.description || '',
          rewards: {
            xp: t.xp_reward,
            stat: t.target_stat,
            points: t.base_points_reward,
            coins: t.coin_reward,
          },
          subtasks: t.subtasks?.map((st) => ({
            id: st.id,
            name: st.name,
            description: st.description,
          })),
          path_id: t.path_id || PRESENCE_TEMPLATE_ID,
          path_level: t.path_level || newLevel,
        })),
        trialInfo: {
          name: nextConfig.trial.name,
          description: nextConfig.trial.focus,
          tasks: nextConfig.trial.tasks,
          rewards: nextConfig.trial.rewards,
        },
        maxXP: nextConfig.xpToLevelUp,
      };
    }
    if (isMage) {
      const nextConfig = getMageLevel(newLevel);
      if (!nextConfig) return null;
      const nextTasks = generateMageTaskTemplates(newLevel);
      return {
        title: `Mage Lv.${newLevel}`,
        subtitle: nextConfig.subtitle,
        tasks: nextTasks.map((t) => ({
          id: t.id,
          title: t.name,
          description: t.description || '',
          rewards: {
            xp: t.xp_reward,
            stat: t.target_stat,
            points: t.base_points_reward,
            coins: t.coin_reward,
          },
          subtasks: t.subtasks?.map((st) => ({
            id: st.id,
            name: st.name,
            description: st.description,
          })),
          path_id: t.path_id || MAGE_TEMPLATE_ID,
          path_level: t.path_level || newLevel,
        })),
        trialInfo: {
          name: nextConfig.trial.name,
          description: nextConfig.trial.focus,
          tasks: nextConfig.trial.tasks,
          rewards: nextConfig.trial.rewards,
        },
        maxXP: nextConfig.xpToLevelUp,
      };
    }
    return null;
  };

  const pathTitle = isTempering
    ? `Tempering Lv.${currentLevel}`
    : isPresence
    ? `Presence Lv.${currentLevel}`
    : isMage
    ? `Mage Lv.${currentLevel}`
    : identity.template.name.split(' - ')[0];

  return (
    <PathCard
      identityId={identity.id}
      title={pathTitle}
      subtitle={pathConfig?.subtitle}
      status={identity.completed_today ? 'completed' : 'pending'}
      currentXP={identity.current_xp}
      maxXP={maxXP}
      streak={identity.current_streak}
      level={currentLevel}
      tasks={transformedTasks}
      trialInfo={trialInfo}
      onLevelUp={isTempering || isPresence || isMage ? getNextLevelData : undefined}
      onTaskComplete={async (taskId) => {
        logger.info('Task completed', { taskId, identityId: identity.id });
        const result = await useGameStore
          .getState()
          .completeTask(identity.id, taskId);
        const body = result.rewards.body_points ?? 0;
        const mind = result.rewards.mind_points ?? 0;
        const soul = result.rewards.soul_points ?? 0;
        return {
          didGainBody: body > 0,
          statPointsAwarded: body + mind + soul,
          coinsAwarded: result.rewards.coins ?? 0,
        };
      }}
      onAllTasksComplete={async (newStreak) => {
        await useGameStore
          .getState()
          .updateIdentityStreak(identity.id, newStreak);
      }}
      onTrialStart={() => {
        logger.info('Trial started for identity', { identityId: identity.id });
      }}
      onTrialComplete={async (newLevel) => {
        await useGameStore
          .getState()
          .updateIdentityLevel(identity.id, newLevel, 0);
      }}
    />
  );
});

DailyIdentityPanel.displayName = 'DailyIdentityPanel';

export default DailyIdentityPanel;
