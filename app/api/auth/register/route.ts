/**
 * API Route: Authentication - Register
 * Uses local JSON file store instead of PostgreSQL.
 */

import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, createAuthTokens } from '@/lib/auth';
import { RegisterSchema } from '@/lib/validators';
import {
  findUserByEmail,
  findUserByUsername,
  createUser,
  storeRefreshTokenLocal,
} from '@/lib/user-store';
import { User } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = RegisterSchema.safeParse(body);

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

    const { email, username, password } = validation.data;

    // Check if email already exists
    if (findUserByEmail(email)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'EMAIL_EXISTS', message: 'Email already in use' },
        },
        { status: 409 }
      );
    }

    // Check if username already exists
    if (findUserByUsername(username)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'USERNAME_EXISTS', message: 'Username already taken' },
        },
        { status: 409 }
      );
    }

    // Hash password & create user
    const passwordHash = await hashPassword(password);
    const user = createUser({ email, username, passwordHash });

    // Create tokens
    const tokens = createAuthTokens({
      id: user.id,
      email: user.email,
      username: user.username,
      preferences: user.preferences,
      emailVerified: false,
      isActive: true,
      createdAt: new Date(user.created_at),
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
      { status: 201 }
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
    console.error('Registration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'REGISTRATION_ERROR', message: 'Registration failed' },
      },
      { status: 500 }
    );
  }
}
