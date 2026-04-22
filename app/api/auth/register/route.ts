/**
 * API Route: Authentication - Register
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import { hashPassword, createAuthTokens, isValidPassword, isValidEmail } from '@/lib/auth';
import { sendSuccess, sendError, sendValidationError } from '@/lib/api-utils';
import { RegisterSchema } from '@/lib/validators';
import { User } from '@/lib/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return sendError(res, 'Method not allowed', 405, 'METHOD_NOT_ALLOWED');
  }

  try {
    const validation = RegisterSchema.safeParse(req.body);

    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      return sendValidationError(res, errors);
    }

    const { email, username, password } = validation.data;

    // Additional validation
    if (!isValidEmail(email)) {
      return sendError(res, 'Invalid email format', 400, 'INVALID_EMAIL');
    }

    const passwordValidation = isValidPassword(password);
    if (!passwordValidation.valid) {
      return sendError(
        res,
        'Password does not meet requirements',
        400,
        'WEAK_PASSWORD',
        { errors: passwordValidation.errors }
      );
    }

    // Check if email already exists
    const existingEmail = await query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingEmail.rows.length > 0) {
      return sendError(res, 'Email already in use', 409, 'EMAIL_EXISTS');
    }

    // Check if username already exists
    const existingUsername = await query(
      'SELECT id FROM users WHERE username = $1',
      [username.toLowerCase()]
    );

    if (existingUsername.rows.length > 0) {
      return sendError(res, 'Username already taken', 409, 'USERNAME_EXISTS');
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

    // Set cookies
    res.setHeader('Set-Cookie', [
      `accessToken=${tokens.accessToken}; Path=/; HttpOnly; Max-Age=86400; SameSite=Strict`,
      `refreshToken=${tokens.refreshToken}; Path=/; HttpOnly; Max-Age=604800; SameSite=Strict`,
    ]);

    return sendSuccess(
      res,
      {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          preferences: user.preferences,
        },
        tokens,
      },
      201
    );
  } catch (error) {
    console.error('Registration error:', error);
    return sendError(res, 'Registration failed', 500, 'REGISTRATION_ERROR');
  }
}
