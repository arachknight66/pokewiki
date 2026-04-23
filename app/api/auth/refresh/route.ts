/**
 * API Route: Authentication - Refresh Token
 * Uses local JSON file store instead of PostgreSQL.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, createAccessToken } from '@/lib/auth';
import {
  findUserById,
  verifyRefreshTokenLocal,
  storeRefreshTokenLocal,
} from '@/lib/user-store';

export async function POST(req: NextRequest) {
  try {
    // Read refresh token from body or cookie
    let refreshToken: string | undefined;

    try {
      const body = await req.json();
      refreshToken = body.refreshToken;
    } catch {
      // Body may be empty — fall back to cookie
    }

    if (!refreshToken) {
      refreshToken = req.cookies.get('refreshToken')?.value;
    }

    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_TOKEN',
            message: 'Refresh token is required',
          },
        },
        { status: 400 }
      );
    }

    // Verify refresh token structure (JWT)
    const decoded = verifyToken(refreshToken);
    if (!decoded) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid or expired refresh token',
          },
        },
        { status: 401 }
      );
    }

    // Verify token is stored and not revoked
    const isValid = await verifyRefreshTokenLocal(decoded.userId, refreshToken);
    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TOKEN_REVOKED',
            message: 'Refresh token has been revoked',
          },
        },
        { status: 401 }
      );
    }

    // Get user data
    const user = findUserById(decoded.userId);

    if (!user || !user.is_active) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User no longer exists',
          },
        },
        { status: 404 }
      );
    }

    // Create new access token
    const newAccessToken = createAccessToken({
      id: user.id,
      email: user.email,
      username: user.username,
      preferences: user.preferences,
      emailVerified: user.email_verified,
      isActive: true,
      createdAt: new Date(user.created_at),
    });

    // Reuse same refresh token
    const newRefreshToken = refreshToken;

    const response = NextResponse.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });

    // Update the access token cookie
    response.cookies.set('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Token refresh failed',
        },
      },
      { status: 500 }
    );
  }
}
