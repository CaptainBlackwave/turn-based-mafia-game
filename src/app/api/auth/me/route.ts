import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashToken } from '@/lib/session';
import { cookies } from 'next/headers';
import { calculateNetworth, calculateOpHappiness, calculateSoldierHappiness, calculateTurnRegen } from '@/lib/game-engine';
import { deserializeSettings, getTieredValue } from '@/lib/settings';

function formatPlayer(player: any, settings: any): any {
  const now = new Date();
  const tier = (player.subscriptionTier || 'Free') as 'Free' | 'Titanium' | 'Diamond' | 'Onyx';
  const maxTurns = settings ? getTieredValue(settings.maxTurns, tier) : 500;
  const regenRate = settings ? getTieredValue(settings.regenPer10min, tier) : 5;

  const turnsToRegen = calculateTurnRegen(player.lastMaxCheck, now, regenRate);
  const newTurns = Math.min(player.turns + turnsToRegen, maxTurns);

  return {
    id: player.id,
    username: player.username,
    cash: player.cash,
    bank: player.bank,
    turns: newTurns,
    maxTurns,
    reserves: player.reserves || 0,
    credits: player.credits || 0,
    operatives: player.operatives,
    soldiers: player.soldiers,
    food: player.food,
    weapons: player.weapons,
    cars: player.cars,
    planes: player.planes,
    city: player.city,
    familyId: player.familyId,
    familyName: player.family?.name ?? null,
    unionId: player.unionId ?? null,
    subscriptionTier: tier,
    isAdmin: player.isAdmin || false,
    isBot: player.isBot,
    protectedUntil: player.protectedUntil?.toISOString() ?? null,
    networth: calculateNetworth(player),
    opHappiness: calculateOpHappiness(player),
    soldierHappiness: calculateSoldierHappiness(player),
  };
}

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) {
      return NextResponse.json({ player: null }, { status: 200 });
    }

    const hashedToken = hashToken(token);
    const session = await db.session.findUnique({
      where: { token: hashedToken },
      include: { player: { include: { family: true } } },
    });

    if (!session) {
      return NextResponse.json({ player: null }, { status: 200 });
    }

    // Get active round settings
    const activeRound = await db.round.findFirst({ where: { status: 'active' } });
    const settings = activeRound ? deserializeSettings(activeRound.settings) : null;

    return NextResponse.json({ player: formatPlayer(session.player, settings) });
  } catch (err) {
    console.error('Me error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
