/**
 * API Route: Auth Me - Get current user profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = extractTokenFromHeader(req.headers.get('Authorization') || undefined);
    
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

    const result = await query(
      'SELECT id, email, username, profile_bio, avatar_url, preferences, email_verified, is_active, created_at, last_login FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'USER_NOT_FOUND', message: 'User no longer exists' } },
        { status: 404 }
      );
    }

    const row = result.rows[0];
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
