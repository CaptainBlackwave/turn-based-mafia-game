'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGameStore } from '@/lib/game-store';
import { PRODUCE_TYPES } from '@/lib/game-constants';
import { formatNumber } from '@/lib/format';
import { Loader2 } from 'lucide-react';

export default function ProduceScreen() {
  const { player, addToast, refreshPlayer } = useGameStore();
  const [type, setType] = useState<string>('alcohol');
  const [turns, setTurns] = useState(1);
  const [loading, setLoading] = useState(false);

  if (!player) return null;

  const selectedType = PRODUCE_TYPES.find(t => t.id === type)!;
  const requiredUnits = selectedType.requires === 'operatives' ? player.operatives : player.soldiers;
  const expectedAmount = selectedType.rate * requiredUnits * turns;

  const handleProduce = async () => {
    if (turns < 1 || turns > player.turns) return;
    setLoading(true);
    try {
      const res = await fetch('/api/game/produce', {
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
        <h2 className="text-xl font-bold text-white">Produce</h2>
        <p className="mt-1 text-sm text-zinc-500">Use turns to produce drugs and alcohol.</p>
      </motion.div>

      {/* Type Selection */}
      <div className="grid gap-3 sm:grid-cols-3">
        {PRODUCE_TYPES.map(pt => (
          <button
            key={pt.id}
            onClick={() => setType(pt.id)}
            className={`rounded-xl border p-4 text-left transition-all ${
              type === pt.id
                ? 'border-[#d4af37]/30 bg-[#d4af37]/5 ring-1 ring-[#d4af37]/10'
                : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{pt.icon}</span>
              <div>
                <h3 className={`font-semibold ${type === pt.id ? 'text-[#d4af37]' : 'text-white'}`}>{pt.name}</h3>
                <p className="mt-0.5 text-xs text-zinc-500">{pt.rate} per {pt.requires === 'operatives' ? 'operative' : 'soldier'}/turn</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Produce controls */}
      <Card className="border-white/[0.06] bg-white/[0.02]">
        <CardHeader className="pb-2">
          <h3 className="text-sm font-semibold text-zinc-300">
            Produce {selectedType.name}
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-4 rounded-lg border border-white/[0.04] bg-white/[0.01] p-3">
              <span className="text-2xl">{selectedType.icon}</span>
              <div>
                <p className="text-sm text-zinc-300">
                  {requiredUnits} {selectedType.requires}{requiredUnits !== 1 ? 's' : ''} available
                </p>
                <p className="text-xs text-zinc-500">
                  Expected output: <span className="font-medium text-white">{formatNumber(expectedAmount)} {selectedType.name}</span>
                </p>
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
              onClick={handleProduce}
              disabled={loading || requiredUnits === 0}
              className="w-full bg-[#d4af37] font-bold text-black hover:bg-[#c4a030]"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : '🏭'}
              Produce ({turns} turn{turns > 1 ? 's' : ''})
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
