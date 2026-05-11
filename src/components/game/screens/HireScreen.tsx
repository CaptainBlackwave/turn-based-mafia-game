'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGameStore } from '@/lib/game-store';
import { HIRE_TYPES } from '@/lib/game-constants';
import { formatNumber } from '@/lib/format';
import { Loader2 } from 'lucide-react';

export default function HireScreen() {
  const { player, addToast, refreshPlayer } = useGameStore();
  const [type, setType] = useState<'operative' | 'soldier'>('operative');
  const [turns, setTurns] = useState(1);
  const [loading, setLoading] = useState(false);

  if (!player) return null;

  const handleHire = async () => {
    if (turns < 1 || turns > player.turns) return;
    setLoading(true);
    try {
      const res = await fetch('/api/game/hire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, turns }),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast(data.error, 'error');
        return;
      }
      addToast(data.message, 'success');
      refreshPlayer();
    } catch {
      addToast('Network error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-bold text-white">Hire Crew</h2>
        <p className="mt-1 text-sm text-zinc-500">Scout for operatives and soldiers using your turns.</p>
      </motion.div>

      {/* Type Selection */}
      <div className="grid gap-3 sm:grid-cols-2">
        {HIRE_TYPES.map(ht => (
          <button
            key={ht.id}
            onClick={() => setType(ht.id as any)}
            className={`rounded-xl border p-4 text-left transition-all ${
              type === ht.id
                ? 'border-[#d4af37]/30 bg-[#d4af37]/5 ring-1 ring-[#d4af37]/10'
                : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{ht.icon}</span>
              <div>
                <h3 className={`font-semibold ${type === ht.id ? 'text-[#d4af37]' : 'text-white'}`}>{ht.name}</h3>
                <p className="mt-0.5 text-xs text-zinc-500">{ht.description}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-zinc-400">
              <span>⚡ 1 turn per scout</span>
              <span>•</span>
              <span>1-5 units per scout</span>
            </div>
          </button>
        ))}
      </div>

      {/* Turn Input */}
      <Card className="border-white/[0.06] bg-white/[0.02]">
        <CardHeader className="pb-2">
          <h3 className="text-sm font-semibold text-zinc-300">Scout for {type === 'operative' ? 'Operatives' : 'Soldiers'}</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-zinc-400">Turns to spend</label>
              <Input
                type="number"
                min={1}
                max={player.turns}
                value={turns}
                onChange={e => setTurns(Math.max(1, Math.min(parseInt(e.target.value) || 1, player.turns)))}
                className="border-white/[0.08] bg-white/[0.03] text-white"
              />
              <p className="mt-1 text-xs text-zinc-500">
                Available: {player.turns} turns • Expected: {turns}-{turns * 5} {type}s
              </p>
            </div>
            <div className="flex gap-2">
              {[1, 5, 10, 25, 50].map(t => (
                <Button
                  key={t}
                  variant="outline"
                  size="sm"
                  onClick={() => setTurns(Math.min(t, player.turns))}
                  className="border-white/[0.08] text-xs text-zinc-400 hover:text-white"
                >
                  {t}
                </Button>
              ))}
            </div>
            <Button
              onClick={handleHire}
              disabled={loading || turns < 1}
              className="w-full bg-[#d4af37] font-bold text-black hover:bg-[#c4a030]"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : '🔍'}
              Scout ({turns} turn{turns > 1 ? 's' : ''})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Crew */}
      <Card className="border-white/[0.06] bg-white/[0.02]">
        <CardHeader className="pb-2">
          <h3 className="text-sm font-semibold text-zinc-300">Current Crew</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-white/[0.04] bg-white/[0.01] p-3 text-center">
              <span className="text-2xl">💼</span>
              <p className="mt-1 text-lg font-bold text-white">{formatNumber(player.operatives)}</p>
              <p className="text-xs text-zinc-500">Operatives</p>
            </div>
            <div className="rounded-lg border border-white/[0.04] bg-white/[0.01] p-3 text-center">
              <span className="text-2xl">🛡️</span>
              <p className="mt-1 text-lg font-bold text-white">{formatNumber(player.soldiers)}</p>
              <p className="text-xs text-zinc-500">Soldiers</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
