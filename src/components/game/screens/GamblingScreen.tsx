'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGameStore } from '@/lib/game-store';
import { formatCash, formatNumber } from '@/lib/format';
import { Loader2, Coins, Club, CircleDot, Gamepad2 } from 'lucide-react';

export default function GamblingScreen() {
  const { player, addToast, refreshPlayer } = useGameStore();
  const [tab, setTab] = useState<'coinflip' | 'blackjack' | 'roulette' | 'horserace'>('coinflip');
  const [betAmount, setBetAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const numBet = parseInt(betAmount) || 0;

  if (!player) return null;

  const handleBet = async (extraData: any = {}) => {
    if (numBet < 1) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/game/gambling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameType: tab, betAmount: numBet, ...extraData }),
      });
      const data = await res.json();
      if (!res.ok) { addToast(data.error, 'error'); return; }

      if (data.phase === 'playing' || data.phase === 'stand') {
        setResult(data);
      } else {
        setResult(data);
        if (data.message) addToast(data.message, data.won ? 'success' : 'error');
        refreshPlayer();
      }
    } catch { addToast('Network error', 'error'); }
    finally { setLoading(false); }
  };

  const tabs = [
    { id: 'coinflip' as const, label: 'Coin Flip', icon: <Coins className="h-4 w-4" /> },
    { id: 'blackjack' as const, label: 'Blackjack', icon: <Club className="h-4 w-4" /> },
    { id: 'roulette' as const, label: 'Roulette', icon: <CircleDot className="h-4 w-4" /> },
    { id: 'horserace' as const, label: 'Horse Race', icon: <Gamepad2 className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-bold text-white">Casino</h2>
        <p className="mt-1 text-sm text-zinc-500">Try your luck at the tables. Gamble responsibly.</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-zinc-500">Your cash:</span>
          <span className="text-sm font-bold text-emerald-400">{formatCash(player.cash)}</span>
        </div>
      </motion.div>

      <div className="flex gap-2">
        {tabs.map(t => (
          <Button key={t.id} variant={tab === t.id ? 'default' : 'outline'} size="sm"
            onClick={() => { setTab(t.id); setResult(null); }}
            className={tab === t.id ? 'bg-[#d4af37] text-black' : 'border-white/[0.08] text-zinc-400 hover:text-white'}>
            {t.icon} {t.label}
          </Button>
        ))}
      </div>

      <Card className="border-white/[0.06] bg-white/[0.02]">
        <CardHeader className="pb-2">
          <h3 className="text-sm font-semibold text-zinc-300">
            {tabs.find(t => t.id === tab)?.icon} {tabs.find(t => t.id === tab)?.label}
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Input type="number" min={1} value={betAmount} onChange={e => setBetAmount(e.target.value)} placeholder="Bet amount" className="border-white/[0.08] bg-white/[0.03] text-white" />
            <div className="flex gap-1">
              {[1000, 10000, 100000, 1000000, 10000000].map(v => (
                <Button key={v} variant="outline" size="sm" onClick={() => setBetAmount(String(v))}
                  className="border-white/[0.08] text-[10px] text-zinc-400">{formatCash(v)}</Button>
              ))}
            </div>

            {/* Game-specific controls */}
            {tab === 'coinflip' && (
              <div className="flex gap-2">
                <Button onClick={() => handleBet({ choice: 'heads' })} disabled={loading || numBet < 1}
                  className="flex-1 bg-amber-600 text-white hover:bg-amber-700">🪙 Heads</Button>
                <Button onClick={() => handleBet({ choice: 'tails' })} disabled={loading || numBet < 1}
                  className="flex-1 bg-blue-600 text-white hover:bg-blue-700">🪙 Tails</Button>
              </div>
            )}

            {tab === 'blackjack' && !result?.phase && (
              <Button onClick={() => handleBet({ action: 'start' })} disabled={loading || numBet < 1}
                className="w-full bg-emerald-600 text-white hover:bg-emerald-700">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : '🃏'} Deal
              </Button>
            )}

            {tab === 'blackjack' && result?.phase === 'playing' && (
              <div className="space-y-3">
                <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-3">
                  <p className="text-xs text-zinc-500">Your Hand (Value: {result.playerValue})</p>
                  <p className="text-lg font-bold text-white">{result.playerHand.join(', ')}</p>
                </div>
                <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-3">
                  <p className="text-xs text-zinc-500">Dealer (Showing)</p>
                  <p className="text-lg font-bold text-zinc-300">{result.dealerHand.join(', ')}</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleBet({ action: 'hit', choice: result.playerHand })} disabled={loading}
                    className="flex-1 bg-amber-600 text-white hover:bg-amber-700">Hit</Button>
                  <Button onClick={() => handleBet({ action: 'stand', choice: { playerHand: result.playerHand, dealerHand: result.dealerHand } })} disabled={loading}
                    className="flex-1 bg-red-600 text-white hover:bg-red-700">Stand</Button>
                </div>
              </div>
            )}

            {tab === 'roulette' && (
              <div className="grid grid-cols-3 gap-2">
                <Button onClick={() => handleBet({ choice: 'red' })} disabled={loading || numBet < 1}
                  className="bg-red-600 text-white hover:bg-red-700">🔴 Red (2x)</Button>
                <Button onClick={() => handleBet({ choice: 'black' })} disabled={loading || numBet < 1}
                  className="bg-zinc-700 text-white hover:bg-zinc-600">⚫ Black (2x)</Button>
                <Button onClick={() => handleBet({ choice: 'green' })} disabled={loading || numBet < 1}
                  className="bg-emerald-600 text-white hover:bg-emerald-700">🟢 0 (15x)</Button>
                <Button onClick={() => handleBet({ choice: 'odd' })} disabled={loading || numBet < 1}
                  variant="outline" className="border-white/[0.08] text-zinc-300">Odd (2x)</Button>
                <Button onClick={() => handleBet({ choice: 'even' })} disabled={loading || numBet < 1}
                  variant="outline" className="border-white/[0.08] text-zinc-300">Even (2x)</Button>
              </div>
            )}

            {tab === 'horserace' && (
              <div className="space-y-2">
                {[
                  { name: 'Thunder Bolt', odds: 3 }, { name: 'Midnight Star', odds: 5 },
                  { name: 'Lucky Strike', odds: 8 }, { name: 'Wild Fire', odds: 4 },
                  { name: 'Shadow Runner', odds: 6 }, { name: 'Gold Rush', odds: 10 },
                ].map((horse, i) => (
                  <Button key={i} onClick={() => handleBet({ choice: String(i) })} disabled={loading || numBet < 1}
                    variant="outline" className="w-full justify-between border-white/[0.08] text-zinc-300">
                    <span>🏇 {horse.name}</span>
                    <span className="text-xs text-amber-400">{horse.odds}x</span>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Result */}
      {result && result.won !== undefined && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className={result.won ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'}>
            <CardContent className="p-4 text-center">
              <p className={`text-lg font-bold ${result.won ? 'text-emerald-400' : 'text-red-400'}`}>
                {result.won ? '🎉 You Won!' : '💀 You Lost!'}
              </p>
              {result.payout !== undefined && (
                <p className="mt-1 text-sm text-zinc-400">
                  {result.payout > 0 ? `+${formatCash(result.payout)}` : result.payout === 0 ? 'Push' : `${formatCash(result.payout)}`}
                </p>
              )}
              {result.details?.spin !== undefined && (
                <p className="mt-2 text-sm">
                  Ball landed on: <span className="font-bold text-white">{result.details.spin}</span>
                  <span className="text-zinc-500"> ({result.details.spinColor})</span>
                </p>
              )}
              {result.details?.result && (
                <p className="mt-1 text-sm text-zinc-400">Coin: {result.details.result}</p>
              )}
              {result.details?.winnerName && (
                <p className="mt-1 text-sm text-zinc-400">Winner: <span className="font-bold text-white">{result.details.winnerName}</span> ({result.details.odds}x)</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
