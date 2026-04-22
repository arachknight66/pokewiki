/**
 * Database Migration Script
 * Reads DATABASE_SCHEMA.sql and executes it
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

async function runMigration() {
  if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('📦 Starting database migration...');
    console.log(`📡 Connecting to: ${process.env.DATABASE_URL}`);

    // Read schema file
    const schemaPath = path.join(__dirname, '..', 'DATABASE_SCHEMA.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    // Split by semicolon and filter empty statements
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`\n📋 Found ${statements.length} SQL statements\n`);

    let executed = 0;

    for (const statement of statements) {
      try {
        // Skip comments
        if (statement.startsWith('--')) {
          continue;
        }

        await pool.query(statement);
        executed++;
        console.log(`✅ Executed statement ${executed}/${statements.length}`);
      } catch (err) {
        // Ignore "already exists" errors (idempotent)
        if (err.message.includes('already exists')) {
          console.log(`⏭️  Skipped (already exists): ${statement.substring(0, 50)}...`);
        } else {
          throw err;
        }
      }
    }

    console.log(`\n✨ Migration completed successfully!`);
    console.log(`📊 Tables created and indexes set up`);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
