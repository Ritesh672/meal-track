const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const dbConfig = {
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
};

const dbName = process.env.PG_DATABASE;

async function setupDatabase() {
  const client = new Client(dbConfig); // Connect to default 'postgres' database first

  try {
    await client.connect();
    
    // Check if database exists
    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${dbName}'`);
    
    if (res.rowCount === 0) {
      console.log(`Database '${dbName}' does not exist. Creating...`);
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database '${dbName}' created successfully.`);
    } else {
      console.log(`Database '${dbName}' already exists.`);
    }
  } catch (err) {
    console.error('Error creating database:', err);
    fs.writeFileSync(path.join(__dirname, 'db_error.txt'), 'Error creating database: ' + err.stack);
    process.exit(1);
  } finally {
    await client.end();
  }

  // Now connect to the specific database to run schema
  const dbClient = new Client({
    ...dbConfig,
    database: dbName,
  });

  try {
    await dbClient.connect();
    console.log('Connected to database. Running schema...');
    
    const schemaPath = path.join(__dirname, '../db/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    await dbClient.query(schemaSql);
    console.log('Schema setup completed successfully.');
  } catch (err) {
    console.error('Error running schema:', err);
    process.exit(1);
  } finally {
    await dbClient.end();
  }
}

setupDatabase();
