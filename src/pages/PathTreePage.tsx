import { memo, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/layout/Header';
import { NavMenu } from '@/components/layout/NavMenu';
import ParticleBackground from '@/components/layout/ParticleBackground';
import { ErrorBoundary } from '@/components/common';
import { HeroNode, PathTabs, SubNode, TreeConnections } from '@/components/pathTree';
import { NodeInfoModal } from '@/components/modals/NodeInfoModal';
import { PATH_DATA, THEME_COLORS, type PathNode, type CultivationPath, type NodeStatus } from '@/constants/pathTreeData';
import { useGameStore } from '@/store/gameStore';
import { useAuthStore } from '@/store/authStore';
import { logger } from '@/utils/logger';
import { shallow } from 'zustand/shallow';

/**
 * Helper to determine which nodes become unlockable when a node is unlocked
 * 
 * NEW UNLOCKING RULES (Diamond Synthesis):
 * Stage 1 -> Stage 2: Both stage 2 branches become unlockable
 * Stage 2: Player can unlock BOTH stage 2 branches if they want
 * Stage 2 -> Stage 3: 
 *   - Left/Right branches are unlockable immediately after corresponding Stage 2
 *   - Center branch requires BOTH Stage 2 nodes to be mastered (completed)
 *   - Unlocking ANY Stage 3 node LOCKS the path - point of no return
 * Stage 3-5: Only vertical progression on the chosen branch
 * Stage 5 -> Stage 6: Stage 6 becomes unlockable only after Stage 5 is mastered
 */
const getNextUnlockableNodes = (unlockedNode: PathNode, allNodes: PathNode[]): string[] => {
  const nextIds: string[] = [];
  
  if (unlockedNode.stage === 1) {
    // Unlocking hero node makes all stage 2 nodes unlockable
    allNodes.forEach(n => {
      if (n.stage === 2 && n.status === 'locked') {
        nextIds.push(n.id);
      }
    });
  } else if (unlockedNode.stage === 2) {
    // Stage 2 -> Stage 3: Make the corresponding stage 3 nodes unlockable
    // Left branch -> Left stage 3
    // Right branch -> Right stage 3
    // Center branch -> Only if BOTH stage 2 nodes are completed (active or completed)
    const nextStage = 3;
    const stage2Left = allNodes.find(n => n.stage === 2 && n.position === 'left-branch');
    const stage2Right = allNodes.find(n => n.stage === 2 && n.position === 'right-branch');
    const bothStage2Completed = 
      (stage2Left?.status === 'active' || stage2Left?.status === 'completed') &&
      (stage2Right?.status === 'active' || stage2Right?.status === 'completed');
    
    allNodes.forEach(n => {
      if (n.stage === nextStage && n.status === 'locked') {
        // Left branch unlocks left-branch stage 3
        if (unlockedNode.position === 'left-branch' && n.position === 'left-branch') {
          nextIds.push(n.id);
        }
        // Right branch unlocks right-branch stage 3
        if (unlockedNode.position === 'right-branch' && n.position === 'right-branch') {
          nextIds.push(n.id);
        }
        // Center branch only if BOTH stage 2 are completed (active or completed)
        if (n.position === 'center-branch' && bothStage2Completed) {
          nextIds.push(n.id);
        }
      }
    });
  } else if (unlockedNode.stage >= 3 && unlockedNode.stage < 5) {
    // After stage 3, strict vertical progression on same branch only
    const nextStage = unlockedNode.stage + 1;
    allNodes.forEach(n => {
      if (n.stage === nextStage && n.position === unlockedNode.position && n.status === 'locked') {
        nextIds.push(n.id);
      }
    });
  } else if (unlockedNode.stage === 5) {
    // Stage 5 -> Stage 6: Make the apex node unlockable
    allNodes.forEach(n => {
      if (n.stage === 6 && n.status === 'locked') {
        nextIds.push(n.id);
      }
    });
  }
  
  return nextIds;
};

/**
 * Find the current active node in a path
 */
const findActiveNode = (nodes: PathNode[]): PathNode | undefined => {
  return nodes.find(n => n.status === 'active');
};

/**
 * Maps a PATH_DATA path id to the identity template id that represents
 * the Stage-1 ("hero") identity on that path. The `startsWith` match
 * lets us recognise any level in the template family (e.g. -lvl1, -lvl2).
 */
const PATH_TO_IDENTITY_PREFIX: Record<string, string> = {
  warrior: 'tempering-warrior-trainee',
  mage: 'mage-scholar-training',
  mystic: 'presence-mystic-training',
};

/**
 * Pure deriver: given PATH_DATA, the currently active identities and any
 * session-only unlock overrides, return the display-ready paths array.
 *
 * - If the path's starter identity exists: Stage-1 hero → active, Stage-2 → unlockable.
 * - Otherwise the baseline PATH_DATA is returned (Stage-1 hero → unlockable).
 * - `sessionUnlocks` lets `handleUnlockNode` keep its optimistic feedback
 *   for Stage-2+ node state without introducing a second source of truth.
 */
const derivePathsFromIdentities = (
  activeIdentityTemplateIds: string[],
  sessionUnlocks: Record<string, NodeStatus>
): CultivationPath[] => {
  return PATH_DATA.map((path) => {
    const prefix = PATH_TO_IDENTITY_PREFIX[path.id];
    const starterActive = prefix
      ? activeIdentityTemplateIds.some((tid) => tid.startsWith(prefix))
      : false;

    return {
      ...path,
      nodes: path.nodes.map((node) => {
        const override = sessionUnlocks[node.id];
        if (override) return { ...node, status: override };

        if (starterActive) {
          if (node.stage === 1 && node.position === 'center') {
            return { ...node, status: 'active' as const };
          }
          if (node.stage === 2 && node.status === 'locked') {
            return { ...node, status: 'unlockable' as const };
          }
        }
        return node;
      }),
    };
  });
};

const PathTreePage = memo(() => {
  const [activePathIndex, setActivePathIndex] = useState(0);
  // Session-only optimistic overrides for nodes the user has unlocked this
  // session (Stage 2+). Stage 1 unlocks flow through activeIdentities so
  // they survive refresh; Stage 2+ are transient until persisted elsewhere.
  const [sessionUnlocks, setSessionUnlocks] = useState<Record<string, NodeStatus>>({});
  const [selectedNode, setSelectedNode] = useState<PathNode | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Auth and game store integration
  const { isAuthenticated, currentUser: authUser } = useAuthStore();
  const {
    userProfile,
    isInitialized,
    initializeUser,
    activateIdentity,
    loadUserProfile,
    activeIdentities,
  } = useGameStore(
    (state) => ({
      userProfile: state.userProfile,
      isInitialized: state.isInitialized,
      initializeUser: state.initializeUser,
      activateIdentity: state.activateIdentity,
      loadUserProfile: state.loadUserProfile,
      activeIdentities: state.activeIdentities,
    }),
    shallow
  );

  // Initialize game data when user is authenticated
  const initStartedRef = useRef(false);

  useEffect(() => {
    const initializeGameData = async () => {
      if (!isAuthenticated || !authUser?.id) {
        initStartedRef.current = false;
        return;
      }

      if (initStartedRef.current || isInitialized) return;

      initStartedRef.current = true;
      logger.info('PathTreePage: Starting game data initialization', { userId: authUser.id });
      await initializeUser(authUser.id);
      logger.info('PathTreePage: Game data initialization complete');
    };
    
    initializeGameData();
  }, [isAuthenticated, authUser?.id, isInitialized, initializeUser]);

  // Derive paths directly from activeIdentities + session unlocks.
  // This replaces the previous `useState + useEffect` sync which held a
  // second source of truth that could drift from the store.
  const activeTemplateIds = useMemo(
    () => activeIdentities.map((i) => i.template_id),
    [activeIdentities]
  );
  const paths = useMemo(
    () => derivePathsFromIdentities(activeTemplateIds, sessionUnlocks),
    [activeTemplateIds, sessionUnlocks]
  );

  // Get user stars (fallback to 0 if not loaded)
  const userStars = userProfile?.stars ?? 0;

  const activePath = useMemo(() => paths[activePathIndex], [paths, activePathIndex]);
  const colors = useMemo(() => THEME_COLORS[activePath.themeColor], [activePath.themeColor]);
  
  // Find the current active node for this path
  const currentActiveNode = useMemo(() => 
    findActiveNode(activePath.nodes),
    [activePath.nodes]
  );

  const handlePathSelect = useCallback((index: number) => {
    setActivePathIndex(index);
  }, []);

  // Handler to open the node info modal
  const handleNodeClick = useCallback((nodeId: string) => {
    const node = activePath.nodes.find((n) => n.id === nodeId);
    if (node) {
      setSelectedNode(node);
      setIsModalOpen(true);
    }
  }, [activePath.nodes]);

  // Handler to close the modal
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedNode(null);
  }, []);

  const handleUnlockNode = useCallback(
    async (nodeId: string) => {
      const node = activePath.nodes.find((n) => n.id === nodeId);
      if (!node || node.status !== 'unlockable') return;

      // Check if user has enough stars
      if (userStars < node.starsRequired) {
        logger.warn('Not enough stars to unlock node', { nodeId, required: node.starsRequired, available: userStars });
        return;
      }

      // NEW LOCKING RULES:
      // - Stage 2: Player can unlock BOTH stage 2 branches freely
      // - Stage 3+: Once a stage 3 node is unlocked, the path is LOCKED
      
      // Check if path is locked (any stage 3+ node is active or completed)
      const pathIsLocked = activePath.nodes.some(
        n => n.stage >= 3 && (n.status === 'active' || n.status === 'completed')
      );
      
      // If path is locked and trying to unlock a stage 3+ node on a different branch
      if (pathIsLocked && node.stage >= 3) {
        // Find the locked branch (the one with stage 3+ active/completed)
        const lockedBranchNode = activePath.nodes.find(
          n => n.stage >= 3 && (n.status === 'active' || n.status === 'completed')
        );
        
        if (lockedBranchNode && node.position !== lockedBranchNode.position) {
          logger.warn('Path is locked, cannot unlock node on different branch', { 
            nodeId, 
            lockedBranch: lockedBranchNode.position,
            attemptedBranch: node.position
          });
          return;
        }
      }

      // Get the nodes that will become unlockable after this unlock
      const nextUnlockableIds = getNextUnlockableNodes(node, activePath.nodes);

      // Find the currently active node to mark as completed
      const previousActiveNode = currentActiveNode;

      // Build the session-unlock overlay patch for this unlock. All of this
      // state used to live in a parallel `paths` state; moving it into
      // `sessionUnlocks` keeps `activeIdentities` as the single source of
      // truth for what actually persists.
      const unlockPatch: Record<string, NodeStatus> = {};
      if (previousActiveNode) {
        unlockPatch[previousActiveNode.id] = 'completed';
      }
      unlockPatch[nodeId] = 'active';
      for (const id of nextUnlockableIds) {
        unlockPatch[id] = 'unlockable';
      }

      // Stage 3 center unlock: if both Stage 2 branches are now active/completed,
      // the center Stage 3 node should become unlockable too.
      const stage2Left = activePath.nodes.find(n => n.stage === 2 && n.position === 'left-branch');
      const stage2Right = activePath.nodes.find(n => n.stage === 2 && n.position === 'right-branch');
      const leftCompleted = stage2Left && (stage2Left.id === nodeId || stage2Left.status === 'active' || stage2Left.status === 'completed');
      const rightCompleted = stage2Right && (stage2Right.id === nodeId || stage2Right.status === 'active' || stage2Right.status === 'completed');
      if (leftCompleted && rightCompleted) {
        const stage3Center = activePath.nodes.find(n => n.stage === 3 && n.position === 'center-branch');
        if (stage3Center && stage3Center.status === 'locked') {
          unlockPatch[stage3Center.id] = 'unlockable';
        }
      }

      // When unlocking a Stage 3 node, LOCK the path to this branch.
      if (node.stage === 3) {
        for (const n of activePath.nodes) {
          if (n.stage === 2 && n.status === 'unlockable') {
            unlockPatch[n.id] = 'locked';
          }
          if (
            n.stage >= 3 &&
            n.position !== node.position &&
            n.position !== 'center-branch' &&
            n.status !== 'active' &&
            n.status !== 'completed'
          ) {
            unlockPatch[n.id] = 'locked';
          }
        }
      }

      setSessionUnlocks((prev) => ({ ...prev, ...unlockPatch }));

      // Deduct stars for ALL node unlocks
      if (userProfile && node.starsRequired > 0) {
        try {
          // Deduct stars from user profile
          const { gameDB } = await import('@/api/gameDatabase');
          await gameDB.updateProfile(userProfile.id, {
            stars: userProfile.stars - node.starsRequired,
          });

          // Reload profile to update UI with animated star count
          await loadUserProfile(userProfile.id);

          logger.info('Stars deducted for node unlock', {
            nodeId,
            starsDeducted: node.starsRequired,
            remainingStars: userProfile.stars - node.starsRequired,
          });

          // Stage 1 hero unlock also plants the starter identity on that axis.
          if (node.stage === 1 && node.position === 'center') {
            if (activePath.id === 'warrior') {
              await activateIdentity('tempering-warrior-trainee-lvl1');
              logger.info('Tempering Lv.1 identity activated');
            } else if (activePath.id === 'mage') {
              await activateIdentity('mage-scholar-training-lvl1');
              logger.info('Mage Lv.1 identity activated');
            } else if (activePath.id === 'mystic') {
              await activateIdentity('presence-mystic-training-lvl1');
              logger.info('Presence Lv.1 identity activated');
            }
          }
        } catch (error) {
          logger.error('Failed to unlock node', error);
          // Rollback: drop just this unlock patch (keep any earlier overrides).
          setSessionUnlocks((prev) => {
            const rollback = { ...prev };
            for (const id of Object.keys(unlockPatch)) {
              delete rollback[id];
            }
            return rollback;
          });
        }
      }

      logger.info('Node unlocked', { nodeId, previousActive: previousActiveNode?.id, nextUnlockable: nextUnlockableIds });
    },
    [activePath, currentActiveNode, userStars, activateIdentity, userProfile, loadUserProfile]
  );

  // Get nodes by stage for display
  const heroNode = useMemo(() => 
    activePath.nodes.find((n) => n.stage === 1 && n.position === 'center'),
    [activePath.nodes]
  );

  const stage2Nodes = useMemo(() => 
    activePath.nodes.filter((n) => n.stage === 2),
    [activePath.nodes]
  );

  const stage3Nodes = useMemo(() => 
    activePath.nodes.filter((n) => n.stage === 3),
    [activePath.nodes]
  );

  const stage4Nodes = useMemo(() => 
    activePath.nodes.filter((n) => n.stage === 4),
    [activePath.nodes]
  );

  const stage5Nodes = useMemo(() => 
    activePath.nodes.filter((n) => n.stage === 5),
    [activePath.nodes]
  );

  const stage6Nodes = useMemo(() => 
    activePath.nodes.filter((n) => n.stage === 6),
    [activePath.nodes]
  );

  // Level for active hero node (would come from game state)
  const heroLevel = useMemo(() => 3, []);

  // Sort nodes by position for consistent rendering (left, center, right)
  const sortByPosition = (a: PathNode, b: PathNode) => {
    const order = { 'left-branch': 0, 'center-branch': 1, 'right-branch': 2 };
    return (order[a.position as keyof typeof order] ?? 1) - (order[b.position as keyof typeof order] ?? 1);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      {/* Radial Gradient Background */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          background: `radial-gradient(ellipse at center top, ${colors.bg} 0%, rgba(15, 23, 42, 0) 60%)`,
        }}
      />
      
      <ParticleBackground />

      <div className="relative z-10">
        <Header />
        <NavMenu />

        <ErrorBoundary
          fallbackTitle="Path Tree Error"
          fallbackMessage="Failed to load cultivation path. Please try again."
          onRetry={() => window.location.reload()}
        >
          <main className="max-w-md mx-auto px-4 py-8 pt-5 pb-32">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-6"
          >
            <h1
              className="text-4xl md:text-5xl font-bold text-white uppercase tracking-[0.2em]"
              style={{
                textShadow: `
                  2px 0 0 rgba(0, 255, 255, 0.3), 
                  -2px 0 0 rgba(255, 0, 100, 0.3),
                  0 0 20px ${colors.glow}
                `,
                fontWeight: 800,
              }}
            >
              {activePath.title}
            </h1>
          </motion.div>

          {/* Path Tabs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-8 mb-8"
          >
            <PathTabs
              paths={paths}
              activeIndex={activePathIndex}
              onSelect={handlePathSelect}
            />
          </motion.div>

          {/* Tree Container */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activePath.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              {/* Connection Lines Layer */}
              <div className="absolute inset-0 flex justify-center">
                <div className="relative w-full h-[820px] sm:h-[950px]">
                  <TreeConnections theme={activePath.themeColor} nodes={activePath.nodes} />
                </div>
              </div>

              {/* Nodes Layer */}
              <div className="relative z-10">
                {/* Hero Node - Stage 1 */}
                {heroNode && (
                  <div className="flex justify-center mb-8 sm:mb-12">
                    <HeroNode
                      node={heroNode}
                      pathTheme={activePath.themeColor}
                      pathId={activePath.id}
                      level={heroLevel}
                      onClick={handleNodeClick}
                    />
                  </div>
                )}

                {/* Stage 2 - Two Branch Choices */}
                {stage2Nodes.length > 0 && (
                  <div className="flex justify-around items-start px-0 mb-8 mt-4 sm:mb-12 sm:mt-6 sm:px-2">
                    {stage2Nodes
                      .sort(sortByPosition)
                      .map((node) => (
                        <SubNode
                          key={node.id}
                          node={node}
                          pathTheme={activePath.themeColor}
                          onClick={handleNodeClick}
                        />
                      ))}
                  </div>
                )}

                {/* Stage 3 - Vertical Progression */}
                {stage3Nodes.length > 0 && (
                  <div className="flex justify-between items-start px-0 mb-8 mt-4 sm:mb-12 sm:mt-6 sm:px-2">
                    {stage3Nodes
                      .sort(sortByPosition)
                      .map((node) => (
                        <SubNode
                          key={node.id}
                          node={node}
                          pathTheme={activePath.themeColor}
                          onClick={handleNodeClick}
                        />
                      ))}
                  </div>
                )}

                {/* Stage 4 - Vertical Progression */}
                {stage4Nodes.length > 0 && (
                  <div className="flex justify-between items-start px-0 mb-8 mt-4 sm:mb-12 sm:mt-6 sm:px-2">
                    {stage4Nodes
                      .sort(sortByPosition)
                      .map((node) => (
                        <SubNode
                          key={node.id}
                          node={node}
                          pathTheme={activePath.themeColor}
                          onClick={handleNodeClick}
                        />
                      ))}
                  </div>
                )}

                {/* Stage 5 - Final Nodes */}
                {stage5Nodes.length > 0 && (
                  <div className="flex justify-between items-start px-0 mb-8 mt-4 sm:mb-12 sm:mt-6 sm:px-2">
                    {stage5Nodes
                      .sort(sortByPosition)
                      .map((node) => (
                        <SubNode
                          key={node.id}
                          node={node}
                          pathTheme={activePath.themeColor}
                          onClick={handleNodeClick}
                        />
                      ))}
                  </div>
                )}

                {/* Stage 6 - Apex Node */}
                {stage6Nodes.length > 0 && (
                  <div className="flex justify-center items-start px-0 mb-8 mt-4 sm:mb-12 sm:mt-6 sm:px-2">
                    {stage6Nodes.map((node) => (
                      <SubNode
                        key={node.id}
                        node={node}
                        pathTheme={activePath.themeColor}
                        onClick={handleNodeClick}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </main>
        </ErrorBoundary>
      </div>

      {/* Node Info Modal */}
      <NodeInfoModal
        isOpen={isModalOpen}
        node={selectedNode}
        pathTheme={activePath.themeColor}
        pathTitle={activePath.title}
        userStars={userStars}
        previousStageCompleted={
          // Check if previous stage is completed (or if this is stage 1)
          selectedNode?.stage === 1 
            ? true 
            : activePath.nodes.some(n => 
                n.stage === (selectedNode?.stage ?? 1) - 1 && 
                n.status === 'completed'
              )
        }
        onClose={handleCloseModal}
        onUnlock={handleUnlockNode}
      />
    </div>
  );
});

PathTreePage.displayName = 'PathTreePage';

export default PathTreePage;
