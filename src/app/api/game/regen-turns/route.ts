import { NextResponse } from 'next/server';
import { getSession } from '@/lib/api-auth';
import { calculateTurnRegen, REGEN_INTERVAL_MS } from '@/lib/game-engine';
import { deserializeSettings, getTieredValue } from '@/lib/settings';
import { db } from '@/lib/db';

export async function POST() {
  try {
    const player = await getSession();
    if (!player) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const now = new Date();
    const tier = (player.subscriptionTier || 'Free') as 'Free' | 'Titanium' | 'Diamond' | 'Onyx';

    const activeRound = await db.round.findFirst({ where: { status: 'active' } });
    const settings = activeRound ? deserializeSettings(activeRound.settings) : null;
    const regenRate = settings ? getTieredValue(settings.regenPer10min, tier) : 5;
    const maxTurns = settings ? getTieredValue(settings.maxTurns, tier) : 500;

    const turnsToRegen = calculateTurnRegen(player.lastMaxCheck, now, regenRate);

    if (turnsToRegen <= 0) {
      return NextResponse.json({ message: 'No turns to regenerate', turnsRegen: 0 });
    }

    const newTurns = Math.min(player.turns + turnsToRegen, maxTurns);

    const updated = await db.player.update({
      where: { id: player.id },
      data: {
        turns: newTurns,
        lastMaxCheck: now,
      },
    });

    return NextResponse.json({
      message: `Regenerated ${newTurns - player.turns} turns`,
      turnsRegen: newTurns - player.turns,
      totalTurns: newTurns,
      player: { ...updated, turns: updated.turns },
    });
  } catch (err) {
    console.error('Regen turns error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
