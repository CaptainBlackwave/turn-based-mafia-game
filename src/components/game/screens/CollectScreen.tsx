'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGameStore } from '@/lib/game-store';
import { formatCash, formatNumber } from '@/lib/format';
import { Loader2 } from 'lucide-react';

export default function CollectScreen() {
  const { player, addToast, refreshPlayer } = useGameStore();
  const [turns, setTurns] = useState(1);
  const [loading, setLoading] = useState(false);

  if (!player) return null;

  const expectedCollect = 200 * player.operatives * turns;

  const handleCollect = async () => {
    if (turns < 1 || turns > player.turns) return;
    setLoading(true);
    try {
      const res = await fetch('/api/game/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ turns }),
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
        <h2 className="text-xl font-bold text-white">Collect Income</h2>
        <p className="mt-1 text-sm text-zinc-500">Collect cash from your businesses using operatives.</p>
      </motion.div>

      <Card className="border-white/[0.06] bg-white/[0.02]">
        <CardHeader className="pb-2">
          <h3 className="text-sm font-semibold text-zinc-300">Business Collection</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg border border-white/[0.04] bg-white/[0.01] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">💼</span>
                  <div>
                    <p className="text-sm text-zinc-300">{formatNumber(player.operatives)} Operatives</p>
                    <p className="text-xs text-zinc-500">$200 per operative per turn</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-500">Current cash</p>
                  <p className="text-lg font-bold text-emerald-400">{formatCash(player.cash)}</p>
                </div>
              </div>
            </div>

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
                Expected collection: <span className="font-medium text-emerald-400">{formatCash(expectedCollect)}</span>
              </p>
            </div>

            <div className="flex gap-2">
              {[1, 5, 10, 25, 50].map(t => (
                <Button key={t} variant="outline" size="sm"
                  onClick={() => setTurns(Math.min(t, player.turns))}
                  className="border-white/[0.08] text-xs text-zinc-400 hover:text-white">
                  {t}
                </Button>
              ))}
            </div>

            <Button
              onClick={handleCollect}
              disabled={loading || player.operatives === 0}
              className="w-full bg-emerald-600 font-bold text-white hover:bg-emerald-700"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : '💵'}
              Collect ({turns} turn{turns > 1 ? 's' : ''})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Tip */}
      <Card className="border-amber-500/10 bg-amber-500/5">
        <CardContent className="p-4">
          <p className="text-xs text-amber-400/80">
            💡 <strong>Tip:</strong> Collect, then bank immediately. Never walk around with loose cash — it makes you a prime target!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
