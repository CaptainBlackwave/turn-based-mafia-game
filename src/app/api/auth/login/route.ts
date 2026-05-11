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

    const player = await db.player.findUnique({ where: { username } });
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
        operatives: player.operatives,
        soldiers: player.soldiers,
        alcohol: player.alcohol,
        weed: player.weed,
        coke: player.coke,
        glocks: player.glocks,
        shotguns: player.shotguns,
        uzis: player.uzis,
        ak47s: player.ak47s,
        chryslers: player.chryslers,
        limos: player.limos,
        gulfstreams: player.gulfstreams,
        boeings: player.boeings,
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
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
