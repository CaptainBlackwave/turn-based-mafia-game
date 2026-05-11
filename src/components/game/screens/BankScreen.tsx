'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGameStore } from '@/lib/game-store';
import { formatCash } from '@/lib/format';
import { calculateMaxDeposit } from '@/lib/game-engine';
import { Loader2 } from 'lucide-react';

export default function BankScreen() {
  const { player, addToast, refreshPlayer } = useGameStore();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  if (!player) return null;

  const totalCash = player.cash + player.bank;
  const maxDeposit = calculateMaxDeposit(player.cash, player.bank);
  const numAmount = parseInt(amount) || 0;

  const handleDeposit = async () => {
    if (numAmount < 1) return;
    setLoading(true);
    try {
      const res = await fetch('/api/game/bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deposit', amount: numAmount }),
      });
      const data = await res.json();
      if (!res.ok) { addToast(data.error, 'error'); return; }
      addToast(data.message, 'success');
      setAmount('');
      refreshPlayer();
    } catch { addToast('Network error', 'error'); }
    finally { setLoading(false); }
  };

  const handleWithdraw = async () => {
    if (numAmount < 1) return;
    setLoading(true);
    try {
      const res = await fetch('/api/game/bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'withdraw', amount: numAmount }),
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
        <h2 className="text-xl font-bold text-white">Bank</h2>
        <p className="mt-1 text-sm text-zinc-500">Deposit up to 75% of your total cash to keep it safe from attacks.</p>
      </motion.div>

      {/* Balance overview */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="border-white/[0.06] bg-white/[0.02]">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-zinc-500">Pocket Cash</p>
            <p className="mt-1 text-xl font-bold text-emerald-400">{formatCash(player.cash)}</p>
          </CardContent>
        </Card>
        <Card className="border-white/[0.06] bg-white/[0.02]">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-zinc-500">Bank Balance</p>
            <p className="mt-1 text-xl font-bold text-cyan-400">{formatCash(player.bank)}</p>
          </CardContent>
        </Card>
        <Card className="border-white/[0.06] bg-white/[0.02]">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-zinc-500">Total Wealth</p>
            <p className="mt-1 text-xl font-bold text-[#d4af37]">{formatCash(totalCash)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Deposit/Withdraw */}
      <Card className="border-white/[0.06] bg-white/[0.02]">
        <CardHeader className="pb-2">
          <h3 className="text-sm font-semibold text-zinc-300">Transactions</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-zinc-400">Amount</label>
              <Input
                type="number"
                min={1}
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="border-white/[0.08] bg-white/[0.03] text-white"
              />
              <p className="mt-1 text-xs text-zinc-500">
                Max deposit: {formatCash(maxDeposit)} • Max withdraw: {formatCash(player.bank)}
              </p>
            </div>
            <div className="flex gap-2">
              {[maxDeposit, Math.floor(maxDeposit * 0.5), Math.floor(maxDeposit * 0.25)].map((v, i) => (
                <Button key={i} variant="outline" size="sm"
                  onClick={() => setAmount(String(Math.max(0, v)))}
                  disabled={v <= 0}
                  className="border-white/[0.08] text-xs text-zinc-400 hover:text-white">
                  {i === 0 ? 'Max' : i === 1 ? '50%' : '25%'}
                </Button>
              ))}
              <Button variant="outline" size="sm"
                onClick={() => setAmount(String(player.bank))}
                disabled={player.bank <= 0}
                className="border-white/[0.08] text-xs text-zinc-400 hover:text-white">
                All Bank
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleDeposit}
                disabled={loading || numAmount < 1}
                className="flex-1 bg-emerald-600 font-bold text-white hover:bg-emerald-700"
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : '🏦'}
                Deposit
              </Button>
              <Button
                onClick={handleWithdraw}
                disabled={loading || numAmount < 1}
                className="flex-1 border border-amber-500/30 bg-amber-500/10 font-bold text-amber-400 hover:bg-amber-500/20"
              >
                💸 Withdraw
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
