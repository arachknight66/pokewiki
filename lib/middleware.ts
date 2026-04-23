/**
 * Authentication middleware utilities
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from './auth';

export interface AuthContext {
  userId: string;
  email: string;
  username: string;
}

/**
 * Middleware to require authentication
 * Returns 401 if not authenticated, otherwise continues
 */
export function withAuth(handler: (req: NextRequest, context: AuthContext) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      const token = extractTokenFromHeader(req.headers.get('Authorization') || undefined);

      if (!token) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'UNAUTHORIZED',
              message: 'Authentication required',
            },
          },
          { status: 401 }
        );
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_TOKEN',
              message: 'Invalid or expired token',
            },
          },
          { status: 401 }
        );
      }

      const context: AuthContext = {
        userId: decoded.userId,
        email: decoded.email,
        username: decoded.username,
      };

      return handler(req, context);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SERVER_ERROR',
            message: 'Internal server error',
          },
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Helper to check if request is authenticated
 */
export function getAuthContext(req: NextRequest): AuthContext | null {
  try {
    const token = extractTokenFromHeader(req.headers.get('Authorization') || undefined);
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded) return null;

    return {
      userId: decoded.userId,
      email: decoded.email,
      username: decoded.username,
    };
  } catch (error) {
    return null;
  }
}
