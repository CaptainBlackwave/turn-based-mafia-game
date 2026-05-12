'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useGameStore } from '@/lib/game-store';
import { formatCash, formatNumber } from '@/lib/format';
import { Loader2, CreditCard, ArrowDown, ArrowUp, Zap, Shield } from 'lucide-react';

export default function CreditsScreen() {
  const { player, addToast, refreshPlayer } = useGameStore();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const numAmount = parseInt(amount) || 0;

  if (!player) return null;

  const handleAction = async (action: string) => {
    if (numAmount < 1) return;
    setLoading(true);
    try {
      const res = await fetch('/api/game/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, amount: numAmount }),
      });
      const data = await res.json();
      if (!res.ok) { addToast(data.error, 'error'); return; }
      addToast(data.message, 'success');
      setAmount('');
      refreshPlayer();
    } catch { addToast('Network error', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-bold text-white">Credits & Reserves</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Purchase credits through donations. Convert credits to reserves (turns not against cap), then redeem reserves as usable turns.
        </p>
      </motion.div>

      <div className="grid gap-3 sm:grid-cols-4">
        <Card className="border-white/[0.06] bg-white/[0.02]">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-zinc-500">Credits</p>
            <p className="mt-1 text-xl font-bold text-cyan-400">{formatNumber(player.credits)}</p>
          </CardContent>
        </Card>
        <Card className="border-white/[0.06] bg-white/[0.02]">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-zinc-500">Reserves</p>
            <p className="mt-1 text-xl font-bold text-purple-400">{formatNumber(player.reserves)}</p>
          </CardContent>
        </Card>
        <Card className="border-white/[0.06] bg-white/[0.02]">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-zinc-500">Current Turns</p>
            <p className="mt-1 text-xl font-bold text-amber-400">{formatNumber(player.turns)}</p>
          </CardContent>
        </Card>
        <Card className="border-white/[0.06] bg-white/[0.02]">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-zinc-500">Max Turns</p>
            <p className="mt-1 text-xl font-bold text-zinc-300">{formatNumber(player.maxTurns)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {/* Buy Credits */}
        <Card className="border-cyan-500/20 bg-cyan-500/5">
          <CardHeader className="pb-2">
            <h3 className="text-sm font-semibold text-cyan-400">
              <CreditCard className="mr-1 inline h-4 w-4" /> Buy Credits
            </h3>
          </CardHeader>
          <CardContent>
            <p className="mb-2 text-xs text-zinc-500">Purchase credits via donation (simulated).</p>
            <Input type="number" min={1} value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount" className="border-white/[0.08] bg-white/[0.03] text-white" />
            <div className="mt-2 flex gap-1">
              {[100, 500, 1000, 5000].map(v => (
                <Button key={v} variant="outline" size="sm" onClick={() => setAmount(String(v))}
                  className="border-white/[0.08] text-xs text-zinc-400">{v}</Button>
              ))}
            </div>
            <Button onClick={() => handleAction('buy_credits')} disabled={loading || numAmount < 1}
              className="mt-3 w-full bg-cyan-600 text-white hover:bg-cyan-700">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : '💰'} Buy Credits
            </Button>
          </CardContent>
        </Card>

        {/* Credits to Reserves */}
        <Card className="border-purple-500/20 bg-purple-500/5">
          <CardHeader className="pb-2">
            <h3 className="text-sm font-semibold text-purple-400">
              <ArrowDown className="mr-1 inline h-4 w-4" /> Credits to Reserves
            </h3>
          </CardHeader>
          <CardContent>
            <p className="mb-2 text-xs text-zinc-500">Convert credits into reserve turns (not counted against turn cap).</p>
            <Input type="number" min={1} value={amount} onChange={e => setAmount(e.target.value)} placeholder="Credits" className="border-white/[0.08] bg-white/[0.03] text-white" />
            <Button onClick={() => handleAction('credits_to_reserves')} disabled={loading || numAmount < 1 || player.credits < numAmount}
              className="mt-3 w-full bg-purple-600 text-white hover:bg-purple-700">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : '🔄'} Convert to Reserves
            </Button>
          </CardContent>
        </Card>

        {/* Reserves to Turns */}
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardHeader className="pb-2">
            <h3 className="text-sm font-semibold text-amber-400">
              <ArrowUp className="mr-1 inline h-4 w-4" /> Reserves to Turns
            </h3>
          </CardHeader>
          <CardContent>
            <p className="mb-2 text-xs text-zinc-500">Redeem reserve turns as usable turns (up to your max).</p>
            <Input type="number" min={1} value={amount} onChange={e => setAmount(e.target.value)} placeholder="Reserves" className="border-white/[0.08] bg-white/[0.03] text-white" />
            <Button onClick={() => handleAction('reserves_to_turns')} disabled={loading || numAmount < 1 || player.reserves < 1}
              className="mt-3 w-full bg-amber-600 text-white hover:bg-amber-700">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : '⚡'} Redeem Turns
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-4">
        <h3 className="mb-2 text-sm font-semibold text-zinc-300">How It Works</h3>
        <ol className="space-y-1 text-xs text-zinc-500">
          <li>1. <span className="text-cyan-400">Buy Credits</span> — Purchase credits through donations</li>
          <li>2. <span className="text-purple-400">Convert to Reserves</span> — Credits become reserve turns (not against cap)</li>
          <li>3. <span className="text-amber-400">Redeem Turns</span> — Use reserves as regular turns (up to your max)</li>
        </ol>
      </div>
    </div>
  );
}
