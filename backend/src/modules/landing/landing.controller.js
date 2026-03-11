import { LandingService } from './landing.service.js';

export class LandingController {
    constructor() {
        this.landingService = new LandingService();
    }

    async getPublicSections(req, res) {
        try {
            const { preview, token } = req.query;
            if (preview === 'true' && token) {
                const isValid = await this.landingService.validatePreviewToken(token);
                if (isValid) {
                    const sections = await this.landingService.getAdminSections();
                    return res.json(sections);
                }
            }
            const sections = await this.landingService.getPublicSections();
            res.json(sections);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getAdminSections(req, res) {
        try {
            const sections = await this.landingService.getAdminSections();
            res.json(sections);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async createSection(req, res) {
        try {
            const section = await this.landingService.createSection(req.body);
            res.status(201).json(section);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async saveDraft(req, res) {
        try {
            const { id } = req.params;
            const draft = await this.landingService.saveDraft(id, req.body);
            res.json(draft);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async publishSection(req, res) {
        try {
            const { id } = req.params;
            await this.landingService.publishSection(id);
            res.json({ message: 'Section published successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getRevisionHistory(req, res) {
        try {
            const { id } = req.params;
            const history = await this.landingService.getRevisionHistory(id);
            res.json(history);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async restoreRevision(req, res) {
        try {
            const { id } = req.params;
            const draft = await this.landingService.restoreRevision(id);
            res.json(draft);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async updateSection(req, res) {
        try {
            const { id } = req.params;
            const section = await this.landingService.updateSection(id, req.body);
            res.json(section);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async deleteSection(req, res) {
        try {
            const { id } = req.params;
            await this.landingService.deleteSection(id);
            res.json({ message: 'Section deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async reorderSections(req, res) {
        try {
            await this.landingService.reorderSections(req.body);
            res.json({ message: 'Sections reordered successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getPageConfig(req, res) {
        try {
            const config = await this.landingService.getPageConfig();
            res.json(config);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async updatePageConfig(req, res) {
        try {
            const config = await this.landingService.updatePageConfig(req.body);
            res.json(config);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async generatePreviewToken(req, res) {
        try {
            const token = await this.landingService.generatePreviewToken();
            res.json({ token });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}
