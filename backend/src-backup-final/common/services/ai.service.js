import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import OpenAI from "openai";
import prisma from "./prisma.service.js";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

export class AIService {
  static modelCache = new Map();

  static async getModel(ownerId, config) {
    try {
      const systemConfig =
        config ||
        (await prisma.systemConfig.findUnique({ where: { id: "global" } }));
      const modelName = systemConfig?.aiModel || "gemini-1.5-flash";
      const isDeepSeek = modelName.includes("deepseek");

      const apiKey = isDeepSeek
        ? systemConfig?.deepseekApiKey || process.env.DEEPSEEK_API_KEY
        : systemConfig?.geminiApiKey || process.env.GEMINI_API_KEY;

      if (!apiKey) return null;

      const cacheKey = `${apiKey}_${systemConfig?.aiTemperature}_${systemConfig?.aiMaxTokens}_${systemConfig?.stopSequences?.join(",")}_${modelName}`;
      if (this.modelCache.has(cacheKey)) {
        return this.modelCache.get(cacheKey);
      }

      let model;

      if (isDeepSeek) {
        model = new OpenAI({
          baseURL: "https://api.deepseek.com",
          apiKey: apiKey,
        });
        // attach config
        model.systemConfig = systemConfig;
      } else {
        const genAI = new GoogleGenerativeAI(apiKey);

        const generationConfig = {
          temperature: systemConfig?.aiTemperature ?? 0.7,
          topP: systemConfig?.aiTopP ?? 1.0,
          maxOutputTokens: systemConfig?.aiMaxTokens ?? 1024,
        };

        if (systemConfig?.stopSequences) {
          generationConfig.stopSequences = systemConfig.stopSequences;
        }

        const safetySettings = [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
        ];

        model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig,
          safetySettings,
        });
      }

