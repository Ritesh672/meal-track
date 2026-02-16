import dotenv from 'dotenv';
import analyzeMeal from './controllers/gemini.controller.js';

dotenv.config();

const req = {
    body: {
        description: "2 eggs and toast"
    }
};

const res = {
    json: (data) => console.log('Response JSON:', JSON.stringify(data, null, 2)),
    status: (code) => {
        console.log('Response Status:', code);
        return res; // chaining
    }
};

console.log('Testing analyzeMeal with description:', req.body.description);

try {
    await analyzeMeal(req, res);
} catch (error) {
    console.error('Test failed:', error);
}
