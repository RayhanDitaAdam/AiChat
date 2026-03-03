import { AIService } from '../../common/services/ai.service.js';
import { StatService } from '../stat/stat.service.js';
import { ProductService } from '../product/product.service.js';
import { VacancyService } from '../vacancy/vacancy.service.js';
import { SopService } from '../sop/sop.service.js';
const statService = new StatService();
const productService = new ProductService();
const vacancyService = new VacancyService();
const sopService = new SopService();
export class ManagementChatController {
    async chat(req, res) {
        try {
            if (!req.user || (req.user.role !== 'OWNER' && req.user.role !== 'ADMIN')) {
                return res.status(403).json({ status: 'error', message: 'Forbidden' });
            }
            const { message } = req.body;
            let context = "";
            if (req.user.role === 'OWNER' && req.user.ownerId) {
                const [stats, products, forecasting, vacancies, sops] = await Promise.all([
                    statService.getOwnerStats(req.user.ownerId),
                    productService.getProductsByOwner(req.user.ownerId),
                    productService.identifyFastMovingProducts(req.user.ownerId),
                    vacancyService.getVacancies(req.user.ownerId),
                    sopService.getSopsByOwner(req.user.ownerId)
                ]);
                // Fetch SOPs from DB (content is pre-extracted on upload)
                console.log(`[AI-Chat] Fetching SOPs for owner ${req.user.ownerId}... Found: ${sops.length}`);
                const parsedSops = sops.map((sop) => ({
                    title: sop.title,
                    type: sop.fileType,
                    content: (sop.content || '').substring(0, 15000) // cap to 15k chars per SOP
                }));
                context = JSON.stringify({
                    stats: stats.stats,
                    productCount: products.products.length,
                    fastMoving: forecasting.fastMoving,
                    nearbyDemand: forecasting.demandedFromMissing,
                    vacancies: vacancies.vacancies,
                    companyDocs: parsedSops
                });
            }
            else if (req.user.role === 'ADMIN') {
                const stats = await statService.getGlobalStats();
                context = JSON.stringify(stats.stats);
            }
            const response = await AIService.generateManagementResponse(message, context, req.user.role);
            return res.json({ status: 'success', response });
        }
        catch (error) {
            console.error('Management Chat Error:', error);
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }
}
//# sourceMappingURL=management-chat.controller.js.map