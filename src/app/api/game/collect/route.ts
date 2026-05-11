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

    const { turns: turnsToUse } = await req.json();
    if (!turnsToUse || turnsToUse < 1) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    if (player.turns < turnsToUse) {
      return NextResponse.json({ error: 'Not enough turns' }, { status: 400 });
    }

    if (player.operatives === 0) {
      return NextResponse.json({ error: 'No operatives to collect from' }, { status: 400 });
    }

    const collected = 200 * player.operatives * turnsToUse;

    const updated = await db.player.update({
      where: { id: player.id },
      data: {
        turns: { decrement: turnsToUse },
        cash: { increment: collected },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Collected $${collected.toLocaleString()} using ${turnsToUse} turns`,
      amount: collected,
      turnsUsed: turnsToUse,
      player: { ...updated, turns: updated.turns, cash: updated.cash },
    });
  } catch (err) {
    console.error('Collect error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
