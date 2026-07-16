import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { CreateTournamentSchema } from '@/lib/validators';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'open';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);

    const validStatuses = ['open', 'in-progress', 'closed'];
    const filterStatus = validStatuses.includes(status) ? status : 'open';

    const tournaments = await prisma.tournament.findMany({
      where: { status: filterStatus },
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        creator: { select: { username: true } },
        _count: { select: { submissions: true } }
      }
    });

    const total = await prisma.tournament.count({
      where: { status: filterStatus }
    });

    return NextResponse.json({
      success: true,
      data: tournaments,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    console.error('List tournaments error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch tournaments' } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Login required to create a tournament' } },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const validation = CreateTournamentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', details: validation.error.flatten().fieldErrors } },
        { status: 422 }
      );
    }

    const tournament = await prisma.tournament.create({
      data: {
        created_by: userId,
        name: validation.data.name,
        description: validation.data.description || null,
        format: validation.data.format,
        max_participants: validation.data.maxParticipants,
        start_date: validation.data.startDate ? new Date(validation.data.startDate) : null,
        end_date: validation.data.endDate ? new Date(validation.data.endDate) : null,
        status: 'open'
      }
    });

    return NextResponse.json({
      success: true,
      data: tournament
    }, { status: 201 });
  } catch (error) {
    console.error('Create tournament error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Failed to create tournament' } },
      { status: 500 }
    );
  }
}
