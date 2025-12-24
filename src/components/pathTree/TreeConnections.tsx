import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { PathTheme, PathNode, NodePosition } from '@/constants/pathTreeData';
import { THEME_COLORS } from '@/constants/pathTreeData';

interface TreeConnectionsProps {
  theme: PathTheme;
  nodes: PathNode[];
}

// Helper component for connection lines
const ConnectionLine = memo(({ 
  path, 
  isActive, 
  colors, 
  theme, 
  delay = 0 
}: { 
  path: string; 
  isActive: boolean; 
  colors: { primary: string; glow: string }; 
  theme: PathTheme;
  delay?: number;
}) => {
  if (isActive) {
    return (
      <>
        <path
          d={path}
          fill="none"
          stroke={colors.primary}
          strokeWidth="4"
          opacity="0.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#connection-glow-${theme})`}
          vectorEffect="non-scaling-stroke"
        />
        <motion.path
          d={path}
          fill="none"
          stroke={colors.primary}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: 'easeOut', delay }}
          style={{
            filter: `drop-shadow(0 0 4px ${colors.glow})`,
          }}
        />
      </>
    );
  }
  
  return (
    <path
      d={path}
      fill="none"
      stroke="rgb(71, 85, 105)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="4 4"
      vectorEffect="non-scaling-stroke"
    />
  );
});

ConnectionLine.displayName = 'ConnectionLine';

// Globe animation component - travels from hero to active node using SVG animateMotion
const GlobeAnimation = memo(({ 
  fullPath, 
  colors, 
  theme 
}: { 
  fullPath: string; 
  colors: { primary: string; glow: string }; 
  theme: PathTheme;
}) => {
  return (
    <>
      {/* Main sphere with radial gradient */}
      <circle
        cx="0"
        cy="0"
        r="5"
        fill={`url(#sphere-gradient-${theme})`}
        filter={`url(#globe-glow-${theme})`}
      >
        <animateMotion
          dur="3s"
          repeatCount="indefinite"
          path={fullPath}
          calcMode="spline"
          keySplines="0.42 0 0.58 1"
        />
      </circle>
      {/* Bright center core */}
      <circle
        cx="0"
        cy="0"
        r="2"
        fill="white"
        opacity={0.9}
      >
        <animateMotion
          dur="3s"
          repeatCount="indefinite"
          path={fullPath}
          calcMode="spline"
          keySplines="0.42 0 0.58 1"
        />
      </circle>
      {/* Trailing particle 1 */}
      <circle
        cx="0"
        cy="0"
        r="3"
        fill={colors.primary}
        opacity={0.5}
        filter={`url(#globe-glow-${theme})`}
      >
        <animateMotion
          dur="3s"
          repeatCount="indefinite"
          path={fullPath}
          begin="0.15s"
          calcMode="spline"
          keySplines="0.42 0 0.58 1"
        />
      </circle>
      {/* Trailing particle 2 */}
      <circle
        cx="0"
        cy="0"
        r="2"
        fill={colors.primary}
        opacity={0.3}
        filter={`url(#globe-glow-${theme})`}
      >
        <animateMotion
          dur="3s"
          repeatCount="indefinite"
          path={fullPath}
          begin="0.25s"
          calcMode="spline"
          keySplines="0.42 0 0.58 1"
        />
      </circle>
    </>
  );
});

GlobeAnimation.displayName = 'GlobeAnimation';

// Type for globe path configuration
type GlobePathConfig = 
  | { dual: true; leftPath: string; rightPath: string }
  | { dual: false; path: string }
  | null;

