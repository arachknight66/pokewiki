/**
 * Database connection and query utilities - PostgreSQL Implementation
 */

import { Pool, QueryResult, QueryResultRow } from 'pg';

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
    throw new Error('DATABASE_URL environment variable is required for PostgreSQL mode.');
  }

  db.pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  db.pool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client', err);
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
export async function query<T extends QueryResultRow = any>(
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
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Execute a single row query
 */
export async function queryOne<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<T | null> {
  const result = await query<T>(text, params);
  return result.rows[0] || null;
}

/**
 * Execute multiple queries
 */
export async function queryAll<T extends QueryResultRow = any>(
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
  callback: (q: (text: string, params?: any[]) => Promise<any>) => Promise<T>
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
