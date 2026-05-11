'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useGameStore } from '@/lib/game-store';
import { formatCash } from '@/lib/format';
import { Loader2, Users, Plus, LogOut, Crown } from 'lucide-react';

interface FamilyInfo {
  id: string;
  name: string;
  boss: { id: string; username: string };
  city: string;
  memberCount: number;
  members: { id: string; username: string }[];
}

export default function FamilyScreen() {
  const { player, addToast, refreshPlayer } = useGameStore();
  const [families, setFamilies] = useState<FamilyInfo[]>([]);
  const [newFamilyName, setNewFamilyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingFamilies, setLoadingFamilies] = useState(true);

  const loadFamilies = async () => {
    setLoadingFamilies(true);
    try {
      const res = await fetch('/api/game/families');
      const data = await res.json();
      setFamilies(data.families || []);
    } catch { /* silent */ }
    setLoadingFamilies(false);
  };

  useEffect(() => { loadFamilies(); }, []);

  if (!player) return null;

  const myFamily = families.find(f => f.members.some(m => m.id === player.id));
  const availableFamilies = families.filter(f => !myFamily || f.id !== myFamily.id);

  const handleCreate = async () => {
    if (!newFamilyName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/game/families', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', familyName: newFamilyName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { addToast(data.error, 'error'); return; }
      addToast(data.message, 'success');
      setNewFamilyName('');
      refreshPlayer();
      loadFamilies();
    } catch { addToast('Network error', 'error'); }
    finally { setLoading(false); }
  };

  const handleJoin = async (familyId: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/game/families', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'join', familyId }),
      });
      const data = await res.json();
      if (!res.ok) { addToast(data.error, 'error'); return; }
      addToast(data.message, 'success');
      refreshPlayer();
      loadFamilies();
    } catch { addToast('Network error', 'error'); }
    finally { setLoading(false); }
  };

  const handleLeave = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/game/families', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'leave' }),
      });
      const data = await res.json();
      if (!res.ok) { addToast(data.error, 'error'); return; }
      addToast(data.message, 'success');
      refreshPlayer();
      loadFamilies();
    } catch { addToast('Network error', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-bold text-white">Family</h2>
        <p className="mt-1 text-sm text-zinc-500">Join a family for protection, or create your own.</p>
      </motion.div>

      {/* Current Family */}
      {myFamily ? (
        <Card className="border-[#d4af37]/20 bg-[#d4af37]/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#d4af37]">
                <Crown className="mr-1 inline h-4 w-4" />
                {myFamily.name}
              </h3>
              <Badge className="border-white/[0.08] bg-white/[0.04] text-zinc-400">
                {myFamily.memberCount} member{myFamily.memberCount !== 1 ? 's' : ''}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-3 space-y-1">
              <p className="text-xs text-zinc-400">
                Boss: <span className="font-medium text-white">{myFamily.boss.username}</span>
              </p>
              <p className="text-xs text-zinc-400">
                City: <span className="font-medium text-white">{myFamily.city}</span>
              </p>
            </div>
            <div className="mb-3 max-h-32 space-y-1 overflow-y-auto">
              {myFamily.members.map(m => (
                <div key={m.id} className="flex items-center gap-2 text-xs">
                  {m.id === myFamily.boss.id && <Crown className="h-3 w-3 text-[#d4af37]" />}
                  <span className="text-zinc-300">{m.username}</span>
                  {m.id === player.id && <Badge className="border-white/[0.08] bg-white/[0.04] text-[10px] text-zinc-500">You</Badge>}
                </div>
              ))}
            </div>
            <Button
              onClick={handleLeave}
              disabled={loading}
              className="w-full border border-red-500/30 bg-red-500/10 font-medium text-red-400 hover:bg-red-500/20"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
              {myFamily.boss.id === player.id ? 'Disband Family' : 'Leave Family'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Create Family */
        <Card className="border-white/[0.06] bg-white/[0.02]">
          <CardHeader className="pb-2">
            <h3 className="text-sm font-semibold text-zinc-300">Create a Family</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Input
                value={newFamilyName}
                onChange={e => setNewFamilyName(e.target.value)}
                placeholder="Family name"
                maxLength={30}
                className="border-white/[0.08] bg-white/[0.03] text-white placeholder:text-zinc-600"
              />
              <Button
                onClick={handleCreate}
                disabled={loading || !newFamilyName.trim()}
                className="w-full bg-[#d4af37] font-bold text-black hover:bg-[#c4a030]"
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Create Family
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Families */}
      {!myFamily && availableFamilies.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-zinc-400">Available Families</h3>
          {loadingFamilies ? (
            <div className="flex items-center justify-center py-8 text-zinc-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...
            </div>
          ) : (
            <div className="max-h-96 space-y-2 overflow-y-auto">
              {availableFamilies.map(f => (
                <Card key={f.id} className="border-white/[0.06] bg-white/[0.02]">
                  <CardContent className="flex items-center justify-between p-3">
                    <div>
                      <p className="text-sm font-medium text-white">{f.name}</p>
                      <p className="text-xs text-zinc-500">
                        Boss: {f.boss.username} • {f.memberCount} members • {f.city}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleJoin(f.id)}
                      disabled={loading}
                      className="border-[#d4af37]/20 bg-[#d4af37]/10 text-xs font-medium text-[#d4af37] hover:bg-[#d4af37]/20"
                    >
                      Join
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
