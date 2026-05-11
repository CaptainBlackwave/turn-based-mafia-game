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

const PRICES: Record<string, { buy: number; sell: number }> = {
  alcohol: { buy: 50, sell: 25 },
  weed: { buy: 100, sell: 50 },
  coke: { buy: 200, sell: 100 },
  glock: { buy: 400, sell: 200 },
  shotgun: { buy: 800, sell: 400 },
  uzi: { buy: 2000, sell: 1000 },
  ak47: { buy: 4000, sell: 2000 },
  chrysler: { buy: 8000, sell: 4000 },
  limo: { buy: 40000, sell: 20000 },
  gulfstream: { buy: 40000, sell: 20000 },
  boeing: { buy: 250000, sell: 125000 },
};

const ITEM_FIELD_MAP: Record<string, string> = {
  alcohol: 'alcohol',
  weed: 'weed',
  coke: 'coke',
  glock: 'glocks',
  shotgun: 'shotguns',
  uzi: 'uzis',
  ak47: 'ak47s',
  chrysler: 'chryslers',
  limo: 'limos',
  gulfstream: 'gulfstreams',
  boeing: 'boeings',
};

export async function POST(req: NextRequest) {
  try {
    const player = await getSession();
    if (!player) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { action, itemId, quantity } = await req.json();
    if (!action || !itemId || !quantity || quantity < 1) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const prices = PRICES[itemId];
    if (!prices) {
      return NextResponse.json({ error: 'Invalid item' }, { status: 400 });
    }

    const field = ITEM_FIELD_MAP[itemId];
    if (!field) return NextResponse.json({ error: 'Invalid item' }, { status: 400 });

    if (action === 'buy') {
      const totalCost = prices.buy * quantity;
      if (player.cash < totalCost) {
        return NextResponse.json({ error: 'Not enough cash' }, { status: 400 });
      }

      const updated = await db.player.update({
        where: { id: player.id },
        data: {
          cash: { decrement: totalCost },
          [field]: { increment: quantity },
        },
      });

      return NextResponse.json({
        success: true,
        message: `Bought ${quantity} ${itemId} for $${totalCost.toLocaleString()}`,
        cashSpent: totalCost,
        itemsGained: quantity,
        player: { ...updated, cash: updated.cash, [field]: updated[field as keyof typeof updated] },
      });
    }

    if (action === 'sell') {
      const currentAmount = (player as any)[field] as number;
      if (currentAmount < quantity) {
        return NextResponse.json({ error: `Not enough ${itemId}` }, { status: 400 });
      }

      const totalGain = prices.sell * quantity;

      const updated = await db.player.update({
        where: { id: player.id },
        data: {
          cash: { increment: totalGain },
          [field]: { decrement: quantity },
        },
      });

      return NextResponse.json({
        success: true,
        message: `Sold ${quantity} ${itemId} for $${totalGain.toLocaleString()}`,
        cashGained: totalGain,
        itemsSold: quantity,
        player: { ...updated, cash: updated.cash, [field]: updated[field as keyof typeof updated] },
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('Blackmarket error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
