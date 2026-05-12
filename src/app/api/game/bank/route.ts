import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/api-auth';
import { db } from '@/lib/db';
import { calculateMaxDeposit } from '@/lib/game-engine';
import { deserializeSettings } from '@/lib/settings';

export async function POST(req: NextRequest) {
  try {
    const player = await getSession();
    if (!player) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { action, amount } = await req.json();
    if (!action || !amount || amount < 1) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const activeRound = await db.round.findFirst({ where: { status: 'active' } });
    const settings = activeRound ? deserializeSettings(activeRound.settings) : null;
    const bankPercent = settings?.bankingPercentOfNW ?? 75;

    if (action === 'deposit') {
      const maxDeposit = calculateMaxDeposit(player.cash, player.bank, bankPercent);
      const depositAmount = Math.min(amount, maxDeposit, player.cash);

      if (depositAmount < 1) {
        return NextResponse.json({ error: `Cannot deposit that amount (max ${bankPercent}% of total cash)` }, { status: 400 });
      }

      const updated = await db.player.update({
        where: { id: player.id },
        data: { cash: { decrement: depositAmount }, bank: { increment: depositAmount } },
      });

      return NextResponse.json({
        success: true,
        message: `Deposited ${depositAmount.toLocaleString()}`,
        amount: depositAmount,
        player: { ...updated, cash: updated.cash, bank: updated.bank },
      });
    }

    if (action === 'withdraw') {
      const withdrawAmount = Math.min(amount, player.bank);

      if (withdrawAmount < 1) {
        return NextResponse.json({ error: 'Nothing to withdraw' }, { status: 400 });
      }

      const updated = await db.player.update({
        where: { id: player.id },
        data: { bank: { decrement: withdrawAmount }, cash: { increment: withdrawAmount } },
      });

      return NextResponse.json({
        success: true,
        message: `Withdrew ${withdrawAmount.toLocaleString()}`,
        amount: withdrawAmount,
        player: { ...updated, cash: updated.cash, bank: updated.bank },
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('Bank error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
