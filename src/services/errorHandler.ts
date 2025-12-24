/**
 * Error Handler - Centralized error handling
 */

import { logger } from '@/utils/logger';

export const handleError = (error: unknown, context: string) => {
  const message = error instanceof Error ? error.message : String(error);
  logger.error(`[${context}]`, { error: message });
};
