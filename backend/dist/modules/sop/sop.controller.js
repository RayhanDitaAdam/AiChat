import { SopService } from './sop.service.js';
import { SopParser } from './sop.parser.js';
import fs from 'fs';
import path from 'path';
export class SopController {
    sopService;
    constructor() {
        this.sopService = new SopService();
    }
    async uploadSop(req, res) {
        try {
            const ownerId = req.user?.ownerId || req.user?.memberOfId;
            if (!ownerId) {
                return res.status(403).json({ status: 'error', message: 'Not an owner or staff' });
            }
            const file = req.file;
            const { title } = req.body;
            if (!file) {
                return res.status(400).json({ status: 'error', message: 'No file uploaded' });
            }
            if (!title) {
                return res.status(400).json({ status: 'error', message: 'Title is required' });
            }
            const fileUrl = `/uploads/documents/${file.filename}`;
            // Optimization: Extract text once on upload
            let extractedContent = null;
            try {
                extractedContent = await SopParser.extractText(fileUrl, file.mimetype);
            }
            catch (err) {
                console.error('Text extraction failed during upload:', err);
            }
            const sop = await this.sopService.createSop(ownerId, title, fileUrl, file.mimetype, extractedContent);
            res.status(201).json({
                status: 'success',
                message: 'SOP uploaded successfully',
                data: sop
            });
        }
        catch (error) {
            console.error('Error uploading SOP:', error);
            res.status(500).json({ status: 'error', message: 'Failed to upload SOP' });
        }
    }
    async getSops(req, res) {
        try {
            const ownerId = req.user?.ownerId || req.user?.memberOfId;
            if (!ownerId) {
                return res.status(403).json({ status: 'error', message: 'Not an owner or staff' });
            }
            const sops = await this.sopService.getSopsByOwner(ownerId);
            res.json({
                status: 'success',
                data: sops
            });
        }
        catch (error) {
            console.error('Error fetching SOPs:', error);
            res.status(500).json({ status: 'error', message: 'Failed to fetch SOPs' });
        }
    }
    async deleteSop(req, res) {
        try {
            const ownerId = req.user?.ownerId || req.user?.memberOfId;
            const id = req.params.id;
            if (!ownerId) {
                return res.status(403).json({ status: 'error', message: 'Not an owner or staff' });
            }
            if (!id) {
                return res.status(400).json({ status: 'error', message: 'ID is required' });
            }
            const sop = await this.sopService.deleteSop(id, ownerId);
            // Also delete the physical file
            if (sop && sop.fileUrl) {
                const filePath = path.join(process.cwd(), sop.fileUrl);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
            res.json({
                status: 'success',
                message: 'SOP deleted successfully'
            });
        }
        catch (error) {
            console.error('Error deleting SOP:', error);
            res.status(error.message.includes('not found') ? 404 : 500).json({
                status: 'error',
                message: error.message || 'Failed to delete SOP'
            });
        }
    }
    async updateSopText(req, res) {
        try {
            const ownerId = req.user?.ownerId || req.user?.memberOfId;
            const id = req.params.id;
            const { content } = req.body;
            if (!ownerId) {
                return res.status(403).json({ status: 'error', message: 'Not an owner or staff' });
            }
            if (!id || content === undefined) {
                return res.status(400).json({ status: 'error', message: 'ID and content are required' });
            }
            const sop = await this.sopService.updateSopText(id, ownerId, content);
            res.json({
                status: 'success',
                message: 'SOP content updated successfully',
                data: sop
            });
        }
        catch (error) {
            console.error('Error updating SOP:', error);
            res.status(error.message.includes('not found') ? 404 : 500).json({
                status: 'error',
                message: error.message || 'Failed to update SOP'
            });
        }
    }
}
//# sourceMappingURL=sop.controller.js.map