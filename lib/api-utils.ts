/**
 * API utilities - Response formatting and error handling
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { extractTokenFromHeader, verifyToken } from './auth';
import { JWTPayload } from './types';

/**
 * Standard API response wrapper
 */
export function sendSuccess<T>(
  res: NextApiResponse,
  data: T,
  statusCode: number = 200,
  meta?: Record<string, any>
) {
  return res.status(statusCode).json({
    success: true,
    data,
    meta,
  });
}

/**
 * Error response wrapper
 */
export function sendError(
  res: NextApiResponse,
  message: string,
  statusCode: number = 400,
  code: string = 'ERROR',
  details?: Record<string, any>
) {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details,
    },
  });
}

/**
 * Validation error response
 */
export function sendValidationError(
  res: NextApiResponse,
  errors: Record<string, any>
) {
  return res.status(422).json({
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: errors,
    },
  });
}

/**
 * Authenticate request and extract user
 */
export async function authenticateRequest(
  req: NextApiRequest
): Promise<JWTPayload | null> {
  const token = extractTokenFromHeader(req.headers.authorization);
  if (!token) return null;

  return verifyToken(token);
}

/**
 * Require authentication
 */
export async function requireAuth(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<JWTPayload | null> {
  const user = await authenticateRequest(req);

  if (!user) {
    sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
    return null;
  }

  return user;
}

/**
 * HTTP method check
 */
export function checkMethod(
  req: NextApiRequest,
  res: NextApiResponse,
  ...allowedMethods: string[]
): boolean {
  if (!req.method || !allowedMethods.includes(req.method)) {
    sendError(
      res,
      `Method ${req.method} not allowed`,
      405,
      'METHOD_NOT_ALLOWED'
    );
    return false;
  }

  return true;
}

/**
 * Rate limiting check (simplified)
 */
const requestStore = new Map<string, number[]>();

export function checkRateLimit(
  req: NextApiRequest,
  limit: number = 100,
  window: number = 60 * 1000 // 1 minute
): boolean {
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    req.socket?.remoteAddress ||
    'unknown';

  const now = Date.now();
  const timestamps = requestStore.get(ip) || [];

  // Remove old timestamps
  const recentTimestamps = timestamps.filter(t => t > now - window);

  if (recentTimestamps.length >= limit) {
    return false;
  }

  recentTimestamps.push(now);
  requestStore.set(ip, recentTimestamps);

  return true;
}

/**
 * CORS headers
 */
export function setCorsHeaders(
  res: NextApiResponse,
  origin?: string
) {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.NEXT_PUBLIC_API_URL,
  ].filter(Boolean);

  const requestOrigin = origin || (process.env.NEXT_PUBLIC_API_URL as string);

  if (allowedOrigins.includes(requestOrigin)) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  return res;
}

/**
 * Safe error handler
 */
export function handleError(
  res: NextApiResponse,
  error: any,
  message: string = 'Internal server error'
) {
  console.error('API Error:', error);

  if (error.name === 'ValidationError') {
    return sendValidationError(res, error.errors);
  }

  if (error.statusCode) {
    return sendError(res, error.message, error.statusCode, error.code);
  }

  return sendError(res, message, 500, 'INTERNAL_ERROR');
}

/**
 * Paginate results
 */
export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  offset: number;
}

export function createPagination(
  page: number = 1,
  pageSize: number = 20,
  total: number = 0
): Pagination {
  const offset = (page - 1) * pageSize;
  const totalPages = Math.ceil(total / pageSize);

  return {
    page: Math.max(page, 1),
    pageSize,
    total,
    totalPages,
    offset,
  };
}
