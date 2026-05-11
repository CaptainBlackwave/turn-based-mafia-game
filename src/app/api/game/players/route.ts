import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashToken } from '@/lib/session';
import { cookies } from 'next/headers';
import { calculateNetworth, isInAttackRange } from '@/lib/game-engine';

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

export async function GET() {
  try {
    const player = await getSession();
    const players = await db.player.findMany({
      where: player ? { id: { not: player.id } } : {},
    });

    const myNW = player ? calculateNetworth(player) : 0;

    const playerList = players.map(p => {
      const nw = calculateNetworth(p);
      return {
        id: p.id,
        username: p.username,
        city: p.city,
        networth: nw,
        operatives: p.operatives,
        soldiers: p.soldiers,
        isBot: p.isBot,
        inRange: myNW > 0 ? isInAttackRange(myNW, nw) : false,
        sameCity: player ? p.city === player.city : false,
      };
    }).sort((a, b) => b.networth - a.networth);

    return NextResponse.json({ players: playerList });
  } catch (err) {
    console.error('Players error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
