/**
 * Centralized type exports for the Identity Cultivator app.
 */

export * from './database';
export * from './identity';

import type { ReactNode } from 'react';

export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children?: ReactNode;
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastData {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}
