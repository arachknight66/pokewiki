/**
 * Database connection and query utilities
 */

import { Pool, QueryResult } from 'pg';

interface DbConnection {
  pool: Pool | null;
}

const db: DbConnection = {
  pool: null,
};

/**
 * Initialize database connection
 */
export function initializeDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  db.pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  db.pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
  });

  return db.pool;
}

/**
 * Get database pool
 */
export function getPool(): Pool {
  if (!db.pool) {
    initializeDatabase();
  }
  return db.pool!;
}

/**
 * Execute a query
 */
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const pool = getPool();
  const start = Date.now();
  try {
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    if (duration > 1000) {
      console.warn(`Slow query (${duration}ms):`, text);
    }
    return result;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

/**
 * Execute a single row query
 */
export async function queryOne<T = any>(
  text: string,
  params?: any[]
): Promise<T | null> {
  const result = await query<T>(text, params);
  return result.rows[0] || null;
}

/**
 * Execute multiple queries
 */
export async function queryAll<T = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  const result = await query<T>(text, params);
  return result.rows;
}

/**
 * Execute transaction
 */
export async function transaction<T>(
  callback: (query: typeof query) => Promise<T>
): Promise<T> {
  const pool = getPool();
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(async (text, params) => {
      return client.query(text, params);
    });
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
  if (db.pool) {
    await db.pool.end();
    db.pool = null;
  }
}

/**
 * Prepare a SQL query with proper escaping
 * Useful for building dynamic queries
 */
export function buildQuery(
  baseQuery: string,
  conditions?: Record<string, any>,
  options?: { orderBy?: string; limit?: number; offset?: number }
): { query: string; params: any[] } {
  let query = baseQuery;
  const params: any[] = [];
  let paramIndex = 1;

  if (conditions && Object.keys(conditions).length > 0) {
    const whereConditions: string[] = [];
    
    Object.entries(conditions).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        whereConditions.push(`${key} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
    });

    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }
  }

  if (options?.orderBy) {
    query += ` ORDER BY ${options.orderBy}`;
  }

  if (options?.limit) {
    query += ` LIMIT $${paramIndex}`;
    params.push(options.limit);
    paramIndex++;
  }

  if (options?.offset) {
    query += ` OFFSET $${paramIndex}`;
    params.push(options.offset);
  }

  return { query, params };
}
