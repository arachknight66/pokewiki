/**
 * API Route: Authentication - Login
 * Uses local JSON file store instead of PostgreSQL.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, createAuthTokens } from '@/lib/auth';
import { LoginSchema } from '@/lib/validators';
import {
  findUserByEmail,
  updateLastLogin,
  storeRefreshTokenLocal,
} from '@/lib/user-store';
import { User } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = LoginSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: errors,
          },
        },
        { status: 422 }
      );
    }

    const { email, password } = validation.data;

    // Find user
    const user = findUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
          },
        },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
          },
        },
        { status: 401 }
      );
    }

    // Update last login
    updateLastLogin(user.id);

    // Create tokens
    const tokens = createAuthTokens({
      id: user.id,
      email: user.email,
      username: user.username,
      preferences: user.preferences,
      emailVerified: user.email_verified,
      isActive: true,
      createdAt: new Date(user.created_at),
      lastLogin: user.last_login ? new Date(user.last_login) : undefined,
    } as User);

    // Store refresh token
    await storeRefreshTokenLocal(user.id, tokens.refreshToken);

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            preferences: user.preferences,
          },
          tokens,
        },
      },
      { status: 200 }
    );

    // Set cookies
    response.cookies.set('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400,
      path: '/',
    });

    response.cookies.set('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 604800,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'LOGIN_ERROR',
          message: 'Login failed',
        },
      },
      { status: 500 }
    );
  }
}
