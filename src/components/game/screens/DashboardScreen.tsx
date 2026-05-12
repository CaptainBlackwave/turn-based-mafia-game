'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGameStore } from '@/lib/game-store';
import { formatCash, formatNumber } from '@/lib/format';

export default function DashboardScreen() {
  const { player, refreshPlayer } = useGameStore();

  useEffect(() => {
    fetch('/api/game/regen-turns', { method: 'POST' })
      .then(r => r.json())
      .then(d => { if (d.turnsRegen > 0) refreshPlayer(); })
      .catch(() => {});
  }, []);

  if (!player) return null;

  const isProtected = player.protectedUntil && new Date(player.protectedUntil) > new Date();
  const protTime = isProtected ? new Date(player.protectedUntil!) : null;

  const stats = [
    { label: 'Cash', value: formatCash(player.cash), color: 'text-emerald-400', icon: '💵' },
    { label: 'Bank', value: formatCash(player.bank), color: 'text-cyan-400', icon: '🏦' },
    { label: 'Turns', value: `${player.turns} / ${player.maxTurns}`, color: 'text-amber-400', icon: '⚡' },
    { label: 'Networth', value: formatCash(player.networth), color: 'text-[#d4af37]', icon: '📈' },
    { label: 'Credits', value: formatNumber(player.credits), color: 'text-cyan-300', icon: '💎' },
    { label: 'Reserves', value: formatNumber(player.reserves), color: 'text-purple-400', icon: '🔄' },
  ];

  const units = [
    { label: 'Operatives', value: player.operatives, nw: player.operatives * 1500, icon: '💼' },
    { label: 'Soldiers', value: player.soldiers, nw: player.soldiers * 600, icon: '🛡️' },
  ];

  const supplies = [
    { label: 'Food', value: player.food, nw: player.food * 3, icon: '🍕' },
  ];

  const weapons = [
    { label: 'Weapons', value: player.weapons, nw: player.weapons * 1000, icon: '🔫' },
  ];

  const vehicles = [
    { label: 'Cars', value: player.cars, nw: player.cars * 20000, icon: '🚗' },
    { label: 'Planes', value: player.planes, nw: player.planes * 100000, icon: '✈️' },
  ];

  const opColor = player.opHappiness >= 70 ? 'text-emerald-400' : player.opHappiness >= 40 ? 'text-amber-400' : 'text-red-400';
  const soldierColor = player.soldierHappiness >= 70 ? 'text-emerald-400' : player.soldierHappiness >= 40 ? 'text-amber-400' : 'text-red-400';

  const tierColors: Record<string, string> = {
    Free: 'text-zinc-400',
    Titanium: 'text-slate-300',
    Diamond: 'text-cyan-400',
    Onyx: 'text-purple-400',
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-bold text-white sm:text-2xl">
          Welcome back, <span className="text-[#d4af37]">{player.username}</span>
        </h2>
        <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
          <span>📍 {player.city}</span>
          <Badge className={`${tierColors[player.subscriptionTier] || 'text-zinc-400'} bg-white/[0.04] border-white/[0.06]`}>
            {player.subscriptionTier}
          </Badge>
          {isProtected && (
            <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
              🛡️ Protected until {protTime!.toLocaleTimeString()}
            </Badge>
          )}
        </p>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <Card className="border-white/[0.06] bg-white/[0.02]">
              <CardContent className="p-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{stat.icon}</span>
                  <span className="text-[10px] text-zinc-500">{stat.label}</span>
                </div>
                <p className={`mt-0.5 text-sm font-bold ${stat.color}`}>{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="border-white/[0.06] bg-white/[0.02]">
        <CardHeader className="pb-2"><h3 className="text-sm font-semibold text-zinc-300">Crew Happiness</h3></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-zinc-400">Operative Happiness</span>
              <span className={`font-bold ${opColor}`}>{player.opHappiness}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/[0.06]">
              <div className={`h-full rounded-full transition-all ${
                player.opHappiness >= 70 ? 'bg-emerald-500' : player.opHappiness >= 40 ? 'bg-amber-500' : 'bg-red-500'
              }`} style={{ width: `${player.opHappiness}%` }} />
            </div>
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-zinc-400">Soldier Happiness</span>
              <span className={`font-bold ${soldierColor}`}>{player.soldierHappiness}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/[0.06]">
              <div className={`h-full rounded-full transition-all ${
                player.soldierHappiness >= 70 ? 'bg-emerald-500' : player.soldierHappiness >= 40 ? 'bg-amber-500' : 'bg-red-500'
              }`} style={{ width: `${player.soldierHappiness}%` }} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard title="Units" items={units} />
        <StatCard title="Supplies" items={supplies} />
        <StatCard title="Weapons" items={weapons} />
        <StatCard title="Vehicles & Planes" items={vehicles} />
      </div>
    </div>
  );
}

function StatCard({ title, items }: { title: string; items: { label: string; value: number; nw: number; icon: string }[] }) {
  return (
    <Card className="border-white/[0.06] bg-white/[0.02]">
      <CardHeader className="pb-2"><h3 className="text-sm font-semibold text-zinc-300">{title}</h3></CardHeader>
      <CardContent className="space-y-2">
        {items.map(item => (
          <div key={item.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <span>{item.icon}</span>
              <span className="text-zinc-300">{item.label}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-medium text-white">{formatNumber(item.value)}</span>
              <span className="text-zinc-600">({formatCash(item.nw)})</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
