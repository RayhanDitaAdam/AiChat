import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ GEMINI_API_KEY is not set in .env");
        return;
    }

    console.log("Checking Gemini API with key:", apiKey.substring(0, 10) + "...");

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const modelName = "gemini-flash-latest";
        console.log(`\nTrying model: ${modelName}`);

        const model = genAI.getGenerativeModel({ model: modelName });
        const prompt = "Say 'Hello, I am HEART and I am working!'";
        const result = await model.generateContent(prompt);
        const response = await result.response;
        console.log(`✅ ${modelName} Response:`, response.text());

    } catch (error: any) {
        console.error("❌ Unexpected Error:", error.message);
    }
}

testGemini();
