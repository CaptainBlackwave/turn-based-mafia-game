import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashToken } from '@/lib/session';
import { cookies } from 'next/headers';
import { MAX_TURNS, calculateTurnRegen } from '@/lib/game-engine';

async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  if (!token) return null;
  const hashedToken = hashToken(token);
  const session = await db.session.findUnique({
    where: { token: hashedToken },
    include: { player: true },
  });
  return session?.player ?? null;
}

// Also regen turns for bots
export async function POST() {
  try {
    const player = await getSession();
    if (!player) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const now = new Date();
    const turnsToRegen = calculateTurnRegen(player.lastMaxCheck, now);

    if (turnsToRegen <= 0) {
      return NextResponse.json({ message: 'No turns to regenerate', turnsRegen: 0 });
    }

    const newTurns = Math.min(player.turns + turnsToRegen, MAX_TURNS);

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
