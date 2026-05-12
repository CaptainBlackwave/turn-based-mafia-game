'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGameStore } from '@/lib/game-store';
import { BLACK_MARKET_ITEMS } from '@/lib/game-constants';
import { formatCash, formatNumber } from '@/lib/format';
import { Loader2 } from 'lucide-react';

export default function BlackMarketScreen() {
  const { player, addToast, refreshPlayer } = useGameStore();
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  if (!player) return null;

  const handleAction = async (action: 'buy' | 'sell') => {
    if (!selectedItem || quantity < 1) return;
    setLoading(true);
    try {
      const res = await fetch('/api/game/blackmarket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, itemId: selectedItem, quantity }),
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

  const allItems = [
    ...BLACK_MARKET_ITEMS.supplies.map(i => ({ ...i, category: 'Supplies' as const, field: i.id })),
    ...BLACK_MARKET_ITEMS.weapons.map(i => ({ ...i, category: 'Weapons' as const, field: i.id })),
    ...BLACK_MARKET_ITEMS.cars.map(i => ({ ...i, category: 'Cars' as const, field: i.id })),
    ...BLACK_MARKET_ITEMS.planes.map(i => ({ ...i, category: 'Planes' as const, field: i.id })),
  ];

  const getOwned = (itemId: string): number => {
    const map: Record<string, number> = {
      food: player.food,
      weapon: player.weapons,
      car: player.cars,
      plane: player.planes,
    };
    return map[itemId] || 0;
  };

  const selectedItemData = allItems.find(i => i.id === selectedItem);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-bold text-white">Black Market</h2>
        <p className="mt-1 text-sm text-zinc-500">Buy and sell supplies, weapons, cars, and planes.</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-zinc-500">Your cash:</span>
          <span className="text-sm font-bold text-emerald-400">{formatCash(player.cash)}</span>
        </div>
      </motion.div>

      {/* Item categories */}
      {(['Supplies', 'Weapons', 'Cars', 'Planes'] as const).map(category => (
        <div key={category}>
          <h3 className="mb-3 text-sm font-semibold text-zinc-400">{category}</h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {allItems.filter(i => i.category === category).map(item => (
              <button
                key={item.id}
                onClick={() => { setSelectedItem(item.id); setQuantity(1); }}
                className={`rounded-xl border p-3 text-left transition-all ${
                  selectedItem === item.id
                    ? 'border-[#d4af37]/30 bg-[#d4af37]/5'
                    : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{item.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{item.name}</p>
                    <p className="text-xs text-zinc-500">
                      Buy: {formatCash(item.buyPrice)} • Sell: {formatCash(item.sellPrice)}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Owned: <span className="font-medium text-white">{formatNumber(getOwned(item.id))}</span></span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Buy/Sell controls */}
      {selectedItemData && (
        <Card className="border-[#d4af37]/20 bg-[#d4af37]/5">
          <CardHeader className="pb-2">
            <h3 className="text-sm font-semibold text-[#d4af37]">
              {selectedItemData.icon} {selectedItemData.name}
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-zinc-400">Quantity</label>
                <Input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="border-white/[0.08] bg-white/[0.03] text-white"
                />
                <p className="mt-1 text-xs text-zinc-500">
                  Total buy: {formatCash(selectedItemData.buyPrice * quantity)} •
                  Total sell: {formatCash(selectedItemData.sellPrice * quantity)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleAction('buy')}
                  disabled={loading || player.cash < selectedItemData.buyPrice * quantity}
                  className="flex-1 bg-emerald-600 font-bold text-white hover:bg-emerald-700"
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : '💰'}
                  Buy
                </Button>
                <Button
                  onClick={() => handleAction('sell')}
                  disabled={loading || getOwned(selectedItemData.id) < quantity}
                  className="flex-1 border border-red-500/30 bg-red-500/10 font-bold text-red-400 hover:bg-red-500/20"
                >
                  💸 Sell
                </Button>
              </div>
              <div className="flex gap-2">
                {[1, 5, 10, 50, 100].map(q => (
                  <Button
                    key={q}
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(q)}
                    className="border-white/[0.08] text-xs text-zinc-400 hover:text-white"
                  >
                    {q}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
