'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useGameStore } from '@/lib/game-store';
import { formatCash, formatNumber } from '@/lib/format';
import { Loader2, Crown, Trash2, CreditCard, Zap, ArrowUp, Users } from 'lucide-react';

export default function AdminScreen() {
  const { player, addToast, refreshPlayer } = useGameStore();
  const [tab, setTab] = useState<'rounds' | 'players' | 'bots' | 'settings'>('rounds');

  if (!player?.isAdmin) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Crown className="mx-auto h-12 w-12 text-red-500/50" />
          <p className="mt-4 text-lg font-bold text-white">Admin Access Required</p>
          <p className="mt-1 text-sm text-zinc-500">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-bold text-white">Admin Panel</h2>
        <p className="mt-1 text-sm text-zinc-500">Manage rounds, players, bots, and game settings.</p>
      </motion.div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {(['rounds', 'players', 'bots', 'settings'] as const).map(t => (
          <Button
            key={t}
            variant={tab === t ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTab(t)}
            className={tab === t ? 'bg-[#d4af37] text-black' : 'border-white/[0.08] text-zinc-400 hover:text-white'}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </Button>
        ))}
      </div>

      {tab === 'rounds' && <RoundsTab />}
      {tab === 'players' && <PlayersTab />}
      {tab === 'bots' && <BotsTab />}
      {tab === 'settings' && <SettingsTab />}
    </div>
  );
}

