import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashToken } from '@/lib/session';
import { cookies } from 'next/headers';
import { calculateNetworth, isInAttackRange, isMaxed, resolveAttack } from '@/lib/game-engine';

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

    if (player.turns < 1) {
      return NextResponse.json({ error: 'Not enough turns' }, { status: 400 });
    }

    // Check protection
    if (player.protectedUntil && new Date(player.protectedUntil) > new Date()) {
      return NextResponse.json({ error: 'You are under protection' }, { status: 400 });
    }

    const { targetId, attackType } = await req.json();
    if (!targetId || !attackType) {
      return NextResponse.json({ error: 'Target and attack type required' }, { status: 400 });
    }

    const target = await db.player.findUnique({ where: { id: targetId } });
    if (!target || target.id === player.id) {
      return NextResponse.json({ error: 'Invalid target' }, { status: 400 });
    }

    // Target in same city?
    if (target.city !== player.city) {
      return NextResponse.json({ error: 'Target is in a different city' }, { status: 400 });
    }

    // Attack range check
    const attackerNW = calculateNetworth(player);
    const defenderNW = calculateNetworth(target);
    if (!isInAttackRange(attackerNW, defenderNW)) {
      return NextResponse.json({ error: 'Target is out of your attack range' }, { status: 400 });
    }

    // Maxing check
    const recentAttacks = await db.attack.findMany({
      where: { attackerId: player.id, defenderId: target.id },
    });
    if (isMaxed(recentAttacks.map(a => ({ cashStolen: a.cashStolen, createdAt: a.createdAt })), defenderNW, new Date())) {
      return NextResponse.json({ error: 'Target is already maxed for this hour' }, { status: 400 });
    }

    // Resolve attack
    const result = resolveAttack(
      { soldiers: player.soldiers, weapons: player.weapons, cars: player.cars },
      { soldiers: target.soldiers, weapons: target.weapons, operatives: target.operatives },
      attackType
    );

    if (attackType === 'driveby' && result.attackerLosses === 0 && result.defenderLosses === 0) {
      return NextResponse.json({ error: 'You need cars for a drive-by' }, { status: 400 });
    }

    // Calculate stolen resources / extra kills
    let cashStolen = 0;
    let weaponsStolen = 0;
    let foodStolen = 0;
    let opsKilled = 0;

    if (result.success) {
      switch (attackType) {
        case 'raid':
          // Steal 8-25% of cash, kill 10-25% of soldiers, kill 5-15% of operatives
          const raidCashPct = 0.08 + Math.random() * 0.17;
          cashStolen = Math.floor(target.cash * raidCashPct);
          const raidSoldierKillPct = 0.10 + Math.random() * 0.15;
          result.defenderLosses = Math.max(result.defenderLosses, Math.ceil(target.soldiers * raidSoldierKillPct));
          const raidOpsKillPct = 0.05 + Math.random() * 0.10;
          opsKilled = Math.ceil(target.operatives * raidOpsKillPct);
          break;
        case 'sabotage':
          // Steal 10-25% of food and weapons, kill 8-20% of soldiers
          const sabFoodPct = 0.10 + Math.random() * 0.15;
          foodStolen = Math.floor(target.food * sabFoodPct);
          const sabWeaponPct = 0.10 + Math.random() * 0.15;
          weaponsStolen = Math.floor(target.weapons * sabWeaponPct);
          const sabSoldierKillPct = 0.08 + Math.random() * 0.12;
          result.defenderLosses = Math.max(result.defenderLosses, Math.ceil(target.soldiers * sabSoldierKillPct));
          break;
        case 'driveby':
          // Drive-by: max damage already calculated, no steals
          break;
      }
    }

    // Record attack
    await db.attack.create({
      data: {
        attackerId: player.id,
        defenderId: target.id,
        type: attackType,
        success: result.success,
        cashStolen,
        opsKilled,
        soldiersKilled: result.defenderLosses,
        weaponsStolen,
        foodStolen,
      },
    });

    // Update attacker
    const attackerUpdates: any = {
      turns: { decrement: 1 },
      soldiers: { decrement: result.attackerLosses },
    };
    if (cashStolen > 0) attackerUpdates.cash = { increment: cashStolen };
    if (weaponsStolen > 0) attackerUpdates.weapons = { increment: weaponsStolen };
    if (foodStolen > 0) attackerUpdates.food = { increment: foodStolen };

    const updatedAttacker = await db.player.update({
      where: { id: player.id },
      data: attackerUpdates,
    });

    // Update defender
    const defenderUpdates: any = {
      soldiers: { decrement: result.defenderLosses },
    };
    if (cashStolen > 0) defenderUpdates.cash = { decrement: cashStolen };
    if (opsKilled > 0) defenderUpdates.operatives = { decrement: opsKilled };
    if (weaponsStolen > 0) defenderUpdates.weapons = { decrement: Math.min(weaponsStolen, target.weapons) };
    if (foodStolen > 0) defenderUpdates.food = { decrement: Math.min(foodStolen, target.food) };

    const updatedDefender = await db.player.update({
      where: { id: target.id },
      data: defenderUpdates,
    });

    return NextResponse.json({
      success: true,
      result: {
        won: result.success,
        attackType,
        attackerLosses: result.attackerLosses,
        defenderLosses: result.defenderLosses,
        cashStolen,
        weaponsStolen,
        foodStolen,
        opsKilled,
      },
      message: result.success
        ? `Attack successful! Killed ${result.defenderLosses} soldiers${opsKilled > 0 ? `, ${opsKilled} operatives` : ''}${cashStolen > 0 ? `, stole $${cashStolen.toLocaleString()}` : ''}${foodStolen > 0 ? `, ${foodStolen} food` : ''}${weaponsStolen > 0 ? `, ${weaponsStolen} weapons` : ''}`
        : `Attack failed! Lost ${result.attackerLosses} soldiers`,
    });
  } catch (err) {
    console.error('Attack error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
