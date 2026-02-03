const { Pool } = require('pg');
require('dotenv').config();

// Allow self-signed certificates for TigerDB cloud
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

// Initialize database schema
const initDB = async () => {
  const client = await pool.connect();
  try {
    // Create expenses table
    await client.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        amount DECIMAL(12,2) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        idempotency_key VARCHAR(100) UNIQUE
      )
    `);

    // Create index for faster filtering and sorting
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date DESC)
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = { pool, initDB };
