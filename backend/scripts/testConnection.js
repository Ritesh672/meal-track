const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function test() {
  try {
    console.log('Attempting to connect with:', {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        // password: '***' 
    });
    await client.connect();
    console.log('Connected successfully!');
    const res = await client.query('SELECT NOW()');
    console.log('Server time:', res.rows[0]);
    await client.end();
  } catch (err) {
    console.error('Connection failed:', err);
  }
}

test();
