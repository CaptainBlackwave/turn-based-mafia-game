import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashToken } from '@/lib/session';
import { cookies } from 'next/headers';

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

export async function POST(req: NextRequest) {
  try {
    const player = await getSession();
    if (!player) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { type, turns: turnsToSpend } = await req.json();
    if (!type || !turnsToSpend || turnsToSpend < 1) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    if (player.turns < turnsToSpend) {
      return NextResponse.json({ error: 'Not enough turns' }, { status: 400 });
    }

    let unitsGained = 0;
    for (let i = 0; i < turnsToSpend; i++) {
      unitsGained += Math.floor(Math.random() * 5) + 1;
    }

    const updated = await db.player.update({
      where: { id: player.id },
      data: {
        turns: { decrement: turnsToSpend },
        ...(type === 'operative' ? { operatives: { increment: unitsGained } } : {}),
        ...(type === 'soldier' ? { soldiers: { increment: unitsGained } } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Scouted ${unitsGained} ${type}${unitsGained > 1 ? 's' : ''}`,
      unitsGained,
      turnsUsed: turnsToSpend,
      player: {
        ...updated,
        turns: updated.turns,
        operatives: updated.operatives,
        soldiers: updated.soldiers,
      },
    });
  } catch (err) {
    console.error('Hire error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
