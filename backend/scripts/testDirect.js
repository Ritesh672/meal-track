const { Client } = require('pg');
require('dotenv').config();

const projectRef = process.env.DB_USER.split('.')[1]; // Extract ref from postgres.ref
const password = process.env.DB_PASSWORD;

console.log('Testing direct connection to:', `db.${projectRef}.supabase.co`);

const client = new Client({
  host: `db.${projectRef}.supabase.co`,
  user: 'postgres',
  password: password,
  database: 'postgres',
  port: 5432,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function run() {
  try {
    await client.connect();
    console.log('✅ Connected via Direct Connection!');
    await client.end();
  } catch (err) {
    console.error('❌ Direct Connection Failed:', err.message);
  }
}

run();
