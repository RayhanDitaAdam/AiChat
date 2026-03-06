import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
let pdfParseRaw = require('pdf-parse');
// Handle different export styles for pdf-parse 2.x+
const pdfParse = pdfParseRaw.PDFParse || pdfParseRaw.default || (typeof pdfParseRaw === 'function' ? pdfParseRaw : null);

export class SopParser {
    /**
     * Resolves the real file path from the fileUrl string and extracts its text.
     * Handles local /uploads files.
     */
    static async extractText(fileUrl: string, fileType: string): Promise<string> {
        try {
            // Most files are stored locally in /uploads/...
            // e.g. /uploads/sop-170123...pdf
            const baseUrl = '/uploads/';
            let absolutePath = '';

            if (fileUrl.startsWith(baseUrl)) {
                // Resolve to the actual folder structure on disk
                // Remove leading slash to prevent path.join from treating it as root
                const relativePath = fileUrl.replace(/^\/+/, '');
                absolutePath = path.join(process.cwd(), relativePath);
            } else {
                // If it's a full URL or another format, we might need axios to download it.
                // Assuming local FS for now based on typical multer setups here.
                absolutePath = path.resolve(fileUrl);
            }

            if (!fs.existsSync(absolutePath)) {
                console.warn(`[SopParser] File not found at ${absolutePath}`);
                return '';
            }

            const fileBuffer = fs.readFileSync(absolutePath);

            if (fileType === 'application/pdf') {
                // pdf-parse v2+ class-based API
                try {
                    const parser = new (pdfParse as any)({ data: fileBuffer });
                    const result = await parser.getText();
                    return result.text || '';
                } catch (err) {
                    // Fallback for different factory styles if constructor fails
                    console.warn('[SopParser] Primary PDF extraction failed, trying fallback...', err);
                    const data = await (pdfParse as any)(fileBuffer);
                    return data?.text || '';
                }
            }
            else if (
                fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                fileType === 'application/msword' ||
                absolutePath.endsWith('.docx')
            ) {
                const result = await mammoth.extractRawText({ buffer: fileBuffer });
                return result.value;
            }

            console.warn(`[SopParser] Unsupported fileType: ${fileType} for ${fileUrl}`);
            return '';

        } catch (error) {
            console.error(`[SopParser] Failed to parse ${fileUrl}:`, error);
            return ''; // Gracefully fail parsing rather than crashing the chat context
        }
    }
}
