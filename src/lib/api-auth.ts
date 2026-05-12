// Session helper shared across game API routes
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { hashToken } from '@/lib/session';

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  if (!token) return null;
  const hashedToken = hashToken(token);
  const session = await db.session.findUnique({
    where: { token: hashedToken },
    include: { player: { include: { family: true, union: true } } },
  });
  return session?.player ?? null;
}
