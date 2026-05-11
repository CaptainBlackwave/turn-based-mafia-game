'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGameStore } from '@/lib/game-store';
import { ATTACK_TYPES, CITIES } from '@/lib/game-constants';
import { formatCash, formatNumber } from '@/lib/format';
import { Loader2, Crosshair, Shield, MapPin } from 'lucide-react';

interface PlayerTarget {
  id: string;
  username: string;
  city: string;
  networth: number;
  operatives: number;
  soldiers: number;
  isBot: boolean;
  inRange: boolean;
  sameCity: boolean;
}

export default function AttackScreen() {
  const { player, addToast, refreshPlayer } = useGameStore();
  const [targets, setTargets] = useState<PlayerTarget[]>([]);
  const [selectedType, setSelectedType] = useState<string>('raid');
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingTargets, setLoadingTargets] = useState(true);
  const [result, setResult] = useState<any>(null);

  const loadTargets = useCallback(async () => {
    setLoadingTargets(true);
    try {
      const res = await fetch('/api/game/players');
      const data = await res.json();
      setTargets(data.players || []);
    } catch { /* silent */ }
    setLoadingTargets(false);
  }, []);

  useEffect(() => { loadTargets(); }, [loadTargets]);

  if (!player) return null;

  const isProtected = player.protectedUntil && new Date(player.protectedUntil) > new Date();
  const attackTypeData = ATTACK_TYPES.find(a => a.id === selectedType)!;
  const target = targets.find(t => t.id === selectedTarget);
  const availableTargets = targets.filter(t => t.sameCity && t.inRange);

  const handleAttack = async () => {
    if (!selectedTarget || !selectedType) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/game/attack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId: selectedTarget, attackType: selectedType }),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast(data.error, 'error');
        return;
      }
      setResult(data.result);
      addToast(data.message, data.result.won ? 'success' : 'error');
      refreshPlayer();
      loadTargets();
    } catch {
      addToast('Network error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-bold text-white">Attack</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Attack players in your city within your networth range (0.5x - 4x).
        </p>
      </motion.div>

      {isProtected && (
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="p-4">
            <p className="text-sm text-emerald-400">🛡️ You are under protection and cannot attack or be attacked.</p>
          </CardContent>
        </Card>
      )}

      {/* Attack type selection */}
      <div className="grid gap-3 sm:grid-cols-3">
        {ATTACK_TYPES.map(at => (
          <button
            key={at.id}
            onClick={() => { setSelectedType(at.id); setResult(null); }}
            className={`rounded-xl border p-4 text-left transition-all ${
              selectedType === at.id
                ? `border-[${at.id === 'raid' ? '#d4af37' : at.id === 'sabotage' ? '#ef4444' : '#f43f5e'}]/30 ring-1`
                : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'
            }`}
            style={selectedType === at.id ? { backgroundColor: 'var(--tw-ring-color, rgba(212,175,55,0.05))' } : {}}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{at.icon}</span>
              <div>
                <h3 className={`font-semibold ${at.color}`}>{at.name}</h3>
                <p className="mt-0.5 text-xs text-zinc-500">{at.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Target selection */}
      <Card className="border-white/[0.06] bg-white/[0.02]">
        <CardHeader className="pb-2">
          <h3 className="text-sm font-semibold text-zinc-300">
            Targets in {player.city} ({availableTargets.length} in range)
          </h3>
        </CardHeader>
        <CardContent>
          {loadingTargets ? (
            <div className="flex items-center justify-center py-8 text-zinc-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading targets...
            </div>
          ) : availableTargets.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-500">No targets available in your city within range.</p>
          ) : (
            <div className="max-h-64 space-y-1 overflow-y-auto">
              {availableTargets.map(t => (
                <button
                  key={t.id}
                  onClick={() => { setSelectedTarget(t.id); setResult(null); }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-all ${
                    selectedTarget === t.id
                      ? 'bg-[#d4af37]/10 ring-1 ring-[#d4af37]/20'
                      : 'hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{t.username}</span>
                    {t.isBot && <Badge className="border-red-500/20 bg-red-500/10 text-[10px] text-red-400">BOT</Badge>}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                    <span>💼{formatNumber(t.operatives)}</span>
                    <span>🛡️{formatNumber(t.soldiers)}</span>
                    <span className="font-medium text-[#d4af37]">{formatCash(t.networth)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attack button */}
      {target && !isProtected && (
        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">
                  Target: <span className="text-red-400">{target.username}</span>
                </p>
                <p className="text-xs text-zinc-500">
                  {attackTypeData.name} • Costs 1 turn • {formatCash(target.networth)} NW
                </p>
              </div>
            </div>
            <Button
              onClick={handleAttack}
              disabled={loading || player.turns < 1}
              className="w-full bg-red-600 font-bold text-white hover:bg-red-700"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Crosshair className="mr-2 h-4 w-4" />}
              Launch {attackTypeData.name}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Attack result */}
      {result && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className={result.won ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'}>
            <CardContent className="p-4">
              <div className="text-center">
                <p className={`text-lg font-bold ${result.won ? 'text-emerald-400' : 'text-red-400'}`}>
                  {result.won ? '⚔️ Victory!' : '💀 Defeat!'}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-2">
                    <p className="text-xs text-zinc-500">Your losses</p>
                    <p className="font-medium text-white">{result.attackerLosses} soldiers</p>
                  </div>
                  <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-2">
                    <p className="text-xs text-zinc-500">Enemy losses</p>
                    <p className="font-medium text-white">{result.defenderLosses} soldiers</p>
                  </div>
                  {result.cashStolen > 0 && (
                    <div className="rounded-lg border border-emerald-500/10 bg-emerald-500/5 p-2">
                      <p className="text-xs text-zinc-500">Cash stolen</p>
                      <p className="font-medium text-emerald-400">{formatCash(result.cashStolen)}</p>
                    </div>
                  )}
                  {result.drugsStolen > 0 && (
                    <div className="rounded-lg border border-emerald-500/10 bg-emerald-500/5 p-2">
                      <p className="text-xs text-zinc-500">Drugs stolen</p>
                      <p className="font-medium text-emerald-400">{result.drugsStolen}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
