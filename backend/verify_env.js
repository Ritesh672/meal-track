import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Mimic server.js behavior
dotenv.config();

console.log('Current Directory:', process.cwd());
console.log('GEMINI_API_KEY from env:', process.env.GEMINI_API_KEY);

if (!process.env.GEMINI_API_KEY) {
    console.log('Trying to load explicit path...');
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const envPath = path.resolve(__dirname, '.env');
    console.log('Looking for .env at:', envPath);
    dotenv.config({ path: envPath });
    console.log('GEMINI_API_KEY after explicit load:', process.env.GEMINI_API_KEY);
}
