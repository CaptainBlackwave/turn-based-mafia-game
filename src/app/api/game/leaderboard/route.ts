import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculateNetworth } from '@/lib/game-engine';

export async function GET() {
  try {
    const players = await db.player.findMany({
      where: { isBot: false },
      orderBy: { cash: 'desc' },
    });

    const ranked = players.map(p => ({
      id: p.id,
      username: p.username,
      city: p.city,
      networth: calculateNetworth(p),
      operatives: p.operatives,
      soldiers: p.soldiers,
    })).sort((a, b) => b.networth - a.networth);

    return NextResponse.json({ players: ranked });
  } catch (err) {
    console.error('Leaderboard error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
