import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/api-auth';
import { db } from '@/lib/db';

// GET /api/game/unions - List unions
export async function GET() {
  try {
    const player = await getSession();
    if (!player) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const unions = await db.union.findMany({
      include: {
        leader: { select: { id: true, username: true } },
        members: { select: { id: true, username: true, unionRank: true } },
        families: { include: { family: { include: { boss: { select: { username: true } }, members: { select: { id: true, username: true } } } } } },
      },
    });

    return NextResponse.json({ unions: unions.map(u => ({
      id: u.id,
      name: u.name,
      bank: u.bank,
      leader: u.leader,
      memberCount: u.members.length,
      members: u.members,
      familyCount: u.families.length,
      families: u.families.map(uf => uf.family),
    }))});
  } catch (err) {
    console.error('Union GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/game/unions - Create/join/leave union, manage family membership
export async function POST(req: NextRequest) {
  try {
    const player = await getSession();
    if (!player) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { action, unionId, name, familyId } = await req.json();

    if (action === 'create') {
      if (!name?.trim()) return NextResponse.json({ error: 'Union name required' }, { status: 400 });
      if (player.unionId) return NextResponse.json({ error: 'Already in a union' }, { status: 400 });

      const existing = await db.union.findUnique({ where: { name: name.trim() } });
      if (existing) return NextResponse.json({ error: 'Union name already taken' }, { status: 400 });

      const union = await db.union.create({
        data: {
          name: name.trim(),
          leaderId: player.id,
        },
      });

      await db.player.update({
        where: { id: player.id },
        data: { unionId: union.id, unionRank: 'leader' },
      });

      return NextResponse.json({ success: true, message: `Created union "${name}"` });
    }

    if (action === 'join') {
      if (!unionId) return NextResponse.json({ error: 'Union ID required' }, { status: 400 });
      if (player.unionId) return NextResponse.json({ error: 'Already in a union' }, { status: 400 });

      const union = await db.union.findUnique({ where: { id: unionId } });
      if (!union) return NextResponse.json({ error: 'Union not found' }, { status: 400 });

      await db.player.update({
        where: { id: player.id },
        data: { unionId: union.id, unionRank: 'member' },
      });

      return NextResponse.json({ success: true, message: `Joined union "${union.name}"` });
    }

    if (action === 'leave') {
      if (!player.unionId) return NextResponse.json({ error: 'Not in a union' }, { status: 400 });

      const union = await db.union.findUnique({ where: { id: player.unionId } });
      if (union?.leaderId === player.id) {
        // Leader leaving = disband union
        await db.player.updateMany({
          where: { unionId: player.unionId },
          data: { unionId: null, unionRank: 'member' },
        });
        await db.unionFamily.deleteMany({ where: { unionId: player.unionId } });
        await db.union.delete({ where: { id: player.unionId } });
        return NextResponse.json({ success: true, message: 'Union disbanded' });
      }

      await db.player.update({
        where: { id: player.id },
        data: { unionId: null, unionRank: 'member' },
      });

      return NextResponse.json({ success: true, message: 'Left union' });
    }

    if (action === 'add_family') {
      if (!unionId || !familyId) return NextResponse.json({ error: 'Union ID and Family ID required' }, { status: 400 });
      const union = await db.union.findUnique({ where: { id: unionId } });
      if (!union || union.leaderId !== player.id) {
        return NextResponse.json({ error: 'Only union leader can add families' }, { status: 400 });
      }

      const existing = await db.unionFamily.findFirst({ where: { unionId, familyId } });
      if (existing) return NextResponse.json({ error: 'Family already in this union' }, { status: 400 });

      await db.unionFamily.create({ data: { unionId, familyId } });
      return NextResponse.json({ success: true, message: 'Family added to union' });
    }

    if (action === 'remove_family') {
      if (!unionId || !familyId) return NextResponse.json({ error: 'Union ID and Family ID required' }, { status: 400 });
      const union = await db.union.findUnique({ where: { id: unionId } });
      if (!union || union.leaderId !== player.id) {
        return NextResponse.json({ error: 'Only union leader can remove families' }, { status: 400 });
      }

      await db.unionFamily.deleteMany({ where: { unionId, familyId } });
      return NextResponse.json({ success: true, message: 'Family removed from union' });
    }

    if (action === 'set_rank') {
      if (!unionId) return NextResponse.json({ error: 'Union ID required' }, { status: 400 });
      const union = await db.union.findUnique({ where: { id: unionId } });
      if (!union || union.leaderId !== player.id) {
        return NextResponse.json({ error: 'Only union leader can set ranks' }, { status: 400 });
      }

      const { targetId, rank } = await req.json();
      if (!targetId || !rank) return NextResponse.json({ error: 'Target and rank required' }, { status: 400 });

      await db.player.update({
        where: { id: targetId },
        data: { unionRank: rank },
      });

      return NextResponse.json({ success: true, message: `Rank updated to ${rank}` });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('Union POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
