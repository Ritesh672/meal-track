require('dotenv').config();
const fs = require('fs');

try {
  console.log('Environment Check:');
  console.log('DB_USER:', process.env.DB_USER);
  console.log('DB_port:', process.env.DB_PORT);
  // Do not log password for security, just check existence
  console.log('DB_PASSWORD exists:', !!process.env.DB_PASSWORD);
  
  fs.writeFileSync('env_check.txt', 'Environment loaded successfully');
} catch (err) {
  console.error('Error:', err);
}
