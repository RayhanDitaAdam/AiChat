import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function test() {
    console.log("Testing text generation...");
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: "Hi, who are you?",
            config: {
                systemInstruction: "You are a helpful test assistant. Respond in one sentence.",
                temperature: 0.7,
            }
        });
        console.log("Text:", response.text);
    } catch (err) {
        console.error("Text generation failed:", err);
    }

    console.log("Testing stream generation...");
    try {
        const responseStream = await ai.models.generateContentStream({
            model: "gemini-3-flash-preview",
            contents: "Tell me a joke.",
        });
        let result = "";
        for await (const chunk of responseStream) {
            result += chunk.text;
        }
        console.log("Stream:", result);
    } catch (err) {
        console.error("Stream failed:", err);
    }
}

test();
