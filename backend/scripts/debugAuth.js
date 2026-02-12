const { Client } = require('pg');

const creds = [
  { user: 'postgres', password: 'Ritesh222' },
  { user: 'postgres', password: 'password' },
  { user: 'postgres', password: 'admin' },
  { user: 'postgres', password: '' },
  { user: 'ritesh', password: 'Ritesh222' },
  { user: 'root', password: 'Ritesh222' },
];

async function tryConnect(cred) {
  const client = new Client({
    user: cred.user,
    host: 'localhost',
    password: cred.password,
    port: 5432,
  });

  try {
    await client.connect();
    console.log(`SUCCESS: Connected with user '${cred.user}' and password '${cred.password}'`);
    await client.end();
    return true;
  } catch (err) {
    console.log(`FAILED: User '${cred.user}' with password '${cred.password}' - ${err.message}`);
    return false;
  }
}

async function run() {
  for (const cred of creds) {
    if (await tryConnect(cred)) {
      break;
    }
  }
}

run();
