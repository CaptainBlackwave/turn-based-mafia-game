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
      { soldiers: player.soldiers, glocks: player.glocks, shotguns: player.shotguns, uzis: player.uzis, ak47s: player.ak47s, chryslers: player.chryslers, limos: player.limos },
      { soldiers: target.soldiers, glocks: target.glocks, shotguns: target.shotguns, uzis: target.uzis, ak47s: target.ak47s, operatives: target.operatives },
      attackType
    );

    if (attackType === 'driveby' && result.attackerLosses === 0 && result.defenderLosses === 0) {
      return NextResponse.json({ error: 'You need cars for a drive-by' }, { status: 400 });
    }

    // Calculate stolen resources
    let cashStolen = 0;
    let weaponsStolen = 0;
    let drugsStolen = 0;
    let opsKilled = 0;

    if (result.success) {
      switch (attackType) {
        case 'raid':
          cashStolen = Math.floor(target.cash * 0.15 * Math.random());
          opsKilled = Math.ceil(target.operatives * 0.05 * Math.random());
          break;
        case 'sabotage':
          weaponsStolen = Math.floor((target.glocks + target.shotguns + target.uzis + target.ak47s) * 0.1 * Math.random());
          drugsStolen = Math.floor((target.alcohol + target.weed + target.coke) * 0.1 * Math.random());
          break;
        case 'driveby':
          // Drive-by: max damage, no steals
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
        drugsStolen,
      },
    });

    // Update attacker
    const attackerUpdates: any = {
      turns: { decrement: 1 },
      soldiers: { decrement: result.attackerLosses },
    };
    if (cashStolen > 0) attackerUpdates.cash = { increment: cashStolen };
    if (weaponsStolen > 0) {
      // Give random mix of weapons
      attackerUpdates.glocks = { increment: Math.ceil(weaponsStolen * 0.4) };
      attackerUpdates.shotguns = { increment: Math.ceil(weaponsStolen * 0.3) };
    }
    if (drugsStolen > 0) {
      attackerUpdates.alcohol = { increment: Math.ceil(drugsStolen * 0.5) };
      attackerUpdates.weed = { increment: Math.ceil(drugsStolen * 0.3) };
      attackerUpdates.coke = { increment: Math.ceil(drugsStolen * 0.2) };
    }

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
    if (weaponsStolen > 0) {
      defenderUpdates.glocks = { decrement: Math.min(Math.ceil(weaponsStolen * 0.4), target.glocks) };
      defenderUpdates.shotguns = { decrement: Math.min(Math.ceil(weaponsStolen * 0.3), target.shotguns) };
    }
    if (drugsStolen > 0) {
      defenderUpdates.alcohol = { decrement: Math.min(Math.ceil(drugsStolen * 0.5), target.alcohol) };
      defenderUpdates.weed = { decrement: Math.min(Math.ceil(drugsStolen * 0.3), target.weed) };
      defenderUpdates.coke = { decrement: Math.min(Math.ceil(drugsStolen * 0.2), target.coke) };
    }

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
        drugsStolen,
        opsKilled,
      },
      message: result.success
        ? `Attack successful! Killed ${result.defenderLosses} soldiers${cashStolen > 0 ? `, stole $${cashStolen.toLocaleString()}` : ''}`
        : `Attack failed! Lost ${result.attackerLosses} soldiers`,
    });
  } catch (err) {
    console.error('Attack error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
