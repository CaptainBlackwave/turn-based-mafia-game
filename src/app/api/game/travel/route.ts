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

    if (player.protectedUntil && new Date(player.protectedUntil) > new Date()) {
      return NextResponse.json({ error: 'Cannot travel while under protection' }, { status: 400 });
    }

    const { city } = await req.json();
    const validCities = ['New York', 'Chicago', 'Los Angeles', 'Miami', 'Las Vegas'];
    if (!city || !validCities.includes(city)) {
      return NextResponse.json({ error: 'Invalid city' }, { status: 400 });
    }

    if (city === player.city) {
      return NextResponse.json({ error: 'You are already in that city' }, { status: 400 });
    }

    const updated = await db.player.update({
      where: { id: player.id },
      data: { city },
    });

    return NextResponse.json({
      success: true,
      message: `Traveled to ${city}`,
      player: { ...updated, city: updated.city },
    });
  } catch (err) {
    console.error('Travel error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
