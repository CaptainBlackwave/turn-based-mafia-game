'use client';

import React from 'react';
import { DollarSign, Zap, TrendingUp, Heart, MapPin, LogOut, RefreshCw, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/lib/game-store';
import { formatCash } from '@/lib/format';

export default function GameHUD() {
  const { player, addToast, setLoggedOut, refreshPlayer } = useGameStore();

  if (!player) return null;

  const opColor = player.opHappiness >= 70 ? 'text-emerald-400' : player.opHappiness >= 40 ? 'text-amber-400' : 'text-red-400';
  const soldierColor = player.soldierHappiness >= 70 ? 'text-emerald-400' : player.soldierHappiness >= 40 ? 'text-amber-400' : 'text-red-400';

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setLoggedOut();
  };

  return (
    <header className="sticky top-0 z-30 flex h-[52px] items-center justify-between border-b border-white/[0.06] bg-[#0a0a0f]/90 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d4af37]/10 ring-1 ring-[#d4af37]/20">
            <span className="text-sm font-black text-[#d4af37]">M</span>
          </div>
          <span className="hidden text-sm font-bold text-white sm:block">Mafia Boss</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3 overflow-x-auto">
        <StatChip icon={<DollarSign className="h-3.5 w-3.5" />} value={formatCash(player.cash)} color="text-emerald-400" />
        <StatChip icon={<Zap className="h-3.5 w-3.5" />} value={String(player.turns)} color="text-amber-400" />
        <StatChip icon={<CreditCard className="h-3.5 w-3.5" />} value={String(player.credits)} color="text-cyan-400" smOnly />
        <StatChip icon={<TrendingUp className="h-3.5 w-3.5" />} value={formatCash(player.networth)} color="text-[#d4af37]" />
        <div className="hidden items-center gap-1 sm:flex">
          <span className={`text-xs font-bold ${opColor}`}>{player.opHappiness}%</span>
          <span className="text-[10px] text-zinc-600">OP</span>
          <span className="mx-0.5 text-zinc-700">|</span>
          <span className={`text-xs font-bold ${soldierColor}`}>{player.soldierHappiness}%</span>
          <span className="text-[10px] text-zinc-600">DU</span>
        </div>
        <StatChip icon={<MapPin className="h-3.5 w-3.5" />} value={player.city.split(' ')[0]} color="text-zinc-400" smOnly />
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white" onClick={() => refreshPlayer()}>
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
        <div className="hidden items-center gap-1 sm:flex">
          <span className="text-xs font-medium text-zinc-400">{player.username}</span>
          {player.isAdmin && <span className="text-[10px] font-bold text-[#d4af37]">ADMIN</span>}
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-red-400" onClick={handleLogout}>
          <LogOut className="h-3.5 w-3.5" />
        </Button>
      </div>
    </header>
  );
}

function StatChip({ icon, value, color, smOnly }: { icon: React.ReactNode; value: string; color: string; smOnly?: boolean }) {
  return (
    <div className={`flex items-center gap-1 rounded-md border border-white/[0.04] bg-white/[0.02] px-2 py-1 ${smOnly ? 'sm:hidden' : ''}`}>
      <span className={color}>{icon}</span>
      <span className={`text-xs font-bold ${color}`}>{value}</span>
    </div>
  );
}
