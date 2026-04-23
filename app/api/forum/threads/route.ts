import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { CreateThreadSchema } from '@/lib/validators';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    
    const threads = await prisma.forumThread.findMany({
      where: category ? { category } : undefined,
      orderBy: { created_at: 'desc' },
      include: {
        user: { select: { username: true } }
      }
    });

    const mappedThreads = threads.map((t: any) => ({
      ...t,
      username: t.user.username,
    }));
    
    return NextResponse.json({
      success: true,
      data: mappedThreads
    });
  } catch (error) {
    console.error('Forum list error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch threads' } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Auth required' } },
        { status: 401 }
      );
    }
    const userId = (session.user as any).id;
    
    const body = await req.json();
    const validation = CreateThreadSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', details: validation.error.flatten().fieldErrors } },
        { status: 422 }
      );
    }
    
    const { title, body: threadBody, category } = validation.data;
    
    const thread = await prisma.forumThread.create({
      data: {
        user_id: userId,
        category,
        title,
        body: threadBody,
      },
      include: {
         user: { select: { username: true } }
      }
    });

    const mappedThread = {
      ...thread,
      username: thread.user.username
    };
    
    return NextResponse.json({
      success: true,
      data: mappedThread
    }, { status: 201 });
  } catch (error) {
    console.error('Forum create error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Failed to create thread' } },
      { status: 500 }
    );
  }
}
