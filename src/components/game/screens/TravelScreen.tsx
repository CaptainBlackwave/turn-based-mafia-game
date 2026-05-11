'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGameStore } from '@/lib/game-store';
import { CITIES } from '@/lib/game-constants';
import { Loader2 } from 'lucide-react';

export default function TravelScreen() {
  const { player, addToast, refreshPlayer } = useGameStore();
  const [loading, setLoading] = useState(false);

  if (!player) return null;

  const isProtected = player.protectedUntil && new Date(player.protectedUntil) > new Date();

  const handleTravel = async (city: string) => {
    if (city === player.city) return;
    setLoading(true);
    try {
      const res = await fetch('/api/game/travel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city }),
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
        <h2 className="text-xl font-bold text-white">Travel</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Travel between cities to find targets or escape enemies.
        </p>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-zinc-500">Current location:</span>
          <Badge className="border-[#d4af37]/20 bg-[#d4af37]/10 text-[#d4af37]">
            📍 {player.city}
          </Badge>
        </div>
      </motion.div>

      {isProtected && (
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="p-4">
            <p className="text-sm text-emerald-400">🛡️ Cannot travel while under protection.</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CITIES.map(city => {
          const isCurrent = city.id === player.city;
          return (
            <Card
              key={city.id}
              className={`border transition-all ${
                isCurrent
                  ? 'border-[#d4af37]/30 bg-[#d4af37]/5 ring-1 ring-[#d4af37]/10'
                  : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{city.emoji}</span>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${isCurrent ? 'text-[#d4af37]' : 'text-white'}`}>
                      {city.id}
                    </h3>
                    {isCurrent ? (
                      <Badge className="mt-1 border-[#d4af37]/20 bg-[#d4af37]/10 text-[10px] text-[#d4af37]">
                        Current
                      </Badge>
                    ) : (
                      <p className="mt-1 text-xs text-zinc-500">Click to travel</p>
                    )}
                  </div>
                </div>
                {!isCurrent && !isProtected && (
                  <Button
                    onClick={() => handleTravel(city.id)}
                    disabled={loading}
                    className="mt-3 w-full border border-white/[0.08] bg-white/[0.04] font-medium text-zinc-300 hover:bg-white/[0.08] hover:text-white"
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : '✈️'}
                    Travel
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
