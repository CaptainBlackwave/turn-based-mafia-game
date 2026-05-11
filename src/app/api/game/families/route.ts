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
    include: { player: { include: { family: true } } },
  });
  return session?.player ?? null;
}

export async function GET() {
  try {
    const families = await db.family.findMany({
      include: {
        boss: { select: { id: true, username: true } },
        members: { select: { id: true, username: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    const familyData = families.map(f => ({
      id: f.id,
      name: f.name,
      boss: f.boss,
      city: f.city,
      memberCount: f.members.length,
      members: f.members,
    }));

    return NextResponse.json({ families: familyData });
  } catch (err) {
    console.error('Families list error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const player = await getSession();
    if (!player) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { action, familyId, familyName } = await req.json();

    if (action === 'create') {
      if (!familyName || familyName.length < 2 || familyName.length > 30) {
        return NextResponse.json({ error: 'Family name must be 2-30 characters' }, { status: 400 });
      }

      if (player.familyId) {
        return NextResponse.json({ error: 'Leave your current family first' }, { status: 400 });
      }

      const existing = await db.family.findUnique({ where: { name: familyName } });
      if (existing) {
        return NextResponse.json({ error: 'Family name already taken' }, { status: 409 });
      }

      const family = await db.family.create({
        data: {
          name: familyName,
          bossId: player.id,
          city: player.city,
        },
      });

      const updated = await db.player.update({
        where: { id: player.id },
        data: { familyId: family.id },
        include: { family: true },
      });

      return NextResponse.json({
        success: true,
        message: `Created family "${familyName}"`,
        family: { id: family.id, name: family.name, city: family.city },
        player: { ...updated, familyId: updated.familyId },
      });
    }

    if (action === 'join') {
      if (!familyId) return NextResponse.json({ error: 'Family ID required' }, { status: 400 });
      if (player.familyId) return NextResponse.json({ error: 'Leave your current family first' }, { status: 400 });

      const family = await db.family.findUnique({ where: { id: familyId } });
      if (!family) return NextResponse.json({ error: 'Family not found' }, { status: 404 });

      const updated = await db.player.update({
        where: { id: player.id },
        data: { familyId },
        include: { family: true },
      });

      return NextResponse.json({
        success: true,
        message: `Joined family "${family.name}"`,
        family: { id: family.id, name: family.name },
        player: { ...updated, familyId: updated.familyId },
      });
    }

    if (action === 'leave') {
      if (!player.familyId) {
        return NextResponse.json({ error: 'You are not in a family' }, { status: 400 });
      }

      const family = await db.family.findUnique({ where: { id: player.familyId } });

      if (family && family.bossId === player.id) {
        // Boss leaving - delete the family
        await db.family.delete({ where: { id: player.familyId } });
        // Remove all members
        await db.player.updateMany({
          where: { familyId: player.familyId },
          data: { familyId: null },
        });
        return NextResponse.json({
          success: true,
          message: 'Family disbanded',
          player: { ...player, familyId: null },
        });
      }

      const updated = await db.player.update({
        where: { id: player.id },
        data: { familyId: null },
      });

      return NextResponse.json({
        success: true,
        message: 'Left family',
        player: { ...updated, familyId: null },
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('Families error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