export const TreeConnections = memo(({ theme, nodes }: TreeConnectionsProps) => {
  const colors = THEME_COLORS[theme];

  // Helper to check if node is active or completed
  const isNodeActiveOrCompleted = (node?: PathNode) => 
    node?.status === 'active' || node?.status === 'completed';

  // Find the current active node
  const activeNode = useMemo(() => 
    nodes.find(n => n.status === 'active'),
    [nodes]
  );

  // Determine which connections are active based on node statuses
  // Stage 2 now has only LEFT and RIGHT branches (2 nodes)
  const connectionStatus = useMemo(() => {
    const stage2Left = nodes.find(n => n.stage === 2 && n.position === 'left-branch');
    const stage2Right = nodes.find(n => n.stage === 2 && n.position === 'right-branch');
    const stage3Left = nodes.find(n => n.stage === 3 && n.position === 'left-branch');
    const stage3Center = nodes.find(n => n.stage === 3 && n.position === 'center-branch');
    const stage3Right = nodes.find(n => n.stage === 3 && n.position === 'right-branch');
    const stage4Left = nodes.find(n => n.stage === 4 && n.position === 'left-branch');
    const stage4Center = nodes.find(n => n.stage === 4 && n.position === 'center-branch');
    const stage4Right = nodes.find(n => n.stage === 4 && n.position === 'right-branch');
    const stage5Left = nodes.find(n => n.stage === 5 && n.position === 'left-branch');
    const stage5Center = nodes.find(n => n.stage === 5 && n.position === 'center-branch');
    const stage5Right = nodes.find(n => n.stage === 5 && n.position === 'right-branch');
    const stage6Center = nodes.find(n => n.stage === 6 && n.position === 'center');
    
    return {
      // Hero to Stage 2 branches (now only 2 branches with curvy lines)
      heroToStage2Left: isNodeActiveOrCompleted(stage2Left),
      heroToStage2Right: isNodeActiveOrCompleted(stage2Right),
      // Stage 2 to Stage 3 - left has vertical, right has diagonal to center
      stage2LeftToStage3Left: isNodeActiveOrCompleted(stage3Left),
      stage2LeftToStage3Center: isNodeActiveOrCompleted(stage3Center) && isNodeActiveOrCompleted(stage2Left),
      stage2RightToStage3Center: isNodeActiveOrCompleted(stage3Center) && isNodeActiveOrCompleted(stage2Right),
      stage2RightToStage3Right: isNodeActiveOrCompleted(stage3Right),
      // Stage 3 to Stage 4 (vertical lines)
      stage3LeftToStage4Left: isNodeActiveOrCompleted(stage4Left),
      stage3CenterToStage4Center: isNodeActiveOrCompleted(stage4Center),
      stage3RightToStage4Right: isNodeActiveOrCompleted(stage4Right),
      // Stage 4 to Stage 5 (vertical lines)
      stage4LeftToStage5Left: isNodeActiveOrCompleted(stage5Left),
      stage4CenterToStage5Center: isNodeActiveOrCompleted(stage5Center),
      stage4RightToStage5Right: isNodeActiveOrCompleted(stage5Right),
      // Stage 5 to Stage 6 (converging lines to apex)
      stage5LeftToStage6Center: isNodeActiveOrCompleted(stage6Center) && isNodeActiveOrCompleted(stage5Left),
      stage5CenterToStage6Center: isNodeActiveOrCompleted(stage6Center) && isNodeActiveOrCompleted(stage5Center),
      stage5RightToStage6Center: isNodeActiveOrCompleted(stage6Center) && isNodeActiveOrCompleted(stage5Right),
    };
  }, [nodes]);

  // CONFIGURATION - Use percentages of viewBox for responsive positioning
  // ViewBox is 100x100 units for clean percentage-based calculations
  const VIEWBOX_WIDTH = 100;
  
  // Vertical positioning as percentages (accounting for responsive node gaps)
  // Shifted down by ~75% total for better alignment with nodes
  const HERO_Y = 12;
  const STAGE_2_TOP = 30;
  const STAGE_2_BOTTOM = 36;
  const STAGE_3_TOP = 47;
  const STAGE_3_BOTTOM = 53;
  const STAGE_4_TOP = 64;
  const STAGE_4_BOTTOM = 70;
  const STAGE_5_TOP = 81;
  const STAGE_5_BOTTOM = 87;
  const STAGE_6_TOP = 95;
  const STAGE_6_BOTTOM = 100;

  // X positions - percentage-based to match flex layout
  // Center for hero and apex nodes
  const centerX = VIEWBOX_WIDTH * 0.50; // 50%
  // Stage 2 uses justify-around (2 nodes) - positioned at ~28% and ~72%
  const stage2LeftX = VIEWBOX_WIDTH * 0.28;
  const stage2RightX = VIEWBOX_WIDTH * 0.72;
  // Stages 3-5 use justify-between (3 nodes) - adjusted: left 15%, right 85%
  const leftEdgeX = VIEWBOX_WIDTH * 0.15;
  const rightEdgeX = VIEWBOX_WIDTH * 0.85

  const pos = {
    hero: { x: centerX, y: HERO_Y }, 

    // Stage 2 - Now only 2 nodes (left and right) - justify-around
    stage2Left:  { x: stage2LeftX,  top: STAGE_2_TOP, bottom: STAGE_2_BOTTOM },
    stage2Right: { x: stage2RightX, top: STAGE_2_TOP, bottom: STAGE_2_BOTTOM },

    // Stage 3 - 3 nodes (left, center, right) - justify-between
    stage3Left:   { x: leftEdgeX,  top: STAGE_3_TOP, bottom: STAGE_3_BOTTOM }, 
    stage3Center: { x: centerX, top: STAGE_3_TOP, bottom: STAGE_3_BOTTOM },
    stage3Right:  { x: rightEdgeX, top: STAGE_3_TOP, bottom: STAGE_3_BOTTOM },

    // Stage 4 - 3 nodes - justify-between
    stage4Left:   { x: leftEdgeX,  top: STAGE_4_TOP, bottom: STAGE_4_BOTTOM },
    stage4Center: { x: centerX, top: STAGE_4_TOP, bottom: STAGE_4_BOTTOM },
    stage4Right:  { x: rightEdgeX, top: STAGE_4_TOP, bottom: STAGE_4_BOTTOM },

    // Stage 5 - 3 nodes - justify-between
    stage5Left:   { x: leftEdgeX,  top: STAGE_5_TOP, bottom: STAGE_5_BOTTOM },
    stage5Center: { x: centerX, top: STAGE_5_TOP, bottom: STAGE_5_BOTTOM },
    stage5Right:  { x: rightEdgeX, top: STAGE_5_TOP, bottom: STAGE_5_BOTTOM },

    // Stage 6 - Apex node (1 center node)
    stage6Center: { x: centerX, top: STAGE_6_TOP, bottom: STAGE_6_BOTTOM },
  };

  // Path definitions - beautiful curvy S-curves from hero to 2 stage 2 branches
  // Control point offsets scaled for 0-100 coordinate system
  const CURVE_OFFSET_H = 8; // Horizontal curve offset
  const CURVE_OFFSET_V = 4; // Vertical curve offset
  
  const paths = {
    // Hero to Stage 2 - Beautiful curvy paths (S-curves) for connection lines
    heroToLeft: `M ${pos.hero.x} ${pos.hero.y} 
      C ${pos.hero.x - CURVE_OFFSET_H} ${pos.hero.y + CURVE_OFFSET_V}, 
        ${pos.stage2Left.x + CURVE_OFFSET_H} ${pos.stage2Left.top - CURVE_OFFSET_V}, 
        ${pos.stage2Left.x} ${pos.stage2Left.top}`,
    heroToRight: `M ${pos.hero.x} ${pos.hero.y} 
      C ${pos.hero.x + CURVE_OFFSET_H} ${pos.hero.y + CURVE_OFFSET_V}, 
        ${pos.stage2Right.x - CURVE_OFFSET_H} ${pos.stage2Right.top - CURVE_OFFSET_V}, 
        ${pos.stage2Right.x} ${pos.stage2Right.top}`,

    // Stage 2 to Stage 3 - Left branch: curve to left node
    stage2LeftToStage3Left: `M ${pos.stage2Left.x} ${pos.stage2Left.bottom} 
      C ${pos.stage2Left.x} ${pos.stage2Left.bottom + CURVE_OFFSET_V},
        ${pos.stage3Left.x} ${pos.stage3Left.top - CURVE_OFFSET_V},
        ${pos.stage3Left.x} ${pos.stage3Left.top}`,
    
    // Stage 2 to Stage 3 - Left branch: diagonal curve to center node
    stage2LeftToStage3Center: `M ${pos.stage2Left.x} ${pos.stage2Left.bottom} 
      C ${pos.stage2Left.x + CURVE_OFFSET_H} ${pos.stage2Left.bottom + CURVE_OFFSET_V},
        ${pos.stage3Center.x - CURVE_OFFSET_H} ${pos.stage3Center.top - CURVE_OFFSET_V},
        ${pos.stage3Center.x} ${pos.stage3Center.top}`,
    
    // Stage 2 to Stage 3 - Right branch: diagonal curve to center node
    stage2RightToStage3Center: `M ${pos.stage2Right.x} ${pos.stage2Right.bottom} 
      C ${pos.stage2Right.x - CURVE_OFFSET_H} ${pos.stage2Right.bottom + CURVE_OFFSET_V},
        ${pos.stage3Center.x + CURVE_OFFSET_H} ${pos.stage3Center.top - CURVE_OFFSET_V},
        ${pos.stage3Center.x} ${pos.stage3Center.top}`,
    
    // Stage 2 to Stage 3 - Right branch: curve to right node  
    stage2RightToStage3Right: `M ${pos.stage2Right.x} ${pos.stage2Right.bottom} 
      C ${pos.stage2Right.x} ${pos.stage2Right.bottom + CURVE_OFFSET_V},
        ${pos.stage3Right.x} ${pos.stage3Right.top - CURVE_OFFSET_V},
        ${pos.stage3Right.x} ${pos.stage3Right.top}`,

    // Stage 3 to Stage 4 (vertical lines)
    stage3LeftToStage4Left: `M ${pos.stage3Left.x} ${pos.stage3Left.bottom} L ${pos.stage4Left.x} ${pos.stage4Left.top}`,
    stage3CenterToStage4Center: `M ${pos.stage3Center.x} ${pos.stage3Center.bottom} L ${pos.stage4Center.x} ${pos.stage4Center.top}`,
    stage3RightToStage4Right: `M ${pos.stage3Right.x} ${pos.stage3Right.bottom} L ${pos.stage4Right.x} ${pos.stage4Right.top}`,

    // Stage 4 to Stage 5 (vertical lines)
    stage4LeftToStage5Left: `M ${pos.stage4Left.x} ${pos.stage4Left.bottom} L ${pos.stage5Left.x} ${pos.stage5Left.top}`,
    stage4CenterToStage5Center: `M ${pos.stage4Center.x} ${pos.stage4Center.bottom} L ${pos.stage5Center.x} ${pos.stage5Center.top}`,
    stage4RightToStage5Right: `M ${pos.stage4Right.x} ${pos.stage4Right.bottom} L ${pos.stage5Right.x} ${pos.stage5Right.top}`,

    // Stage 5 to Stage 6 - Converging curves to apex
    stage5LeftToStage6Center: `M ${pos.stage5Left.x} ${pos.stage5Left.bottom} 
      C ${pos.stage5Left.x + CURVE_OFFSET_H} ${pos.stage5Left.bottom + CURVE_OFFSET_V},
        ${pos.stage6Center.x - CURVE_OFFSET_H * 1.2} ${pos.stage6Center.top - CURVE_OFFSET_V},
        ${pos.stage6Center.x} ${pos.stage6Center.top}`,
    stage5CenterToStage6Center: `M ${pos.stage5Center.x} ${pos.stage5Center.bottom} L ${pos.stage6Center.x} ${pos.stage6Center.top}`,
    stage5RightToStage6Center: `M ${pos.stage5Right.x} ${pos.stage5Right.bottom} 
      C ${pos.stage5Right.x - CURVE_OFFSET_H} ${pos.stage5Right.bottom + CURVE_OFFSET_V},
        ${pos.stage6Center.x + CURVE_OFFSET_H * 1.2} ${pos.stage6Center.top - CURVE_OFFSET_V},
        ${pos.stage6Center.x} ${pos.stage6Center.top}`,
  };

  // Build the full path(s) from hero to active node for globe animation
  // Returns an object with one or two paths for dual animation support
  const globePaths = useMemo((): GlobePathConfig => {
    if (!activeNode || activeNode.stage === 1) return null;
    
    const stage2Left = nodes.find(n => n.stage === 2 && n.position === 'left-branch');
    const stage2Right = nodes.find(n => n.stage === 2 && n.position === 'right-branch');
    const stage3Center = nodes.find(n => n.stage === 3 && n.position === 'center-branch');
    
    const branch = activeNode.position as NodePosition;
    const stage = activeNode.stage;
    
    // DUAL ANIMATION LOGIC:
    // Show dual animation when both Stage 2 are active/completed
    const bothStage2Completed = isNodeActiveOrCompleted(stage2Left) && isNodeActiveOrCompleted(stage2Right);
    const stage3CenterCompleted = isNodeActiveOrCompleted(stage3Center);
    
    // Check if we should show dual animation
    const shouldShowDual = bothStage2Completed && (
      (stage === 2) || // Both stage 2 active
      (stage === 3 && branch === 'center-branch') || // Stage 3 center active
      (stage >= 4 && branch === 'center-branch' && stage3CenterCompleted) // Stage 4+ center active
    );
    
    if (shouldShowDual) {
      // For stage 4+ center path, show dual to stage 3, then continue as single
      if (stage >= 4 && branch === 'center-branch' && stage3CenterCompleted) {
        // Dual paths that end at CENTER of stage 3 icon
        const stage3CenterY = (pos.stage3Center.top + pos.stage3Center.bottom) / 2;
        const leftPathToStage3 = `M ${pos.hero.x} ${pos.hero.y} 
          C ${pos.hero.x - CURVE_OFFSET_H} ${pos.hero.y + CURVE_OFFSET_V}, 
            ${pos.stage2Left.x + CURVE_OFFSET_H} ${pos.stage2Left.top - CURVE_OFFSET_V}, 
            ${pos.stage2Left.x} ${pos.stage2Left.top}
          L ${pos.stage2Left.x} ${pos.stage2Left.bottom}
          C ${pos.stage2Left.x + CURVE_OFFSET_H} ${pos.stage2Left.bottom + CURVE_OFFSET_V},
            ${pos.stage3Center.x - CURVE_OFFSET_H} ${pos.stage3Center.top - CURVE_OFFSET_V},
            ${pos.stage3Center.x} ${stage3CenterY}`;
        
        const rightPathToStage3 = `M ${pos.hero.x} ${pos.hero.y} 
          C ${pos.hero.x + CURVE_OFFSET_H} ${pos.hero.y + CURVE_OFFSET_V}, 
            ${pos.stage2Right.x - CURVE_OFFSET_H} ${pos.stage2Right.top - CURVE_OFFSET_V}, 
            ${pos.stage2Right.x} ${pos.stage2Right.top}
          L ${pos.stage2Right.x} ${pos.stage2Right.bottom}
          C ${pos.stage2Right.x - CURVE_OFFSET_H} ${pos.stage2Right.bottom + CURVE_OFFSET_V},
            ${pos.stage3Center.x + CURVE_OFFSET_H} ${pos.stage3Center.top - CURVE_OFFSET_V},
            ${pos.stage3Center.x} ${stage3CenterY}`;
        
        // Add the continuation from stage 3 to current stage (single path)
        let continuation = ` L ${pos.stage3Center.x} ${pos.stage3Center.bottom}`;
        if (stage >= 4) continuation += ` L ${pos.stage4Center.x} ${pos.stage4Center.top} L ${pos.stage4Center.x} ${pos.stage4Center.bottom}`;
        if (stage >= 5) continuation += ` L ${pos.stage5Center.x} ${pos.stage5Center.top} L ${pos.stage5Center.x} ${pos.stage5Center.bottom}`;
        if (stage >= 6) continuation += ` C ${pos.stage5Center.x} ${pos.stage5Center.bottom + CURVE_OFFSET_V}, ${pos.stage6Center.x} ${pos.stage6Center.top - CURVE_OFFSET_V}, ${pos.stage6Center.x} ${pos.stage6Center.top}`;
        
        return { dual: true, leftPath: leftPathToStage3 + continuation, rightPath: rightPathToStage3 + continuation };
      }
      
      // For stage 2 only - stop at stage 2 nodes
      if (stage === 2) {
        const leftPath = `M ${pos.hero.x} ${pos.hero.y} 
          C ${pos.hero.x - CURVE_OFFSET_H} ${pos.hero.y + CURVE_OFFSET_V}, 
            ${pos.stage2Left.x + CURVE_OFFSET_H} ${pos.stage2Left.top - CURVE_OFFSET_V}, 
            ${pos.stage2Left.x} ${pos.stage2Left.top}`;
        
        const rightPath = `M ${pos.hero.x} ${pos.hero.y} 
          C ${pos.hero.x + CURVE_OFFSET_H} ${pos.hero.y + CURVE_OFFSET_V}, 
            ${pos.stage2Right.x - CURVE_OFFSET_H} ${pos.stage2Right.top - CURVE_OFFSET_V}, 
            ${pos.stage2Right.x} ${pos.stage2Right.top}`;
        
        return { dual: true, leftPath, rightPath };
      }
      
      // For stage 3 center - stop at center of stage 3 icon
      if (stage === 3 && branch === 'center-branch') {
        const stage3CenterY = (pos.stage3Center.top + pos.stage3Center.bottom) / 2;
        const leftPath = `M ${pos.hero.x} ${pos.hero.y} 
          C ${pos.hero.x - CURVE_OFFSET_H} ${pos.hero.y + CURVE_OFFSET_V}, 
            ${pos.stage2Left.x + CURVE_OFFSET_H} ${pos.stage2Left.top - CURVE_OFFSET_V}, 
            ${pos.stage2Left.x} ${pos.stage2Left.top}
          L ${pos.stage2Left.x} ${pos.stage2Left.bottom}
          C ${pos.stage2Left.x + CURVE_OFFSET_H} ${pos.stage2Left.bottom + CURVE_OFFSET_V},
            ${pos.stage3Center.x - CURVE_OFFSET_H} ${pos.stage3Center.top - CURVE_OFFSET_V},
            ${pos.stage3Center.x} ${stage3CenterY}`;
        
        const rightPath = `M ${pos.hero.x} ${pos.hero.y} 
          C ${pos.hero.x + CURVE_OFFSET_H} ${pos.hero.y + CURVE_OFFSET_V}, 
            ${pos.stage2Right.x - CURVE_OFFSET_H} ${pos.stage2Right.top - CURVE_OFFSET_V}, 
            ${pos.stage2Right.x} ${pos.stage2Right.top}
          L ${pos.stage2Right.x} ${pos.stage2Right.bottom}
          C ${pos.stage2Right.x - CURVE_OFFSET_H} ${pos.stage2Right.bottom + CURVE_OFFSET_V},
            ${pos.stage3Center.x + CURVE_OFFSET_H} ${pos.stage3Center.top - CURVE_OFFSET_V},
            ${pos.stage3Center.x} ${stage3CenterY}`;
        
        return { dual: true, leftPath, rightPath };
      }
    }
    
    // SINGLE PATH ANIMATION - Build using exact connection line paths
    let pathSegments: string[] = [];
    
    // Stage 2 - Single path to stage 2 node
    if (stage === 2) {
      if (branch === 'left-branch') {
        pathSegments.push(paths.heroToLeft);
      } else if (branch === 'right-branch') {
        pathSegments.push(paths.heroToRight);
      }
    } else if (stage === 6) {
      // Stage 6 apex - find the completed Stage 5 node to determine the path
      const stage5Left = nodes.find(n => n.stage === 5 && n.position === 'left-branch');
      const stage5Center = nodes.find(n => n.stage === 5 && n.position === 'center-branch');
      const stage5Right = nodes.find(n => n.stage === 5 && n.position === 'right-branch');
      
      if (isNodeActiveOrCompleted(stage5Center)) {
        // Came from center path
        const stage2Left = nodes.find(n => n.stage === 2 && n.position === 'left-branch');
        if (stage2Left && isNodeActiveOrCompleted(stage2Left)) {
          pathSegments.push(paths.heroToLeft);
          pathSegments.push(paths.stage2LeftToStage3Center);
        } else {
          pathSegments.push(paths.heroToRight);
          pathSegments.push(paths.stage2RightToStage3Center);
        }
        pathSegments.push(paths.stage3CenterToStage4Center);
        pathSegments.push(paths.stage4CenterToStage5Center);
        pathSegments.push(paths.stage5CenterToStage6Center);
      } else if (isNodeActiveOrCompleted(stage5Left)) {
        pathSegments.push(paths.heroToLeft);
        pathSegments.push(paths.stage2LeftToStage3Left);
        pathSegments.push(paths.stage3LeftToStage4Left);
        pathSegments.push(paths.stage4LeftToStage5Left);
        pathSegments.push(paths.stage5LeftToStage6Center);
      } else if (isNodeActiveOrCompleted(stage5Right)) {
        pathSegments.push(paths.heroToRight);
        pathSegments.push(paths.stage2RightToStage3Right);
        pathSegments.push(paths.stage3RightToStage4Right);
        pathSegments.push(paths.stage4RightToStage5Right);
        pathSegments.push(paths.stage5RightToStage6Center);
      }
    } else if (branch === 'left-branch') {
      // Left branch path
      pathSegments.push(paths.heroToLeft);
      if (stage >= 3) pathSegments.push(paths.stage2LeftToStage3Left);
      if (stage >= 4) pathSegments.push(paths.stage3LeftToStage4Left);
      if (stage >= 5) pathSegments.push(paths.stage4LeftToStage5Left);
    } else if (branch === 'center-branch') {
      // This shouldn't happen since dual animation handles stage 3+ center
      // But fallback for safety
      const stage2Left = nodes.find(n => n.stage === 2 && n.position === 'left-branch');
      
      if (isNodeActiveOrCompleted(stage2Left)) {
        pathSegments.push(paths.heroToLeft);
        if (stage >= 3) pathSegments.push(paths.stage2LeftToStage3Center);
      } else {
        pathSegments.push(paths.heroToRight);
        if (stage >= 3) pathSegments.push(paths.stage2RightToStage3Center);
      }
      if (stage >= 4) pathSegments.push(paths.stage3CenterToStage4Center);
      if (stage >= 5) pathSegments.push(paths.stage4CenterToStage5Center);
    } else if (branch === 'right-branch') {
      // Right branch path
      pathSegments.push(paths.heroToRight);
      if (stage >= 3) pathSegments.push(paths.stage2RightToStage3Right);
      if (stage >= 4) pathSegments.push(paths.stage3RightToStage4Right);
      if (stage >= 5) pathSegments.push(paths.stage4RightToStage5Right);
    }
    
    // Combine segments into one continuous path
    if (pathSegments.length === 0) return null;
    
    // Extract just the coordinates from each segment and combine
    let fullPath = pathSegments[0];
    for (let i = 1; i < pathSegments.length; i++) {
      // Remove the 'M x y' from subsequent segments and just add continuation
      const segment = pathSegments[i];
      const withoutMove = segment.replace(/^M\s*[\d.]+\s*[\d.]+\s*/, '');
      fullPath += ' ' + withoutMove;
    }
    
    return { dual: false, path: fullPath };
  }, [activeNode, paths, nodes]);

  // Helper to check which connections to render for stage 2 to stage 3
  const getStage2ToStage3Connections = () => {
    const stage2Left = nodes.find(n => n.stage === 2 && n.position === 'left-branch');
    const stage2Right = nodes.find(n => n.stage === 2 && n.position === 'right-branch');
    const isLeftActive = isNodeActiveOrCompleted(stage2Left);
    const isRightActive = isNodeActiveOrCompleted(stage2Right);
    
    return {
      showLeftToLeft: true, // Always show
      showLeftToCenter: isLeftActive, // Only show if left branch is active
      showRightToCenter: isRightActive, // Only show if right branch is active
      showRightToRight: true, // Always show
    };
  };

  const stage2To3Visibility = getStage2ToStage3Connections();

  return (
    <svg
      viewBox="0 0 100 100"
      className="absolute inset-0 w-full h-full pointer-events-none"
      preserveAspectRatio="none"
      style={{ zIndex: 0 }}
    >
      <defs>
        <filter id={`connection-glow-${theme}`}>
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Radial glow filter for sphere - extended bounds to prevent clipping */}
        <filter id={`globe-glow-${theme}`} x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur1" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur2" />
          <feMerge>
            <feMergeNode in="blur2" />
            <feMergeNode in="blur1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Radial gradient for sphere center brightness */}
        <radialGradient id={`sphere-gradient-${theme}`}>
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="40%" stopColor={colors.primary} stopOpacity="1" />
          <stop offset="100%" stopColor={colors.primary} stopOpacity="0.6" />
        </radialGradient>
      </defs>

      {/* Hero to Stage 2 - Left Branch (curvy) */}
      <g opacity={connectionStatus.heroToStage2Left ? 1 : 0.4}>
        <ConnectionLine
          path={paths.heroToLeft}
          isActive={connectionStatus.heroToStage2Left}
          colors={colors}
          theme={theme}
          delay={0}
        />
      </g>

      {/* Hero to Stage 2 - Right Branch (curvy) */}
      <g opacity={connectionStatus.heroToStage2Right ? 1 : 0.4}>
        <ConnectionLine
          path={paths.heroToRight}
          isActive={connectionStatus.heroToStage2Right}
          colors={colors}
          theme={theme}
          delay={0.05}
        />
      </g>

      {/* Stage 2 Left to Stage 3 Left (vertical) */}
      {stage2To3Visibility.showLeftToLeft && (
        <g opacity={connectionStatus.stage2LeftToStage3Left ? 1 : 0.4}>
          <ConnectionLine
            path={paths.stage2LeftToStage3Left}
            isActive={connectionStatus.stage2LeftToStage3Left}
            colors={colors}
            theme={theme}
            delay={0.15}
          />
        </g>
      )}

      {/* Stage 2 Left to Stage 3 Center (diagonal) */}
      {stage2To3Visibility.showLeftToCenter && (
        <g opacity={connectionStatus.stage2LeftToStage3Center ? 1 : 0.4}>
          <ConnectionLine
            path={paths.stage2LeftToStage3Center}
            isActive={connectionStatus.stage2LeftToStage3Center}
            colors={colors}
            theme={theme}
            delay={0.15}
          />
        </g>
      )}

      {/* Stage 2 Right to Stage 3 Center (diagonal) */}
      {stage2To3Visibility.showRightToCenter && (
        <g opacity={connectionStatus.stage2RightToStage3Center ? 1 : 0.4}>
          <ConnectionLine
            path={paths.stage2RightToStage3Center}
            isActive={connectionStatus.stage2RightToStage3Center}
            colors={colors}
            theme={theme}
            delay={0.15}
          />
        </g>
      )}

      {/* Stage 2 Right to Stage 3 Right (vertical) */}
      {stage2To3Visibility.showRightToRight && (
        <g opacity={connectionStatus.stage2RightToStage3Right ? 1 : 0.4}>
          <ConnectionLine
            path={paths.stage2RightToStage3Right}
            isActive={connectionStatus.stage2RightToStage3Right}
            colors={colors}
            theme={theme}
            delay={0.15}
          />
        </g>
      )}

      {/* Stage 3 to Stage 4 - Left (vertical) */}
      <g opacity={connectionStatus.stage3LeftToStage4Left ? 1 : 0.4}>
        <ConnectionLine
          path={paths.stage3LeftToStage4Left}
          isActive={connectionStatus.stage3LeftToStage4Left}
          colors={colors}
          theme={theme}
          delay={0.3}
        />
      </g>

      {/* Stage 3 to Stage 4 - Center (vertical) */}
      <g opacity={connectionStatus.stage3CenterToStage4Center ? 1 : 0.4}>
        <ConnectionLine
          path={paths.stage3CenterToStage4Center}
          isActive={connectionStatus.stage3CenterToStage4Center}
          colors={colors}
          theme={theme}
          delay={0.3}
        />
      </g>

      {/* Stage 3 to Stage 4 - Right (vertical) */}
      <g opacity={connectionStatus.stage3RightToStage4Right ? 1 : 0.4}>
        <ConnectionLine
          path={paths.stage3RightToStage4Right}
          isActive={connectionStatus.stage3RightToStage4Right}
          colors={colors}
          theme={theme}
          delay={0.3}
        />
      </g>

      {/* Stage 4 to Stage 5 - Left (vertical) */}
      <g opacity={connectionStatus.stage4LeftToStage5Left ? 1 : 0.4}>
        <ConnectionLine
          path={paths.stage4LeftToStage5Left}
          isActive={connectionStatus.stage4LeftToStage5Left}
          colors={colors}
          theme={theme}
          delay={0.4}
        />
      </g>

      {/* Stage 4 to Stage 5 - Center (vertical) */}
      <g opacity={connectionStatus.stage4CenterToStage5Center ? 1 : 0.4}>
        <ConnectionLine
          path={paths.stage4CenterToStage5Center}
          isActive={connectionStatus.stage4CenterToStage5Center}
          colors={colors}
          theme={theme}
          delay={0.4}
        />
      </g>

      {/* Stage 4 to Stage 5 - Right (vertical) */}
      <g opacity={connectionStatus.stage4RightToStage5Right ? 1 : 0.4}>
        <ConnectionLine
          path={paths.stage4RightToStage5Right}
          isActive={connectionStatus.stage4RightToStage5Right}
          colors={colors}
          theme={theme}
          delay={0.4}
        />
      </g>

      {/* Stage 5 to Stage 6 - Left (converging curve) */}
      <g opacity={connectionStatus.stage5LeftToStage6Center ? 1 : 0.4}>
        <ConnectionLine
          path={paths.stage5LeftToStage6Center}
          isActive={connectionStatus.stage5LeftToStage6Center}
          colors={colors}
          theme={theme}
          delay={0.5}
        />
      </g>

      {/* Stage 5 to Stage 6 - Center (vertical) */}
      <g opacity={connectionStatus.stage5CenterToStage6Center ? 1 : 0.4}>
        <ConnectionLine
          path={paths.stage5CenterToStage6Center}
          isActive={connectionStatus.stage5CenterToStage6Center}
          colors={colors}
          theme={theme}
          delay={0.5}
        />
      </g>

      {/* Stage 5 to Stage 6 - Right (converging curve) */}
      <g opacity={connectionStatus.stage5RightToStage6Center ? 1 : 0.4}>
        <ConnectionLine
          path={paths.stage5RightToStage6Center}
          isActive={connectionStatus.stage5RightToStage6Center}
          colors={colors}
          theme={theme}
          delay={0.5}
        />
      </g>

      {/* Globe animation - travels from hero to active node */}
      {/* Support both single and dual (convergence) animations */}
      {globePaths && activeNode && activeNode.stage > 1 && (
        <>
          {globePaths.dual ? (
            // Dual convergence animation - two blobs traveling simultaneously
            <>
              <GlobeAnimation
                fullPath={globePaths.leftPath}
                colors={colors}
                theme={theme}
              />
              <GlobeAnimation
                fullPath={globePaths.rightPath}
                colors={colors}
                theme={theme}
              />
            </>
          ) : (
            // Single path animation
            <GlobeAnimation
              fullPath={globePaths.path}
              colors={colors}
              theme={theme}
            />
          )}
        </>
      )}
    </svg>
  );
});

TreeConnections.displayName = 'TreeConnections';
