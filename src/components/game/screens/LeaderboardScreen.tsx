'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGameStore } from '@/lib/game-store';
import { formatCash, formatNumber } from '@/lib/format';
import { Trophy, Loader2, Crown, Medal } from 'lucide-react';

interface RankedPlayer {
  id: string;
  username: string;
  city: string;
  networth: number;
  operatives: number;
  soldiers: number;
}

export default function LeaderboardScreen() {
  const { player } = useGameStore();
  const [ranked, setRanked] = useState<RankedPlayer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/game/leaderboard')
      .then(r => r.json())
      .then(d => { setRanked(d.players || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const playerRank = player ? ranked.findIndex(p => p.id === player.id) + 1 : 0;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-bold text-white">
          <Trophy className="mr-2 inline h-5 w-5 text-[#d4af37]" />
          Leaderboard
        </h2>
        <p className="mt-1 text-sm text-zinc-500">Top players ranked by networth.</p>
      </motion.div>

      {player && playerRank > 0 && (
        <Card className="border-[#d4af37]/20 bg-[#d4af37]/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500">Your Rank</p>
                <p className="text-lg font-bold text-[#d4af37]">#{playerRank}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-500">Your Networth</p>
                <p className="text-lg font-bold text-emerald-400">{formatCash(player.networth)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-white/[0.06] bg-white/[0.02]">
        <CardHeader className="pb-2">
          <h3 className="text-sm font-semibold text-zinc-300">Rankings</h3>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12 text-zinc-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading rankings...
            </div>
          ) : ranked.length === 0 ? (
            <p className="py-12 text-center text-sm text-zinc-500">No players ranked yet.</p>
          ) : (
            <div className="max-h-[500px] space-y-1 overflow-y-auto">
              {ranked.map((p, i) => {
                const isMe = player && p.id === player.id;
                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between rounded-lg px-3 py-2.5 transition-all ${
                      isMe ? 'bg-[#d4af37]/5 ring-1 ring-[#d4af37]/20' : 'hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-xs font-bold">
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${isMe ? 'text-[#d4af37]' : 'text-white'}`}>
                          {p.username}
                          {isMe && <Badge className="ml-1 border-[#d4af37]/20 bg-[#d4af37]/10 text-[10px] text-[#d4af37]">You</Badge>}
                        </p>
                        <p className="text-xs text-zinc-500">
                          📍 {p.city} • 💼 {formatNumber(p.operatives)} • 🛡️ {formatNumber(p.soldiers)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#d4af37]">{formatCash(p.networth)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
