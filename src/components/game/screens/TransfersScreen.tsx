'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useGameStore } from '@/lib/game-store';
import { formatCash, formatNumber } from '@/lib/format';
import { Loader2, ArrowLeftRight, Search } from 'lucide-react';

export default function TransfersScreen() {
  const { player, addToast, refreshPlayer } = useGameStore();
  const [type, setType] = useState<'cash' | 'food' | 'weapons'>('cash');
  const [amount, setAmount] = useState('');
  const [quantity, setQuantity] = useState('');
  const [targetUsername, setTargetUsername] = useState('');
  const [targetId, setTargetId] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const loadHistory = useCallback(async () => {
    const res = await fetch('/api/game/transfers');
    const data = await res.json();
    setHistory(data.transfers || []);
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  if (!player) return null;

  const handleSearch = async () => {
    if (!targetUsername.trim()) return;
    const res = await fetch('/api/game/players');
    const data = await res.json();
    const found = data.players?.find((p: any) => p.username.toLowerCase() === targetUsername.toLowerCase());
    if (found) {
      setTargetId(found.id);
      addToast(`Found: ${found.username}`, 'info');
    } else {
      addToast('Player not found', 'error');
    }
  };

  const handleTransfer = async () => {
    if (!targetId) { addToast('Search for a player first', 'error'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/game/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send', targetId, type,
          amount: parseInt(amount) || 0,
          quantity: parseInt(quantity) || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) { addToast(data.error, 'error'); return; }
      addToast(data.message, 'success');
      setAmount(''); setQuantity(''); setTargetUsername(''); setTargetId('');
      refreshPlayer(); loadHistory();
    } catch { addToast('Network error', 'error'); }
    finally { setLoading(false); }
  };

  const getBalance = () => {
    switch (type) {
      case 'cash': return formatCash(player.cash);
      case 'food': return formatNumber(player.food);
      case 'weapons': return formatNumber(player.weapons);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-bold text-white">Transfers</h2>
        <p className="mt-1 text-sm text-zinc-500">Send resources to family or union members.</p>
      </motion.div>

      <Card className="border-white/[0.06] bg-white/[0.02]">
        <CardHeader className="pb-2">
          <h3 className="text-sm font-semibold text-zinc-300">Send Resources</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input value={targetUsername} onChange={e => setTargetUsername(e.target.value)}
                placeholder="Recipient username" className="flex-1 border-white/[0.08] bg-white/[0.03] text-white" />
              <Button onClick={handleSearch} variant="outline" className="border-white/[0.08] text-zinc-400">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            {targetId && <p className="text-xs text-emerald-400">Player found!</p>}

            <div className="flex gap-2">
              {(['cash', 'food', 'weapons'] as const).map(t => (
                <Button key={t} variant={type === t ? 'default' : 'outline'} size="sm"
                  onClick={() => setType(t)}
                  className={type === t ? 'bg-[#d4af37] text-black' : 'border-white/[0.08] text-zinc-400'}>
                  {t === 'cash' ? '💵' : t === 'food' ? '🍕' : '🔫'} {t.charAt(0).toUpperCase() + t.slice(1)}
                </Button>
              ))}
            </div>

            <p className="text-xs text-zinc-500">Your {type}: <span className="font-bold text-white">{getBalance()}</span></p>

            {type === 'cash' ? (
              <Input type="number" min={1} value={amount} onChange={e => setAmount(e.target.value)}
                placeholder="Amount" className="border-white/[0.08] bg-white/[0.03] text-white" />
            ) : (
              <Input type="number" min={1} value={quantity} onChange={e => setQuantity(e.target.value)}
                placeholder="Quantity" className="border-white/[0.08] bg-white/[0.03] text-white" />
            )}

            <Button onClick={handleTransfer} disabled={loading || !targetId}
              className="w-full bg-emerald-600 text-white hover:bg-emerald-700">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowLeftRight className="mr-2 h-4 w-4" />} Send
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/[0.06] bg-white/[0.02]">
        <CardHeader className="pb-2"><h3 className="text-sm font-semibold text-zinc-300">Recent Transfers</h3></CardHeader>
        <CardContent>
          <div className="max-h-64 space-y-1 overflow-y-auto">
            {history.length === 0 && <p className="text-xs text-zinc-500">No transfers yet.</p>}
            {history.map((t: any) => (
              <div key={t.id} className="flex items-center justify-between rounded-lg px-2 py-1 text-xs">
                <div className="text-zinc-400">
                  {t.fromId === player.id ? (
                    <span>Sent to <span className="font-medium text-white">{t.to.username}</span></span>
                  ) : (
                    <span>Received from <span className="font-medium text-white">{t.from.username}</span></span>
                  )}
                </div>
                <span className={t.fromId === player.id ? 'text-red-400' : 'text-emerald-400'}>
                  {t.fromId === player.id ? '-' : '+'}{t.type === 'cash' ? formatCash(t.amount) : `${t.quantity} ${t.type}`}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
