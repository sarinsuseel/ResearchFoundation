const { Pool } = require('pg');
require('dotenv').config();

// Pool = a group of database connections
// Instead of connecting/disconnecting every time, we reuse connections from the pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Supabase
  }
});

// Test the connection when server starts
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Database connected successfully');
    release(); // Release the test connection back to pool
  }
});

// We export pool so any other file can use it to query the database
module.exports = pool;