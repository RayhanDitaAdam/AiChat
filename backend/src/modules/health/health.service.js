import prisma from '../../common/services/prisma.service.js';
import { EncryptionUtil } from '../../common/utils/encryption.util.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';

const genAI = new GoogleGenerativeAI(process.env['GEMINI_API_KEY'] || "");

function fileToGenerativePart(path, mimeType) {
    return {
        inlineData: {
            data: Buffer.from(fs.readFileSync(path)).toString("base64"),
            mimeType
        },
    };
}

export const processMedicalRecord = async (memberId, filePath) => {
    const models = ["gemini-1.5-flash-latest", "gemini-1.5-pro-latest"];
    const imagePart = fileToGenerativePart(filePath, "image/jpeg");
    const prompt = "Extract all medical conditions, allergies, and dietary restrictions from this medical record image. Return as a clear text summary.";

    for (const modelName of models) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent([prompt, imagePart]);
            const response = await result.response;
            const extractedText = response.text();

            return await saveMedicalRecord(memberId, extractedText);
        } catch (err) {
            console.error(`[HealthService] Model ${modelName} failed, err.message:`, err.message || err);
        }
    }

    throw new Error('[HealthService] All Gemini models failed for processMedicalRecord');
};

export const saveMedicalRecord = async (memberId, content) => {
    const encryptedContent = EncryptionUtil.encrypt(content);
    return await prisma.healthData.create({
        data: {
            memberId,
            type: 'MEDICAL_RECORD',
            content: encryptedContent
        }
    });
};

export const analyzeFood = async (memberId, filePath, text) => {
    const history = await prisma.healthData.findMany({
        where: { memberId, type: 'MEDICAL_RECORD' },
        orderBy: { createdAt: 'desc' },
        take: 3
    });

    const decryptedHistory = history.map(h => {
        try { return EncryptionUtil.decrypt(h.content); } catch (e) { return null; }
    }).filter(Boolean).join("\n");

    const models = ["gemini-1.5-flash-latest", "gemini-1.5-pro-latest"];
    let prompt = `
      User Health Profile/Medical Record:
      ${decryptedHistory}

      The user asks: "${text}"
      Provide a health advice based on their medical record and the food/question described. 
      Is it safe or should they avoid it? Keep it concise and professional.
    `;

    for (const modelName of models) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            let result;
            if (filePath) {
                const imagePart = fileToGenerativePart(filePath, "image/jpeg");
                result = await model.generateContent([prompt, imagePart]);
            } else {
                result = await model.generateContent(prompt);
            }

            const response = await result.response;
            const aiResponse = response.text();

            return await prisma.healthData.create({
                data: {
                    memberId,
                    type: 'FOOD_ADVICE',
                    content: EncryptionUtil.encrypt(JSON.stringify({ text, historyApplied: true })),
                    imageUrl: filePath ? `/api/uploads/${filePath.split('/').pop()}` : null,
                    aiResponse
                }
            });
        } catch (err) {
            console.error(`[HealthService] Model ${modelName} failed, err.message:`, err.message || err);
        }
    }

    throw new Error('[HealthService] All Gemini models failed for analyzeFood');
};

export const getHealthHistory = async (memberId) => {
    return await prisma.healthData.findMany({
        where: { memberId },
        orderBy: { createdAt: 'desc' }
    });
};
