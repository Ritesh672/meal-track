const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

const projectRef = process.env.DB_USER.split('.')[1]; // Extract ref from postgres.ref
const password = process.env.DB_PASSWORD;

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
    fs.writeFileSync('connection_success.txt', 'Connected!');
    await client.end();
  } catch (err) {
    fs.writeFileSync('connection_error.txt', err.stack);
  }
}

run();
