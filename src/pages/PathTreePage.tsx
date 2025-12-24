import { memo, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/layout/Header';
import { NavMenu } from '@/components/layout/NavMenu';
import ParticleBackground from '@/components/layout/ParticleBackground';
import { ErrorBoundary } from '@/components/common';
import { HeroNode, PathTabs, SubNode, TreeConnections } from '@/components/pathTree';
import { NodeInfoModal } from '@/components/modals/NodeInfoModal';
import { PATH_DATA, THEME_COLORS, type PathNode, type CultivationPath } from '@/constants/pathTreeData';
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

const PathTreePage = memo(() => {
  const [activePathIndex, setActivePathIndex] = useState(0);
  const [paths, setPaths] = useState<CultivationPath[]>(PATH_DATA);
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

  // Check if Tempering identity is active and update warrior hero node accordingly
  useEffect(() => {
    const temperingActive = activeIdentities.some(
      identity => identity.template_id.startsWith('tempering-warrior-trainee')
    );
    
    if (temperingActive) {
      setPaths(prevPaths => prevPaths.map(path => {
        if (path.id === 'warrior') {
          return {
            ...path,
            nodes: path.nodes.map(node => {
              // Mark warrior hero node as active if Tempering exists
              if (node.stage === 1 && node.position === 'center' && node.status !== 'active') {
                return { ...node, status: 'active' as const };
              }
              // Make stage 2 nodes unlockable
              if (node.stage === 2 && node.status === 'locked') {
                return { ...node, status: 'unlockable' as const };
              }
              return node;
            }),
          };
        }
        return path;
      }));
      logger.info('PathTree updated for Tempering identity');
    }
  }, [activeIdentities]);

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

      // Optimistic update
      const updatedPaths = paths.map((path) => {
        if (path.id === activePath.id) {
          return {
            ...path,
            nodes: path.nodes.map((n) => {
              // Mark the previously active node as completed
              if (previousActiveNode && n.id === previousActiveNode.id) {
                return { ...n, status: 'completed' as const };
              }
              // Newly unlocked node becomes active
              if (n.id === nodeId) {
                return { ...n, status: 'active' as const };
              }
              // Next nodes in progression become unlockable
              if (nextUnlockableIds.includes(n.id)) {
                return { ...n, status: 'unlockable' as const };
              }
              
              // Special check: If both Stage 2 nodes are now active/completed, unlock Stage 3 center
              if (n.stage === 3 && n.position === 'center-branch' && n.status === 'locked') {
                const stage2Left = path.nodes.find(node => node.stage === 2 && node.position === 'left-branch');
                const stage2Right = path.nodes.find(node => node.stage === 2 && node.position === 'right-branch');
                
                // Account for the node being unlocked right now (it will become active)
                const leftCompleted = stage2Left?.id === nodeId || stage2Left?.status === 'active' || stage2Left?.status === 'completed';
                const rightCompleted = stage2Right?.id === nodeId || stage2Right?.status === 'active' || stage2Right?.status === 'completed';
                const bothStage2Completed = leftCompleted && rightCompleted;
                
                if (bothStage2Completed) {
                  return { ...n, status: 'unlockable' as const };
                }
              }
              
              // When unlocking stage 3, LOCK the path:
              // - Lock the other stage 2 branch (if not already active/completed)
              // - Lock all stage 3+ nodes not on this branch
              if (node.stage === 3) {
                // Lock other stage 2 nodes
                if (n.stage === 2 && n.status === 'unlockable') {
                  return { ...n, status: 'locked' as const };
                }
                // Lock all stage 3+ nodes not on this branch (except center which may be accessible from both)
                if (n.stage >= 3 && n.position !== node.position && n.position !== 'center-branch' && n.status !== 'active' && n.status !== 'completed') {
                  return { ...n, status: 'locked' as const };
                }
              }
              return n;
            }),
          };
        }
        return path;
      });

      setPaths(updatedPaths);
      
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
            remainingStars: userProfile.stars - node.starsRequired 
          });
          
          // If unlocking warrior hero node (stage 1), also activate Tempering Lv.1 identity
          if (activePath.id === 'warrior' && node.stage === 1 && node.position === 'center') {
            await activateIdentity('tempering-warrior-trainee-lvl1');
            logger.info('Tempering Lv.1 identity activated');
          }
        } catch (error) {
          logger.error('Failed to unlock node', error);
          // Rollback UI state on error
          setPaths(paths);
        }
      }
      
      logger.info('Node unlocked', { nodeId, previousActive: previousActiveNode?.id, nextUnlockable: nextUnlockableIds });
    },
    [activePath, paths, currentActiveNode, userStars, activateIdentity, userProfile, loadUserProfile]
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
