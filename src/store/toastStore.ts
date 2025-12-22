import { create } from 'zustand';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning' | 'acquisition';
  duration?: number;
  itemName?: string; // For acquisition toasts
  price?: number; // For acquisition toasts
}

interface ToastState {
  toasts: Toast[];
  showToast: (message: string, type: Toast['type'], duration?: number) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  showToast: (message, type, duration = 4000) => {
    const id = Date.now().toString();
    const toast: Toast = { id, message, type, duration };

    set((state) => ({
      toasts: [...state.toasts, toast],
    }));

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },

  clearAll: () => {
    set({ toasts: [] });
  },
}));

// Helper functions for easier usage
export const toast = {
  success: (message: string, duration?: number) => 
    useToastStore.getState().showToast(message, 'success', duration),
  error: (message: string, duration?: number) => 
    useToastStore.getState().showToast(message, 'error', duration),
  info: (message: string, duration?: number) => 
    useToastStore.getState().showToast(message, 'info', duration),
  warning: (message: string, duration?: number) => 
    useToastStore.getState().showToast(message, 'warning', duration),
  acquisition: (itemName: string, price: number, duration = 4000) => {
    const id = Date.now().toString();
    const toast: Toast = { 
      id, 
      message: 'ACQUIRED!', 
      type: 'acquisition', 
      duration,
      itemName,
      price
    };
    useToastStore.setState((state) => ({
      toasts: [...state.toasts, toast],
    }));
  },
};
