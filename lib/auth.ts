/**
 * Authentication utilities - JWT token and password management
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { JWTPayload, User, AuthTokens } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
const JWT_EXPIRY = '24h';
const REFRESH_TOKEN_EXPIRY = '7d';

/**
 * Hash password with bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Create JWT access token
 */
export function createAccessToken(user: User): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    username: user.username,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
    algorithm: 'HS256',
  });
}

/**
 * Create JWT refresh token
 */
export function createRefreshToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
    algorithm: 'HS256',
  });
}

/**
 * Create both tokens
 */
export function createAuthTokens(user: User): AuthTokens {
  return {
    accessToken: createAccessToken(user),
    refreshToken: createRefreshToken(user.id),
  };
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    });

    return decoded as JWTPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Validate password strength
 * Requirements: 12+ chars, at least one uppercase, one number
 */
export function isValidPassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate username format
 * Requirements: 3-20 chars, alphanumeric + underscore/hyphen
 */
export function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Create token hash for storing in database
 * Prevents plaintext token storage
 */
export async function hashToken(token: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(token, salt);
}
