/**
 * API Route: Authentication - Login
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyPassword, createAuthTokens } from '@/lib/auth';
import { LoginSchema } from '@/lib/validators';
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
    const result = await query(
      `SELECT id, email, username, password_hash, preferences, last_login
       FROM users WHERE email = $1 AND is_active = true`,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
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

    const user = result.rows[0];

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
    await query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    // Create tokens
    const tokens = createAuthTokens({
      id: user.id,
      email: user.email,
      username: user.username,
      preferences: user.preferences,
      emailVerified: true,
      isActive: true,
      createdAt: user.created_at,
      lastLogin: user.last_login,
    } as User);

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
      sameSite: 'strict',
      maxAge: 86400,
      path: '/',
    });

    response.cookies.set('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
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
