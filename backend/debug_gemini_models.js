import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
// Mask key for logging
const maskedKey = apiKey ? `${apiKey.substring(0, 5)}...` : 'undefined';
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log(`Checking models with key: ${maskedKey}`);

async function fetchModels() {
    if (!apiKey) {
        console.error("No API key found!");
        return;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Error: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error(text);
            return;
        }
        const data = await response.json();
        if (data.models) {
            console.log("Supported Models:");
            data.models.forEach(m => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')) {
                     console.log(`- ${m.name} (${m.displayName})`);
                }
            });
        } else {
            console.log("No models returned.", data);
        }
    } catch (e) {
        console.error('Error fetching models:', e);
    }
}

fetchModels();
