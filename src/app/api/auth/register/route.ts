import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateSessionToken, hashToken } from '@/lib/session';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    if (username.length < 3 || username.length > 20) {
      return NextResponse.json({ error: 'Username must be 3-20 characters' }, { status: 400 });
    }

    if (password.length < 4) {
      return NextResponse.json({ error: 'Password must be at least 4 characters' }, { status: 400 });
    }

    const existing = await db.player.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const protectedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const player = await db.player.create({
      data: {
        username,
        passwordHash,
        cash: 5000,
        turns: 100,
        protectedUntil,
      },
    });

    const token = generateSessionToken();
    const hashedToken = hashToken(token);

    await db.session.create({
      data: { token: hashedToken, playerId: player.id },
    });

    const response = NextResponse.json({
      player: {
        id: player.id,
        username: player.username,
        cash: player.cash,
        bank: player.bank,
        turns: player.turns,
        operatives: player.operatives,
        soldiers: player.soldiers,
        food: player.food,
        weapons: player.weapons,
        cars: player.cars,
        planes: player.planes,
        city: player.city,
        familyId: player.familyId,
        protectedUntil: player.protectedUntil?.toISOString() ?? null,
        isBot: player.isBot,
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
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
