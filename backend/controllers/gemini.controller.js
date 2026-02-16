import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing in .env file");
}

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
  }
});


const analyzeMeal = async (req, res) => {
  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ message: "Description is required" });
    }

    const prompt = `
Analyze this meal description: "${description}".

Return ONLY valid JSON in this format:
{
  "meal_name": "string",
  "calories": number,
  "protein_g": number,
  "fats_g": number,
  "carbs_g": number,
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    console.log("Gemini Raw Response:", text);

    const data = JSON.parse(text);

    res.json(data);

  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export default analyzeMeal;
