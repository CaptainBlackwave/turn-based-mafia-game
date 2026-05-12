import { create } from 'zustand';
import type { ScreenId } from './game-constants';

export interface GamePlayer {
  id: string;
  username: string;
  cash: number;
  bank: number;
  turns: number;
  maxTurns: number;
  reserves: number;
  credits: number;
  operatives: number;
  soldiers: number;
  food: number;
  weapons: number;
  cars: number;
  planes: number;
  city: string;
  familyId: string | null;
  familyName?: string | null;
  unionId: string | null;
  subscriptionTier: string;
  isAdmin: boolean;
  isBot: boolean;
  protectedUntil: string | null;
  networth: number;
  opHappiness: number;
  soldierHappiness: number;
}

interface GameStore {
  isLoggedIn: boolean;
  token: string | null;
  player: GamePlayer | null;
  currentScreen: ScreenId;
  sidebarOpen: boolean;
  isLoading: boolean;
  error: string | null;
  toasts: Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>;

  setLoggedIn: (token: string, player: GamePlayer) => void;
  setLoggedOut: () => void;
  setPlayer: (player: GamePlayer) => void;
  setCurrentScreen: (screen: ScreenId) => void;
  setSidebarOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  refreshPlayer: () => Promise<void>;
}

export const useGameStore = create<GameStore>((set, get) => ({
  isLoggedIn: false,
  token: null,
  player: null,
  currentScreen: 'dashboard',
  sidebarOpen: false,
  isLoading: false,
  error: null,
  toasts: [],

  setLoggedIn: (token, player) => set({ isLoggedIn: true, token, player, error: null }),
  setLoggedOut: () => set({ isLoggedIn: false, token: null, player: null, currentScreen: 'dashboard' }),
  setPlayer: (player) => set({ player }),
  setCurrentScreen: (screen) => set({ currentScreen: screen, sidebarOpen: false }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  addToast: (message, type = 'info') => {
    const id = Math.random().toString(36).slice(2);
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => get().removeToast(id), 4000);
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) })),
  refreshPlayer: async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) return;
      const data = await res.json();
      if (data.player) {
        set({ player: data.player });
      }
    } catch {
      // Silently fail
    }
  },
}));