      this.modelCache.set(cacheKey, model);
      return model;
    } catch (err) {
      console.error("[AIService] Failed to init model:", err);
      return null;
    }
  }

  static generateHash(text) {
    return crypto.createHash("sha256").update(text).digest("hex");
  }

  static handleAIError(error, language = "id") {
    const isBusy =
      error?.status === 429 ||
      error?.status === 503 ||
      (typeof error?.message === "string" &&
        (error.message.includes("429") ||
          error.message.includes("503") ||
          error.message.toLowerCase().includes("quota") ||
          error.message.toLowerCase().includes("too many requests") ||
          error.message.toLowerCase().includes("service unavailable") ||
          error.message.toLowerCase().includes("high demand")));

    if (isBusy) {
      return language === "en"
        ? "Waduh, the AI is a bit overwhelmed/busy right now (503). Please try again in 5-10 seconds! 🙏"
        : "Wah, AI-nya lagi sibuk banget bre (overload/503). Coba lagi 5-10 detik ya! 🙏";
    }

    if (error?.status === 404) {
      return language === "en"
        ? "AI model not found (404). Please contact support to check the configuration."
        : "Model AI nggak ketemu bre (404). Coba lapor admin buat cek settingannya!";
    }
    console.error("[AIService] Unhandled AI error:", error.message || error);
    return language === "en"
      ? "Sorry, there was a problem connecting to the AI. Please try again."
      : "Maaf, ada kendala teknis saat menghubungi AI. Coba lagi ya bre!";
  }

  static async getCachedResponse(ownerId, query, language) {
    try {
      const queryHash = this.generateHash(query);
      const targetOwnerId = ownerId || null;
      const cached = await prisma.aICache.findFirst({
        where: {
          ownerId: targetOwnerId,
          queryHash,
          language,
        },
      });
      return cached ? cached.response : null;
    } catch (err) {
      console.error("[AIService] Cache lookup error:", err);
      return null;
    }
  }

  static async saveToCache(ownerId, query, response, language) {
    try {
      const queryHash = this.generateHash(query);
      const targetOwnerId = ownerId || null;

      const existing = await prisma.aICache.findFirst({
        where: {
          ownerId: targetOwnerId,
          queryHash,
          language,
        },
      });

      if (existing) {
        await prisma.aICache.update({
          where: { id: existing.id },
          data: { response, updatedAt: new Date() },
        });
      } else {
        await prisma.aICache.create({
          data: {
            ownerId: targetOwnerId,
            query,
            queryHash,
            response,
            language,
          },
        });
      }
    } catch (err) {
      console.error("[AIService] Cache save error:", err);
    }
  }

  static async generateChatResponse(
    message,
    context,
    language = "id",
    systemPrompt,
    history = [],
    category = "RETAIL",
    ownerId,
    role = "REG",
    config,
  ) {
    const model = await this.getModel(ownerId, config);
    if (!model) {
      return "AI service is currently unavailable. (Missing API Key)";
    }

    let prompt = "";
    try {
      const languageInstruction =
        language === "en"
          ? "Respond exclusively in English."
          : "Respond exclusively in Indonesian.";
      const systemConfig =
        config ||
        (await prisma.systemConfig.findUnique({ where: { id: "global" } }));

      const aiTone = systemConfig?.aiTone || "HELPFUL";
      const aiSystemPrompt = systemConfig?.aiSystemPrompt || null;
      const companyName = systemConfig?.companyName || "HeartAI";

      let businessPersona = `You are ${companyName} v.1, a smart and friendly shopping assistant.`;

      let goalText = "GOAL: Help the user find what they need.";

      if (aiTone === "AGGRESSIVE") {
        businessPersona = `You are ${companyName} v.1, a proactive sales assistant.`;
        goalText = "GOAL: Drive sales suggestedly.";
      } else if (aiTone === "PROFESSIONAL") {
        businessPersona = `You are ${companyName} v.1, a formal corporate assistant.`;
        goalText = "GOAL: Provide direct assistance.";
      } else if (aiTone === "FRIENDLY") {
        businessPersona = `You are ${companyName} v.1, your super friendly helper!`;
        goalText = "GOAL: Help with enthusiasm.";
      }

      if (category === "HOTEL") {
        businessPersona = `You are ${companyName} v.1, a professional Hotel Concierge.`;
        goalText = "GOAL: Help guests with room info.";
      } else if (category === "SERVICE") {
        businessPersona = `You are ${companyName} v.1, a Service Support Assistant.`;
        goalText = "GOAL: Help clients understand pricing.";
      }

      const systemInstruction =
        aiSystemPrompt || systemPrompt || `${businessPersona} \n${goalText}`;
      const historyContext = history.map((h) => ({
        role: h.role === "user" ? "USER" : "AI",
        content: h.message,
      }));

      const aiInput = {
        r: role,
        m: message,
        c: category || "GEN",
        ctx: context,
        h: historyContext.slice(-5), // Take last 5 history items
      };

      const inputStr = JSON.stringify(aiInput);

      // Cache check
      const cached = await this.getCachedResponse(ownerId, inputStr, language);
      if (cached) return cached;

      prompt = `${systemInstruction}
${languageInstruction}

STRICT INST (JSON Schema):
r=Role, m=Msg, c=Cat, ctx=Context, h=History
1. IF r="QST": Sapa dengan ramah dan bantu user. Pastikan jawaban lengkap dan tidak terpotong.
2. IF r="REG": MODE=FULL. Personalized svc.
3. MD_SAFE (REG ONLY): Add [SAFE_IDS: id1, id2...] at end.

TAGS: [FOUND], [NOT_FOUND], [GENERAL]

IN (JSON):
${inputStr}

AI:`;

      const isDeepSeek = (systemConfig?.aiModel || "").includes("deepseek");
      let responseText = "";

      if (isDeepSeek) {
        const completion = await model.chat.completions.create({
          messages: [{ role: "system", content: prompt }],
          model: systemConfig?.aiModel || "deepseek-chat",
          temperature: systemConfig?.aiTemperature ?? 0.7,
          max_tokens: systemConfig?.aiMaxTokens ?? 1024,
          top_p: systemConfig?.aiTopP ?? 1.0,
        });
        responseText = completion.choices[0].message.content || "";
      } else {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        responseText = response.text();
      }

      // Save to cache
      await this.saveToCache(ownerId, inputStr, responseText, language);

      return responseText;
    } catch (error) {
      console.error("AI Service Error:", error);
      if (prompt)
        console.error("Prompt attempted:", prompt.substring(0, 500) + "...");
      return this.handleAIError(error, language);
    }
  }

  static async generateChatResponseStream(
    message,
    context,
    language = "id",
    systemPrompt,
    history = [],
    category = "RETAIL",
    ownerId,
    role = "REG",
    config,
    onChunk,
  ) {
    const model = await this.getModel(ownerId, config);
    if (!model) return "AI service unavailable.";

    try {
      const languageInstruction =
        language === "en"
          ? "Respond exclusively in English."
          : "Respond exclusively in Indonesian.";
      const systemConfig =
        config ||
        (await prisma.systemConfig.findUnique({ where: { id: "global" } }));
      const companyName = systemConfig?.companyName || "HeartAI";
      const systemInstruction =
        systemPrompt ||
        systemConfig?.aiSystemPrompt ||
        `You are ${companyName} v.1, a smart assistant.`;

      const aiInput = {
        r: role,
        m: message,
        ctx: context,
        h: history.slice(-5),
        s: systemInstruction,
        tokens: systemConfig?.aiMaxTokens,
      };
      const inputStr = JSON.stringify(aiInput);
      const historyContext = history.map((h) => ({
        role: h.role === "user" ? "USER" : "AI",
        content: h.message,
      }));

      const historyStr = history
        .slice(-5)
        .map((h) => `${h.role === "user" ? "USER" : "AI"}: ${h.message}`)
        .join("\n");

      const prompt = `INSTRUCTIONS:
${systemInstruction}
${languageInstruction}

Stricter Persona Guidelines:
1. ALWAYS respond in the requested language.
2. MANDATORY: Start EVERY response with exactly ONE tag: [FOUND], [NOT_FOUND], [SOP], [GENERAL], or [NAVIGATE: SOP].
3. STOCK AWARENESS: In CTX_PRODS, "S:0" means out of stock. If a product is in context but S:0, say "Stok Habis" or "Exhausted" instead of "Not found".
4. If USER ROLE is "QST": Be ${companyName}, a friendly store assistant. Help guests with products.
5. If USER ROLE is "REG": Be ${companyName}, providing personalized service.
6. If USER ROLE is "MGMT" or message is about SOP/DOCS: YOU ARE ${companyName}-MGMT, the Company Management Assistant. Provide COMPLETE, DETAILED summaries. NEVER truncate or cut off mid-sentence.
7. Use [NAVIGATE: SOP] if the user asks to see/show the full document. Keep the response brief ONLY when a redirect is triggered.

DATA:
- USER ROLE: ${role}
- USER MESSAGE: ${message}
- CATEGORY: ${category || "GENERAL"}
- CONTEXT: ${context}

CONVERSATION HISTORY:
${historyStr || "None"}

AI Response:`;

      // Cache check
      const cached = await this.getCachedResponse(ownerId, inputStr, language);
      if (cached) {
        if (onChunk) onChunk(cached);
        return cached;
      }

      let attempts = 0;
      const maxRetries = 1;

      const isDeepSeek = (systemConfig?.aiModel || "").includes("deepseek");

      while (attempts <= maxRetries) {
        try {
          let fullText = "";

          if (isDeepSeek) {
            const stream = await model.chat.completions.create({
              messages: [{ role: "system", content: prompt }],
              model: systemConfig?.aiModel || "deepseek-chat",
              temperature: systemConfig?.aiTemperature ?? 0.7,
              max_tokens: systemConfig?.aiMaxTokens ?? 1024,
              top_p: systemConfig?.aiTopP ?? 1.0,
              stream: true,
            });

            for await (const chunk of stream) {
              const chunkText = chunk.choices[0]?.delta?.content || "";
              if (chunkText) {
                fullText += chunkText;
                if (onChunk) onChunk(chunkText);
              }
            }
          } else {
            const result = await model.generateContentStream(prompt);
            for await (const chunk of result.stream) {
              const chunkText = chunk.text();
              fullText += chunkText;
              if (onChunk) onChunk(chunkText);
            }
          }

          // Save to cache
          await this.saveToCache(ownerId, inputStr, fullText, language);

          return fullText;
        } catch (error) {
          const isTransient =
            error?.status === 429 ||
            error?.status === 503 ||
            (typeof error?.message === "string" &&
              (error.message.includes("503") || error.message.includes("429")));

          if (isTransient && attempts < maxRetries) {
            attempts++;
            console.log(
              `[AIService] Transient error (${error.status || "503"}), retrying... Attempt ${attempts}`,
            );
            await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1s before retry
            continue;
          }
          throw error;
        }
      }
      return "AI Busy"; // Should not reach here
    } catch (error) {
      console.error("AI Stream Error:", error);
      const errorMsg = this.handleAIError(error, language);
      if (onChunk) onChunk(errorMsg);
      return errorMsg;
    }
  }

  static async generateGuestResponseStream(
    message,
    context,
    language = "id",
    systemPrompt,
    config,
    onChunk,
    history = [],
  ) {
    const guestConfig = {
      ...config,
      aiTemperature: 0.7,
      aiTopP: 1.0,
    };

    const model = await this.getModel(undefined, guestConfig);
    if (!model) return "AI service unavailable.";

    try {
      const languageInstruction =
        language === "en" ? "Respond in English." : "Respond in Indonesian.";
      const systemInstruction =
        systemPrompt || "Greet user and offer help. Natural and informative.";
      const historyStr = history
        .slice(-5)
        .map((h) => `${h.role === "user" ? "USER" : "AI"}: ${h.message}`)
        .join("\n");

      const aiInput = {
        r: "QST",
        m: message,
        c: "GEN",
        ctx: context,
        h: history.slice(-5),
        s: systemInstruction,
        tokens: guestConfig?.aiMaxTokens,
      };
      const inputStr = JSON.stringify(aiInput);

      // Cache check
      const cached = await this.getCachedResponse(
        undefined,
        inputStr,
        language,
      );
      if (cached) {
        if (onChunk) onChunk(cached);
        return cached;
      }

      const companyName =
        guestConfig?.companyName ||
        (await prisma.systemConfig.findUnique({ where: { id: "global" } }))
          ?.companyName ||
        "HeartAI";
      const roleInstruction =
        systemInstruction.includes(`${companyName}-MGMT`) ||
        systemInstruction.includes("Management")
          ? `Role: ${companyName}-MGMT, Company Management Assistant. 
           1. MANDATORY: Start EVERY response with exactly ONE tag: [SOP], [GENERAL], or [NAVIGATE: SOP].
           2. NEVER greet as "${companyName}" or a shopping assistant.
           3. Focus EXCLUSIVELY on internal policies and data.
           4. Be professional and authoritative.`
          : `Role: Friendly Store Concierge (GUEST). 
           1. MANDATORY: Start EVERY response with exactly ONE tag: [FOUND], [NOT_FOUND], [GENERAL].
           2. STOCK: If product S:0 in context, say "Stok Habis".
           3. Berikan jawaban yang ramah, natural, dan lengkap.
           4. JANGAN memotong kalimat. Selesaikan penjelasan sampai tuntas.
           5. Gunakan data CONTEXT untuk membantu user menemukan produk (Aisle/Rack).`;

      const prompt = `INSTRUCTIONS:
${systemInstruction}
${languageInstruction}

${roleInstruction}

USER MESSAGE: ${message}
CONTEXT: ${context}
CONVERSATION HISTORY:
${historyStr || "None"}

AI Response:`;

      let attempts = 0;
      const maxRetries = 1;
      const systemConfig =
        guestConfig ||
        (await prisma.systemConfig.findUnique({ where: { id: "global" } }));
      const isDeepSeek = (systemConfig?.aiModel || "").includes("deepseek");

      while (attempts <= maxRetries) {
        try {
          let fullText = "";

          if (isDeepSeek) {
            const stream = await model.chat.completions.create({
              messages: [{ role: "system", content: prompt }],
              model: systemConfig?.aiModel || "deepseek-chat",
              temperature: guestConfig?.aiTemperature ?? 0.7,
              max_tokens: guestConfig?.aiMaxTokens ?? 1024,
              top_p: guestConfig?.aiTopP ?? 1.0,
              stream: true,
            });

            for await (const chunk of stream) {
              const chunkText = chunk.choices[0]?.delta?.content || "";
              if (chunkText) {
                fullText += chunkText;
                if (onChunk) onChunk(chunkText);
              }
            }
          } else {
            const result = await model.generateContentStream(prompt);
            for await (const chunk of result.stream) {
              const chunkText = chunk.text();
              fullText += chunkText;
              if (onChunk) onChunk(chunkText);
            }
          }

          // Save to cache
          await this.saveToCache(undefined, inputStr, fullText, language);

          return fullText;
        } catch (error) {
          const isTransient =
            error?.status === 429 ||
            error?.status === 503 ||
            (typeof error?.message === "string" &&
              (error.message.includes("503") || error.message.includes("429")));

          if (isTransient && attempts < maxRetries) {
            attempts++;
            console.log(
              `[AIService] Transient Guest error (${error.status || "503"}), retrying... Attempt ${attempts}`,
            );
            await new Promise((resolve) => setTimeout(resolve, 1000));
            continue;
          }
          throw error;
        }
      }
      return "AI Busy";
    } catch (error) {
      console.error("Gemini Guest Stream Error:", error);
      const errorMsg = this.handleAIError(error, language);
      if (onChunk) onChunk(errorMsg);
      return errorMsg;
    }
  }

  static async generateSystemResponse(
    message,
    systemPrompt,
    history = [],
    config = {},
    modelName = "gemini-1.5-flash",
    temperature = 0.1,
  ) {
    try {
      const systemConfig = await prisma.systemConfig.findUnique({
        where: { id: "global" },
      });
      const apiKey =
        systemConfig?.geminiApiKey || process.env.GEMINI_API_KEY || "";

      if (!apiKey)
        throw new Error(
          "API Key missing for system response (check System Configuration)",
        );

      const genAI = new GoogleGenerativeAI(apiKey);

      const model = genAI.getGenerativeModel({
        model: modelName || "gemini-1.5-flash",
        systemInstruction: systemPrompt,
      });

      const formattedHistory = history.map((msg) => ({
        role: msg.role === "ai" ? "model" : "user",
        parts: [{ text: msg.message || msg.content || "" }],
      }));

      const chat = model.startChat({
        history: formattedHistory,
        generationConfig: { temperature, ...config },
      });

      const result = await chat.sendMessage(message);
      return result.response.text();
    } catch (error) {
      console.error(
        "[AIService] generateSystemResponse Error:",
        error.message || error,
      );

      // Fallback for 404 (model not found) or 403 (restricted access)
      if (
        (error?.status === 404 || error?.status === 403) &&
        modelName !== "gemini-pro"
      ) {
        const fallbackModel =
          modelName === "gemini-1.5-flash" ? "gemini-pro" : "gemini-1.5-flash";
        console.warn(
          `[AIService] Model ${modelName} failed (${error?.status}), retrying with ${fallbackModel} fallback...`,
        );
        return this.generateSystemResponse(
          message,
          systemPrompt,
          history,
          config,
          fallbackModel,
          temperature,
        );
      }
      throw error;
    }
  }

  static async generateGuestResponse(
    message,
    context,
    language = "id",
    systemPrompt,
    config,
  ) {
    return this.generateGuestResponseStream(
      message,
      context,
      language,
      systemPrompt,
      config,
    );
  }

  static async generateManagementResponse(message, context, userRole, config) {
    const model = await this.getModel(undefined, config);
    if (!model) return "AI service unavailable.";

    try {
      const companyName =
        config?.companyName ||
        (await prisma.systemConfig.findUnique({ where: { id: "global" } }))
          ?.companyName ||
        "HeartAI";
      const systemInstruction = `You are ${companyName}-MGMT, the Company Management Assistant. Role: ${userRole}.
      Your primary purpose is to analyze internal store data and company SOPs/policies. 
      You are NOT a shopping assistant in this mode. Do not suggest products to customers or discuss shopping unless specifically related to inventory management or manager duties.`;
      const aiInput = { role: "MGMT", m: message, c: "ANALYSIS", ctx: context };

      const prompt = `${systemInstruction}
Analyze the company data and SOP documents accurately. Be professional and authoritative.
PRIORITY RULE: If the user asks about internal rules, procedures, SOPs, or policies, YOU MUST prioritize checking the \`companyDocs\` inside the JSON context.
Quote the exact text or reference the exact document title and section when answering.

IN (JSON):
${JSON.stringify(aiInput)}

AI:`;

      let attempts = 0;
      const maxRetries = 1;
      const isDeepSeek = (config?.aiModel || "").includes("deepseek");

      while (attempts <= maxRetries) {
        try {
          let responseText = "";
          if (isDeepSeek) {
            const completion = await model.chat.completions.create({
              messages: [{ role: "system", content: prompt }],
              model: config?.aiModel || "deepseek-chat",
              temperature: config?.aiTemperature ?? 0.7,
              max_tokens: config?.aiMaxTokens ?? 1024,
              top_p: config?.aiTopP ?? 1.0,
            });
            responseText = completion.choices[0].message.content || "";
          } else {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            responseText = response.text();
          }
          return responseText;
        } catch (error) {
          const isTransient =
            error?.status === 429 ||
            error?.status === 503 ||
            (typeof error?.message === "string" &&
              (error.message.includes("503") || error.message.includes("429")));

          if (isTransient && attempts < maxRetries) {
            attempts++;
            console.log(
              `[AIService] Transient Mgmt error (${error.status || "503"}), retrying... Attempt ${attempts}`,
            );
            await new Promise((resolve) => setTimeout(resolve, 2000));
            continue;
          }
          throw error;
        }
      }
      return "AI Busy";
    } catch (error) {
      console.error("AI Mgmt Error:", error);
      return this.handleAIError(error);
    }
  }
}
