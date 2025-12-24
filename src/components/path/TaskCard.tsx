import { memo } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Info, ArrowBigUp } from 'lucide-react';
import { GiSwordSmithing } from 'react-icons/gi';

interface TaskCardProps {
  id: string;
  title: string;
  isCompleted: boolean;
  isExpanded?: boolean;
  hasExpand?: boolean;
  hasInfo?: boolean;
  description?: string;
  onToggleComplete: (id: string, e: React.MouseEvent) => void;
  onToggleExpansion?: (id: string, e: React.MouseEvent) => void;
  onInfoClick?: (id: string, e: React.MouseEvent) => void;
  showBodyGrowth?: boolean;
  isGateCapped?: boolean; // When true, dim the body stat indicator
  className?: string;
}

export const TaskCard = memo(({
  id,
  title,
  isCompleted,
  isExpanded = false,
  hasExpand = true,
  hasInfo = false,
  onToggleComplete,
  onToggleExpansion,
  onInfoClick,
  showBodyGrowth = false,
  isGateCapped = false,
  className = '',
}: TaskCardProps) => {
  return (
    <motion.div
      initial={false}
      animate={{
        backgroundColor: isCompleted 
          ? 'rgba(88, 28, 135, 0.2)' 
          : 'rgba(0, 0, 0, 0)',
        borderColor: isCompleted 
          ? 'rgba(192, 132, 252, 0.5)' 
          : 'rgba(192, 132, 252, 0)',
        boxShadow: isCompleted
          ? '0 0 15px rgba(192, 132, 252, 0.5)'
          : '0 0 0px rgba(192, 132, 252, 0)',
      }}
      transition={{
        duration: 0.3,
        ease: 'easeOut',
      }}
      className={`flex items-center justify-between p-3 rounded-lg border ${
        !isCompleted ? 'hover:bg-slate-800/30' : ''
      } ${className}`}
      whileTap={{ scale: 0.98 }}
    >
      {/* Left Side - Completion Trigger */}
      <div 
        className="flex items-center gap-3 flex-1 cursor-pointer"
        onClick={(e) => onToggleComplete(id, e)}
      >
        {/* Icon */}
        <div className="flex-shrink-0">
          {isCompleted ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-5 h-5 rounded-full bg-purple-500/30 flex items-center justify-center"
              style={{ 
                boxShadow: '0 0 4px rgba(168, 85, 247, 0.4)' 
              }}
            >
              <span className="text-purple-300 text-sm font-bold">✓</span>
            </motion.div>
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-slate-600" />
          )}
        </div>

        {/* Title */}
        <p 
          className={`text-sm font-medium transition-all ${
            isCompleted 
              ? 'text-slate-400 line-through' 
              : 'text-white'
          }`}
        >
          {title}
        </p>
      </div>

      {/* Right Side - Body Stat Indicator, Info, and Expansion Triggers */}
      <div className="flex items-center">
        {/* Body Stat Growth Indicator - Shows as animation when earned, dim when capped */}
        {showBodyGrowth && !isGateCapped && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 4 }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0.85, 1, 1.02, 0.9],
              y: [4, 0, 0, -2],
            }}
            transition={{ duration: 1.2, times: [0, 0.15, 0.8, 1] }}
            className="flex items-center gap-1 pr-2"
            aria-label="Body increased"
          >
            <GiSwordSmithing className="w-4 h-4 text-amber-400" />
            <motion.div
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 0.6, repeat: 1, ease: 'easeInOut' }}
            >
              <ArrowBigUp className="w-4 h-4 text-amber-400" />
            </motion.div>
          </motion.div>
        )}

        {/* Dimmed Body Stat Indicator - Gate is capped */}
        {isGateCapped && (
          <div 
            className="flex items-center gap-1 pr-2 opacity-30"
            aria-label="Gate stat capped"
            title="Gate stat limit reached"
          >
            <GiSwordSmithing className="w-4 h-4 text-slate-500" />
            <ArrowBigUp className="w-4 h-4 text-slate-500" />
          </div>
        )}

        {/* Info Button (for subtasks) */}
        {hasInfo && (
          <>
            {/* Vertical Divider */}
            <div className="w-px h-6 bg-slate-500/80 mx-2" />
            
            {/* Info Button */}
            <motion.button
              onClick={(e) => onInfoClick?.(id, e)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`flex-shrink-0 p-2 rounded transition-colors ${
                isCompleted ? 'text-slate-600' : 'text-slate-400 hover:text-purple-400'
              }`}
            >
              <Info className="w-4 h-4" />
            </motion.button>
          </>
        )}
        
        {/* Expand Button (for main tasks) */}
        {hasExpand && (
          <>
            {/* Vertical Divider */}
            <div className="w-px h-6 bg-slate-500/80 mx-2" />
            
            {/* Expand Button Area - larger clickable zone */}
            <motion.button
              onClick={(e) => onToggleExpansion?.(id, e)}
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className={`flex-shrink-0 p-2 pl-4 rounded transition-colors ${
                isCompleted ? 'text-slate-600' : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.button>
          </>
        )}
      </div>
    </motion.div>
  );
});

TaskCard.displayName = 'TaskCard';

export default TaskCard;
