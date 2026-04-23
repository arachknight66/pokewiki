/**
 * API Route: Auth Me - Get current user profile
 * Reads token from Authorization header OR httpOnly cookie.
 * Uses local JSON file store instead of PostgreSQL.
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';
import { findUserById } from '@/lib/user-store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Try Authorization header first, then fall back to cookie
    let token = extractTokenFromHeader(req.headers.get('Authorization') || undefined);

    if (!token) {
      token = req.cookies.get('accessToken')?.value ?? null;
    }

    if (!token) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not logged in' } },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_TOKEN', message: 'Session expired' } },
        { status: 401 }
      );
    }

    const row = findUserById(decoded.userId);

    if (!row) {
      return NextResponse.json(
        { success: false, error: { code: 'USER_NOT_FOUND', message: 'User no longer exists' } },
        { status: 404 }
      );
    }

    const user = {
      id: row.id,
      email: row.email,
      username: row.username,
      profileBio: row.profile_bio,
      avatarUrl: row.avatar_url,
      preferences: row.preferences,
      emailVerified: row.email_verified,
      isActive: row.is_active,
      createdAt: row.created_at,
      lastLogin: row.last_login,
    };

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error('Auth Me error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
