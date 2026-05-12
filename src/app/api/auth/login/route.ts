import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateSessionToken, hashToken } from '@/lib/session';
import { calculateNetworth, calculateOpHappiness, calculateSoldierHappiness } from '@/lib/game-engine';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    const player = await db.player.findUnique({ where: { username }, include: { family: true } });
    if (!player) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, player.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Generate session token
    const token = generateSessionToken();
    const hashedToken = hashToken(token);

    // Store session
    await db.session.upsert({
      where: { token: hashedToken },
      create: { token: hashedToken, playerId: player.id },
      update: { playerId: player.id },
    });

    const response = NextResponse.json({
      player: {
        id: player.id,
        username: player.username,
        cash: player.cash,
        bank: player.bank,
        turns: player.turns,
        reserves: player.reserves,
        credits: player.credits,
        operatives: player.operatives,
        soldiers: player.soldiers,
        food: player.food,
        weapons: player.weapons,
        cars: player.cars,
        planes: player.planes,
        city: player.city,
        familyId: player.familyId,
        familyName: player.family?.name ?? null,
        unionId: player.unionId,
        subscriptionTier: player.subscriptionTier,
        isAdmin: player.isAdmin,
        isBot: player.isBot,
        protectedUntil: player.protectedUntil?.toISOString() ?? null,
        networth: calculateNetworth(player),
        opHappiness: calculateOpHappiness(player),
        soldierHappiness: calculateSoldierHappiness(player),
      },
    });

    response.cookies.set('session_token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
