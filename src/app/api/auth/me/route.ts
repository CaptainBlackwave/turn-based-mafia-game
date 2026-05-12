import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashToken } from '@/lib/session';
import { cookies } from 'next/headers';
import { calculateNetworth, calculateOpHappiness, calculateSoldierHappiness, MAX_TURNS, calculateTurnRegen } from '@/lib/game-engine';

function formatPlayer(player: any) {
  const now = new Date();
  // Regen turns
  const turnsToRegen = calculateTurnRegen(player.lastMaxCheck, now);
  const newTurns = Math.min(player.turns + turnsToRegen, MAX_TURNS);

  return {
    id: player.id,
    username: player.username,
    cash: player.cash,
    bank: player.bank,
    turns: newTurns,
    operatives: player.operatives,
    soldiers: player.soldiers,
    food: player.food,
    weapons: player.weapons,
    cars: player.cars,
    planes: player.planes,
    city: player.city,
    familyId: player.familyId,
    familyName: player.family?.name ?? null,
    protectedUntil: player.protectedUntil?.toISOString() ?? null,
    isBot: player.isBot,
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

    return NextResponse.json({ player: formatPlayer(session.player) });
  } catch (err) {
    console.error('Me error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
