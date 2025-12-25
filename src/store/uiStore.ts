import { create } from 'zustand';

interface UIState {
  showHeader: boolean;
  showNavMenu: boolean;
  
  setHeaderVisibility: (visible: boolean) => void;
  setNavMenuVisibility: (visible: boolean) => void;
  setUIVisibility: (visible: boolean) => void;
  resetUI: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  showHeader: true,
  showNavMenu: true,
  
  setHeaderVisibility: (visible) => set({ showHeader: visible }),
  setNavMenuVisibility: (visible) => set({ showNavMenu: visible }),
  setUIVisibility: (visible) => set({ showHeader: visible, showNavMenu: visible }),
  resetUI: () => set({ showHeader: true, showNavMenu: true }),
}));
