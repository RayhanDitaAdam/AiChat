import { AIService } from './src/common/services/ai.service';
import dotenv from 'dotenv';

dotenv.config();

async function test() {
    console.log("Testing AI Guest Response...");
    try {
        const response = await AIService.generateGuestResponse(
            "Halo heart",
            "NONE",
            "id",
            "You are a helpful assistant.",
            null
        );
        console.log("AI Response:", response);
    } catch (err) {
        console.error("Test failed with error:", err);
    }
}

test();
