'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useGameStore } from '@/lib/game-store';
import { formatCash, formatNumber } from '@/lib/format';
import { Loader2, Shield, Plus, LogOut, Crown, Users } from 'lucide-react';

interface UnionInfo {
  id: string;
  name: string;
  bank: number;
  leader: { id: string; username: string };
  memberCount: number;
  members: { id: string; username: string; unionRank: string }[];
  familyCount: number;
  families: any[];
}

export default function UnionScreen() {
  const { player, addToast, refreshPlayer } = useGameStore();
  const [unions, setUnions] = useState<UnionInfo[]>([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);

  const loadUnions = useCallback(async () => {
    const res = await fetch('/api/game/unions');
    const data = await res.json();
    setUnions(data.unions || []);
  }, []);

  useEffect(() => { loadUnions(); }, [loadUnions]);

  if (!player) return null;

  const myUnion = unions.find(u => u.members.some(m => m.id === player.id));

  const handleAction = async (action: string, extra: any = {}) => {
    setLoading(true);
    try {
      const res = await fetch('/api/game/unions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...extra }),
      });
      const data = await res.json();
      if (!res.ok) { addToast(data.error, 'error'); return; }
      addToast(data.message, 'success');
      setNewName('');
      refreshPlayer();
      loadUnions();
    } catch { addToast('Network error', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-bold text-white">Unions</h2>
        <p className="mt-1 text-sm text-zinc-500">Alliances of families working together for dominance.</p>
      </motion.div>

      {myUnion ? (
        <Card className="border-[#d4af37]/20 bg-[#d4af37]/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#d4af37]">
                <Shield className="mr-1 inline h-4 w-4" /> {myUnion.name}
              </h3>
              <Badge className="border-white/[0.08] bg-white/[0.04] text-zinc-400">
                {myUnion.memberCount} members • {myUnion.familyCount} families
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-2 text-xs text-zinc-400">
              Leader: <span className="font-medium text-white">{myUnion.leader.username}</span>
            </p>
            <p className="mb-2 text-xs text-zinc-400">
              Union Bank: <span className="font-medium text-emerald-400">{formatCash(myUnion.bank)}</span>
            </p>
            <div className="mb-3 max-h-32 space-y-1 overflow-y-auto">
              {myUnion.members.map(m => (
                <div key={m.id} className="flex items-center gap-2 text-xs">
                  {m.id === myUnion.leader.id && <Crown className="h-3 w-3 text-[#d4af37]" />}
                  <span className="text-zinc-300">{m.username}</span>
                  <Badge className="border-white/[0.06] bg-white/[0.03] text-[9px] text-zinc-500">{m.unionRank}</Badge>
                  {m.id === player.id && <Badge className="border-white/[0.08] bg-white/[0.04] text-[9px] text-zinc-500">You</Badge>}
                </div>
              ))}
            </div>
            <Button onClick={() => handleAction('leave')} disabled={loading}
              className="w-full border border-red-500/30 bg-red-500/10 font-medium text-red-400 hover:bg-red-500/20">
              {myUnion.leader.id === player.id ? 'Disband Union' : 'Leave Union'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-white/[0.06] bg-white/[0.02]">
          <CardHeader className="pb-2"><h3 className="text-sm font-semibold text-zinc-300">Create a Union</h3></CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Union name"
                maxLength={30} className="border-white/[0.08] bg-white/[0.03] text-white placeholder:text-zinc-600" />
              <Button onClick={() => handleAction('create')} disabled={loading || !newName.trim()}
                className="w-full bg-[#d4af37] font-bold text-black hover:bg-[#c4a030]">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />} Create Union
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!myUnion && unions.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-zinc-400">Available Unions</h3>
          <div className="space-y-2">
            {unions.map(u => (
              <Card key={u.id} className="border-white/[0.06] bg-white/[0.02]">
                <CardContent className="flex items-center justify-between p-3">
                  <div>
                    <p className="text-sm font-medium text-white">{u.name}</p>
                    <p className="text-xs text-zinc-500">
                      Leader: {u.leader.username} • {u.memberCount} members • {u.familyCount} families
                    </p>
                  </div>
                  <Button size="sm" onClick={() => handleAction('join', { unionId: u.id })} disabled={loading}
                    className="border-[#d4af37]/20 bg-[#d4af37]/10 text-xs font-medium text-[#d4af37] hover:bg-[#d4af37]/20">
                    Join
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
