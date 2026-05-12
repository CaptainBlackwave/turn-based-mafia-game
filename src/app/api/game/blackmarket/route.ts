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
  food: { buy: 50, sell: 25 },
  weapon: { buy: 1000, sell: 500 },
  car: { buy: 20000, sell: 10000 },
  plane: { buy: 100000, sell: 50000 },
};

const ITEM_FIELD_MAP: Record<string, string> = {
  food: 'food',
  weapon: 'weapons',
  car: 'cars',
  plane: 'planes',
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
