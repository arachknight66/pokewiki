/**
 * API Route: Authentication - Register
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword, createAuthTokens } from '@/lib/auth';
import { RegisterSchema } from '@/lib/validators';
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
    const existingEmail = await query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingEmail.rows.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'EMAIL_EXISTS', message: 'Email already in use' },
        },
        { status: 409 }
      );
    }

    // Check if username already exists
    const existingUsername = await query(
      'SELECT id FROM users WHERE username = $1',
      [username.toLowerCase()]
    );

    if (existingUsername.rows.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'USERNAME_EXISTS', message: 'Username already taken' },
        },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const result = await query(
      `INSERT INTO users (email, username, password_hash, preferences)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, username, preferences, created_at`,
      [
        email.toLowerCase(),
        username,
        passwordHash,
        JSON.stringify({ theme: 'light', notifications: true }),
      ]
    );

    const user = result.rows[0];

    // Create tokens
    const tokens = createAuthTokens({
      id: user.id,
      email: user.email,
      username: user.username,
      preferences: user.preferences,
      emailVerified: false,
      isActive: true,
      createdAt: user.created_at,
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
      { status: 201 }
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
