// Admin auth helper - shared across admin routes
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashToken } from '@/lib/session';
import { cookies } from 'next/headers';

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  if (!token) return null;
  const hashedToken = hashToken(token);
  const session = await db.session.findUnique({
    where: { token: hashedToken },
    include: { player: true },
  });
  const player = session?.player ?? null;
  if (!player || !player.isAdmin) return null;
  return player;
}

export function adminOnly(player: any): NextResponse | null {
  if (!player) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!player.isAdmin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  return null;
}
