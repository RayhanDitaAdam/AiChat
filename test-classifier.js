import { IntentClassifier } from "./backend/src/modules/chat/services/intent-classifier.util.js";

const messages = [
    "Switch to English mode now. Please respond in English.",
    "Ganti ke mode Bahasa Indonesia sekarang. Mohon respon dalam Bahasa Indonesia."
];

messages.forEach(msg => {
    console.log(`Message: "${msg}"`);
    console.log(`Intent: ${IntentClassifier.classifyIntent(msg)}`);
});
