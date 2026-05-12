'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, LayoutDashboard, UserPlus, ShoppingCart,
  Wallet, Landmark, Crosshair, MapPin, Users, Trophy, BookOpen, LogOut,
  Dices, CreditCard, Shield, ArrowLeftRight, Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/lib/game-store';
import { NAV_ITEMS } from '@/lib/game-constants';
import { formatCash } from '@/lib/format';
import GameHUD from './GameHUD';
import DashboardScreen from './screens/DashboardScreen';
import HireScreen from './screens/HireScreen';
import BlackMarketScreen from './screens/BlackMarketScreen';
import CollectScreen from './screens/CollectScreen';
import BankScreen from './screens/BankScreen';
import AttackScreen from './screens/AttackScreen';
import TravelScreen from './screens/TravelScreen';
import FamilyScreen from './screens/FamilyScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import GuideScreen from './screens/GuideScreen';
import AdminScreen from './screens/AdminScreen';
import GamblingScreen from './screens/GamblingScreen';
import CreditsScreen from './screens/CreditsScreen';
import UnionScreen from './screens/UnionScreen';
import TransfersScreen from './screens/TransfersScreen';

const ICON_MAP: Record<string, any> = {
  LayoutDashboard, UserPlus, ShoppingCart,
  Wallet, Landmark, Crosshair, MapPin, Users, Trophy, BookOpen,
  Dices, CreditCard, Shield, ArrowLeftRight, Settings,
};

const SCREEN_MAP: Record<string, React.ComponentType> = {
  dashboard: DashboardScreen,
  hire: HireScreen,
  blackmarket: BlackMarketScreen,
  collect: CollectScreen,
  bank: BankScreen,
  attack: AttackScreen,
  travel: TravelScreen,
  family: FamilyScreen,
  gambling: GamblingScreen,
  credits: CreditsScreen,
  unions: UnionScreen,
  transfers: TransfersScreen,
  leaderboard: LeaderboardScreen,
  guide: GuideScreen,
  admin: AdminScreen,
};

export default function GameLayout() {
  const { player, currentScreen, setCurrentScreen, sidebarOpen, setSidebarOpen, setLoggedOut, addToast, refreshPlayer } = useGameStore();
  const [turnsRegenTimer, setTurnsRegenTimer] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => refreshPlayer(), 30000);
    return () => clearInterval(interval);
  }, [refreshPlayer]);

  useEffect(() => {
    const interval = setInterval(() => setTurnsRegenTimer(t => (t + 1) % 600), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setLoggedOut();
    addToast('Logged out successfully', 'info');
  };

  // Filter nav items: admin only shows for admins
  const filteredNavItems = NAV_ITEMS.filter(item => {
    if (item.id === 'admin') return player?.isAdmin;
    return true;
  });

  const ActiveScreen = SCREEN_MAP[currentScreen] || DashboardScreen;

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0f]">
      <GameHUD />

      <div className="flex flex-1">
        <Button
          variant="ghost" size="icon"
          className="fixed bottom-4 left-4 z-50 flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.08] bg-[#0f0f18]/95 text-zinc-400 shadow-lg backdrop-blur-md hover:text-white lg:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                onClick={() => setSidebarOpen(false)} />
              <motion.aside
                initial={{ x: -280, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -280, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed bottom-0 left-0 top-[52px] z-50 w-64 overflow-y-auto border-r border-white/[0.06] bg-[#0a0a0f]/95 backdrop-blur-xl lg:hidden"
              >
                <SidebarContent navItems={filteredNavItems} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <aside className="hidden lg:sticky lg:top-[52px] lg:block lg:h-[calc(100vh-52px)] lg:w-56 lg:shrink-0 lg:overflow-y-auto lg:border-r lg:border-white/[0.06] lg:bg-[#0a0a0f]/60 lg:backdrop-blur-md">
          <SidebarContent navItems={filteredNavItems} />
        </aside>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mx-auto max-w-5xl">
            <ActiveScreen />
          </div>
        </main>
      </div>

      <div className="fixed right-4 bottom-4 z-[60] flex flex-col gap-2">
        <AnimatePresence>
          {useGameStore.getState().toasts.map((toast) => (
            <motion.div key={toast.id} initial={{ opacity: 0, x: 50, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 50, scale: 0.95 }}
              className={`rounded-lg border px-4 py-2.5 text-sm font-medium shadow-lg backdrop-blur-md ${
                toast.type === 'success' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' :
                toast.type === 'error' ? 'border-red-500/20 bg-red-500/10 text-red-400' :
                'border-white/10 bg-white/5 text-zinc-300'
              }`}>
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SidebarContent({ navItems }: { navItems: readonly { id: string; label: string; icon: string }[] }) {
  const { currentScreen, setCurrentScreen, setSidebarOpen } = useGameStore();

  return (
    <div className="flex h-full flex-col p-3">
      <nav className="flex-1 space-y-0.5">
        {navItems.map((item) => {
          const Icon = ICON_MAP[item.icon] || LayoutDashboard;
          const isActive = currentScreen === item.id;
          return (
            <button key={item.id} onClick={() => { setCurrentScreen(item.id as any); setSidebarOpen(false); }}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-all duration-200 ${
                isActive ? 'bg-[#d4af37]/10 text-[#d4af37]' : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'
              }`}>
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.8} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="border-t border-white/[0.06] pt-3">
        <button onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); useGameStore.getState().setLoggedOut(); }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-red-400">
          <LogOut className="h-4 w-4" strokeWidth={1.8} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
