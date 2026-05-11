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

    const { type, turns: turnsToUse } = await req.json();
    if (!type || !turnsToUse || turnsToUse < 1) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    if (player.turns < turnsToUse) {
      return NextResponse.json({ error: 'Not enough turns' }, { status: 400 });
    }

    let produced = 0;
    let field = '';
    let requiredField = '';

    switch (type) {
      case 'alcohol':
        produced = 3 * player.operatives * turnsToUse;
        field = 'alcohol';
        if (player.operatives === 0) {
          return NextResponse.json({ error: 'No operatives to produce alcohol' }, { status: 400 });
        }
        break;
      case 'coke':
        produced = 3 * player.soldiers * turnsToUse;
        field = 'coke';
        if (player.soldiers === 0) {
          return NextResponse.json({ error: 'No soldiers to produce cocaine' }, { status: 400 });
        }
        break;
      case 'weed':
        produced = 3 * player.soldiers * turnsToUse;
        field = 'weed';
        if (player.soldiers === 0) {
          return NextResponse.json({ error: 'No soldiers to produce weed' }, { status: 400 });
        }
        break;
      default:
        return NextResponse.json({ error: 'Invalid produce type' }, { status: 400 });
    }

    const updated = await db.player.update({
      where: { id: player.id },
      data: {
        turns: { decrement: turnsToUse },
        [field]: { increment: produced },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Produced ${produced.toLocaleString()} ${type} using ${turnsToUse} turns`,
      amount: produced,
      turnsUsed: turnsToUse,
      player: { ...updated, turns: updated.turns, [field]: (updated as any)[field] },
    });
  } catch (err) {
    console.error('Produce error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
