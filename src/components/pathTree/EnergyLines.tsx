import { memo } from 'react';
import { motion } from 'framer-motion';
import type { PathNode, PathTheme } from '@/constants/pathTreeData';
import { THEME_COLORS } from '@/constants/pathTreeData';

interface EnergyLinesProps {
  nodes: PathNode[];
  theme: PathTheme;
}

export const EnergyLines = memo(({ nodes, theme }: EnergyLinesProps) => {
  const colors = THEME_COLORS[theme];

  // Group nodes by stage
  const nodesByStage: Record<number, PathNode[]> = {};
  nodes.forEach((node) => {
    if (!nodesByStage[node.stage]) {
      nodesByStage[node.stage] = [];
    }
    nodesByStage[node.stage].push(node);
  });

  const stages = Object.keys(nodesByStage)
    .map(Number)
    .sort((a, b) => a - b);

  // Calculate vertical positions
  const getYPosition = (stage: number) => {
    const stageIndex = stages.indexOf(stage);
    return 100 + stageIndex * 250; // 250px between stages
  };

  const getXPosition = (position: PathNode['position']) => {
    switch (position) {
      case 'left-branch':
        return 150;
      case 'center':
        return 400;
      case 'right-branch':
        return 650;
      default:
        return 400;
    }
  };

  // Generate connection lines
  const connections: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];

  stages.forEach((stage, index) => {
    if (index === stages.length - 1) return; // Skip last stage

    const currentStageNodes = nodesByStage[stage];
    const nextStageNodes = nodesByStage[stages[index + 1]];

    currentStageNodes.forEach((currentNode) => {
      const x1 = getXPosition(currentNode.position);
      const y1 = getYPosition(stage);

      // Connect to all nodes in next stage
      nextStageNodes.forEach((nextNode) => {
        const x2 = getXPosition(nextNode.position);
        const y2 = getYPosition(stages[index + 1]);

        connections.push({ x1, y1, x2, y2 });
      });
    });
  });

  return (
    <svg
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0, overflow: 'visible' }}
    >
      <defs>
        <filter id={`energy-glow-${theme}`}>
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {connections.map((connection, index) => {
        const pathLength = Math.sqrt(
          Math.pow(connection.x2 - connection.x1, 2) + Math.pow(connection.y2 - connection.y1, 2)
        );

        return (
          <g key={index}>
            {/* Background glow line */}
            <line
              x1={connection.x1}
              y1={connection.y1}
              x2={connection.x2}
              y2={connection.y2}
              stroke={colors.primary}
              strokeWidth="4"
              opacity="0.2"
              filter={`url(#energy-glow-${theme})`}
            />

            {/* Main energy line */}
            <motion.line
              x1={connection.x1}
              y1={connection.y1}
              x2={connection.x2}
              y2={connection.y2}
              stroke={colors.primary}
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={`${pathLength} ${pathLength}`}
              initial={{ strokeDashoffset: pathLength }}
              animate={{ strokeDashoffset: [pathLength, 0, pathLength] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
                delay: index * 0.1,
              }}
              opacity="0.6"
              style={{
                filter: `drop-shadow(0 0 6px ${colors.glow})`,
              }}
            />
          </g>
        );
      })}
    </svg>
  );
});

EnergyLines.displayName = 'EnergyLines';