function RoundsTab() {
  const [rounds, setRounds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const addToast = useGameStore(s => s.addToast);

  const loadRounds = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/rounds');
    const data = await res.json();
    setRounds(data.rounds || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadRounds(); }, [loadRounds]);

  const handleAction = async (action: string, roundId?: string) => {
    const res = await fetch('/api/admin/rounds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, roundId, name: newName }),
    });
    const data = await res.json();
    if (res.ok) { addToast(data.message || `Action: ${action}`, 'success'); loadRounds(); }
    else addToast(data.error, 'error');
    setNewName('');
  };

  return (
    <div className="space-y-4">
      <Card className="border-white/[0.06] bg-white/[0.02]">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Round name (optional)" className="flex-1 border-white/[0.08] bg-white/[0.03] text-white" />
            <Button onClick={() => handleAction('create')} className="bg-emerald-600 text-white hover:bg-emerald-700">Create Round</Button>
          </div>
        </CardContent>
      </Card>

      {loading ? <p className="text-center text-zinc-500">Loading...</p> : rounds.map(round => (
        <Card key={round.id} className="border-white/[0.06] bg-white/[0.02]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white">{round.name}</h3>
                <p className="text-xs text-zinc-500">
                  Round #{round.number} • Status: <Badge variant={round.status === 'active' ? 'default' : 'outline'} className={round.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : ''}>{round.status}</Badge>
                </p>
                {round.startedAt && <p className="text-xs text-zinc-600">Started: {new Date(round.startedAt).toLocaleString()}</p>}
              </div>
              <div className="flex gap-1">
                {round.status === 'upcoming' && (
                  <Button size="sm" onClick={() => handleAction('start', round.id)} className="bg-emerald-600 text-white hover:bg-emerald-700">Start</Button>
                )}
                {round.status === 'active' && (
                  <>
                    <Button size="sm" onClick={() => handleAction('reset_players', round.id)} variant="outline" className="border-amber-500/20 text-amber-400">Reset Players</Button>
                    <Button size="sm" onClick={() => handleAction('end', round.id)} className="bg-red-600 text-white hover:bg-red-700">End</Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function PlayersTab() {
  const [players, setPlayers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const addToast = useGameStore(s => s.addToast);

  const loadPlayers = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/players?search=${encodeURIComponent(search)}`);
    const data = await res.json();
    setPlayers(data.players || []);
    setLoading(false);
  }, [search]);

  useEffect(() => { loadPlayers(); }, [loadPlayers]);

  const handleAction = async (action: string, playerId: string, data: any = {}) => {
    const res = await fetch('/api/admin/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, playerId, data }),
    });
    const resp = await res.json();
    if (res.ok) addToast(resp.message || 'Done', 'success');
    else addToast(resp.error, 'error');
    loadPlayers();
  };

  return (
    <div className="space-y-4">
      <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search players..." className="border-white/[0.08] bg-white/[0.03] text-white" />
      <div className="max-h-[600px] overflow-y-auto space-y-2">
        {loading ? <p className="text-center text-zinc-500">Loading...</p> : players.map(p => (
          <Card key={p.id} className="border-white/[0.06] bg-white/[0.02]">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{p.username}</span>
                    {p.isAdmin && <Badge className="bg-[#d4af37]/10 text-[#d4af37] border-[#d4af37]/20 text-[10px]">ADMIN</Badge>}
                    {p.isBot && <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px]">BOT</Badge>}
                    <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[10px]">{p.subscriptionTier}</Badge>
                  </div>
                  <p className="text-xs text-zinc-500">NW: {formatCash(p.networth)} • Cash: {formatCash(p.cash)} • Turns: {p.turns}</p>
                </div>
                <div className="flex gap-1">
                  {!p.isBot && (
                    <Button size="sm" variant="outline" onClick={() => handleAction('grant_credits', p.id, { amount: 100 })}
                      className="border-cyan-500/20 text-[10px] text-cyan-400">+100 Credits</Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => handleAction('grant_turns', p.id, { amount: 500 })}
                    className="border-amber-500/20 text-[10px] text-amber-400">+500 Turns</Button>
                  {!p.isAdmin && !p.isBot && (
                    <Button size="sm" variant="outline" onClick={() => handleAction('set_admin', p.id, { isAdmin: true })}
                      className="border-purple-500/20 text-[10px] text-purple-400">Make Admin</Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function BotsTab() {
  const [bots, setBots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const addToast = useGameStore(s => s.addToast);

  const loadBots = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/bots');
    const data = await res.json();
    setBots(data.bots || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadBots(); }, [loadBots]);

  const handleAction = async (action: string, data: any = {}) => {
    const res = await fetch('/api/admin/bots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...data }),
    });
    const resp = await res.json();
    if (res.ok) addToast(resp.message || 'Done', 'success');
    else addToast(resp.error, 'error');
    loadBots();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={() => handleAction('seed')} className="bg-emerald-600 text-white hover:bg-emerald-700">Seed Bots (20)</Button>
        <Button onClick={() => handleAction('reset_bots', { highPower: false })} variant="outline" className="border-amber-500/20 text-amber-400">Reset Normal</Button>
        <Button onClick={() => handleAction('reset_bots', { highPower: true })} variant="outline" className="border-red-500/20 text-red-400">Reset High Power</Button>
        <Button onClick={() => handleAction('delete_all')} variant="outline" className="border-red-500/20 text-red-400">Delete All</Button>
        <Button onClick={async () => {
          const res = await fetch('/api/bot-tick', { method: 'POST' });
          const data = await res.json();
          addToast(`Bot tick: ${data.actions?.length || 0} actions`, 'info');
        }} variant="outline" className="border-cyan-500/20 text-cyan-400">Run Bot Tick</Button>
      </div>

      {loading ? <p className="text-center text-zinc-500">Loading...</p> : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {bots.map((bot, i) => {
            const cls = Math.floor(i / 5);
            const classNames = ['Class A', 'Class B', 'Class C', 'Class D'];
            const classColors = ['text-amber-400', 'text-emerald-400', 'text-cyan-400', 'text-zinc-400'];
            return (
              <Card key={bot.id} className="border-white/[0.06] bg-white/[0.02]">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white truncate">{bot.username}</span>
                    <Badge className={`${classColors[cls]} bg-white/[0.04] text-[10px]`}>{classNames[cls]}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">💼{bot.operatives} 🛡️{bot.soldiers} 🔫{bot.weapons}</p>
                  <p className="text-xs text-zinc-600">📍{bot.city}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SettingsTab() {
  const [settings, setSettings] = useState<any>(null);
  const [roundInfo, setRoundInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const addToast = useGameStore(s => s.addToast);

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then(data => {
      setSettings(data.settings);
      setRoundInfo({ id: data.roundId, name: data.roundName, number: data.roundNumber });
      setLoading(false);
    });
  }, []);

  const updateSetting = (path: string, value: any) => {
    setSettings(prev => {
      const newSettings = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let obj: any = newSettings;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  const saveSettings = async () => {
    if (!roundInfo?.id) { addToast('No active round to save settings to', 'error'); return; }
    setSaving(true);
    const res = await fetch('/api/admin/rounds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_settings', roundId: roundInfo.id, settings }),
    });
    const data = await res.json();
    if (res.ok) addToast('Settings saved', 'success');
    else addToast(data.error, 'error');
    setSaving(false);
  };

  if (loading || !settings) return <p className="text-center text-zinc-500">Loading settings...</p>;

  const SettingRow = ({ label, path, value, type = 'number' }: { label: string; path: string; value: any; type?: string }) => (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-zinc-400">{label}</span>
      {type === 'toggle' ? (
        <button
          onClick={() => updateSetting(path, !value)}
          className={`rounded-md px-2 py-0.5 text-xs font-medium ${value ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}
        >
          {value ? 'ON' : 'OFF'}
        </button>
      ) : (
        <Input
          type="number"
          value={value}
          onChange={e => updateSetting(path, parseFloat(e.target.value) || 0)}
          className="w-32 border-white/[0.08] bg-white/[0.03] text-right text-xs text-white"
        />
      )}
    </div>
  );

  const TierRow = ({ label, path }: { label: string; path: string }) => (
    <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-3">
      <p className="mb-2 text-xs font-semibold text-zinc-300">{label}</p>
      {['Free', 'Titanium', 'Diamond', 'Onyx'].map(tier => (
        <SettingRow key={tier} label={tier} path={`${path}.${tier}`} value={settings[path]?.[tier] || 0} />
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      {roundInfo?.id && (
        <p className="text-sm text-zinc-400">Editing: <span className="text-[#d4af37] font-bold">{roundInfo.name}</span> (Round #{roundInfo.number})</p>
      )}
      {!roundInfo?.id && <p className="text-sm text-amber-400">No active round. Create and start a round first.</p>}

      <Card className="border-white/[0.06] bg-white/[0.02]">
        <CardHeader className="pb-2"><h3 className="text-sm font-semibold text-zinc-300">Starting Values</h3></CardHeader>
        <CardContent>
          <TierRow label="Starting Turns" path="startingTurns" />
          <TierRow label="Starting Reserves" path="startingReserves" />
        </CardContent>
      </Card>

      <Card className="border-white/[0.06] bg-white/[0.02]">
        <CardHeader className="pb-2"><h3 className="text-sm font-semibold text-zinc-300">Game Rules</h3></CardHeader>
        <CardContent className="space-y-2">
          <TierRow label="Max Turns" path="maxTurns" />
          <TierRow label="Regen per 10min" path="regenPer10min" />
          <SettingRow label="Round Credit Cap" path="roundCreditCap" value={settings.roundCreditCap} />
          <SettingRow label="Daily Credit Cap" path="dailyCreditCap" value={settings.dailyCreditCap} />
          <SettingRow label="Banking % of Net Worth" path="bankingPercentOfNW" value={settings.bankingPercentOfNW} />
          <SettingRow label="Maxing % per Hour" path="maxingPercentPerHour" value={settings.maxingPercentPerHour} />
          <SettingRow label="Turns per Credit Redeemed" path="turnsPerCreditRedeemed" value={settings.turnsPerCreditRedeemed} />
        </CardContent>
      </Card>

      <Card className="border-white/[0.06] bg-white/[0.02]">
        <CardHeader className="pb-2"><h3 className="text-sm font-semibold text-zinc-300">Combat & Range</h3></CardHeader>
        <CardContent className="space-y-2">
          <SettingRow label="Range ABOVE Multiplier (0=OFF)" path="rangeAboveMultiplier" value={settings.rangeAboveMultiplier} />
          <SettingRow label="Range BELOW Multiplier (0=OFF)" path="rangeBelowMultiplier" value={settings.rangeBelowMultiplier} />
          <SettingRow label="Personal Bank Steal %" path="personalBankStealPct" value={settings.personalBankStealPct} />
          <SettingRow label="Family Bank Steal %" path="familyBankStealPct" value={settings.familyBankStealPct} />
          <SettingRow label="Union Bank Steal %" path="unionBankStealPct" value={settings.unionBankStealPct} />
        </CardContent>
      </Card>

      <Card className="border-white/[0.06] bg-white/[0.02]">
        <CardHeader className="pb-2"><h3 className="text-sm font-semibold text-zinc-300">Unions & Transfers</h3></CardHeader>
        <CardContent className="space-y-2">
          <SettingRow label="Union Ranks" path="unionRanksEnabled" value={settings.unionRanksEnabled} type="toggle" />
          <SettingRow label="Transfers (Family & Union)" path="transfersEnabled" value={settings.transfersEnabled} type="toggle" />
        </CardContent>
      </Card>

      <Card className="border-white/[0.06] bg-white/[0.02]">
        <CardHeader className="pb-2"><h3 className="text-sm font-semibold text-zinc-300">Bot Settings</h3></CardHeader>
        <CardContent className="space-y-2">
          <SettingRow label="Bots Auto-Accept Family Invites" path="botsAutoAcceptFamilyInvites" value={settings.botsAutoAcceptFamilyInvites} type="toggle" />
        </CardContent>
      </Card>

      <Card className="border-white/[0.06] bg-white/[0.02]">
        <CardHeader className="pb-2"><h3 className="text-sm font-semibold text-zinc-300">Gambling</h3></CardHeader>
        <CardContent className="space-y-2">
          <SettingRow label="Coin Flip Max Bet" path="gambling.coinFlip.maxBet" value={settings.gambling?.coinFlip?.maxBet || 0} />
          <SettingRow label="Coin Flip Max Bets/Day" path="gambling.coinFlip.maxBetsPerDay" value={settings.gambling?.coinFlip?.maxBetsPerDay || 0} />
          <SettingRow label="Blackjack Max Bet" path="gambling.blackjack.maxBet" value={settings.gambling?.blackjack?.maxBet || 0} />
          <SettingRow label="Roulette Max Bet" path="gambling.roulette.maxBet" value={settings.gambling?.roulette?.maxBet || 0} />
          <SettingRow label="Roulette Max Bets/Day" path="gambling.roulette.maxBetsPerDay" value={settings.gambling?.roulette?.maxBetsPerDay || 0} />
          <SettingRow label="Horse Race Max Bet" path="gambling.horseRace.maxBet" value={settings.gambling?.horseRace?.maxBet || 0} />
          <SettingRow label="Horse Race Max Bets/Day" path="gambling.horseRace.maxBetsPerDay" value={settings.gambling?.horseRace?.maxBetsPerDay || 0} />
        </CardContent>
      </Card>

      <Button onClick={saveSettings} disabled={saving || !roundInfo?.id} className="w-full bg-[#d4af37] font-bold text-black hover:bg-[#c4a030]">
        {saving ? 'Saving...' : 'Save Settings'}
      </Button>
    </div>
  );
}
