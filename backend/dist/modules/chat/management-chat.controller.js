import { AIService } from '../../common/services/ai.service.js';
import { StatService } from '../stat/stat.service.js';
import { ProductService } from '../product/product.service.js';
import { VacancyService } from '../vacancy/vacancy.service.js';
const statService = new StatService();
const productService = new ProductService();
const vacancyService = new VacancyService();
export class ManagementChatController {
    async chat(req, res) {
        try {
            if (!req.user || (req.user.role !== 'OWNER' && req.user.role !== 'ADMIN')) {
                return res.status(403).json({ status: 'error', message: 'Forbidden' });
            }
            const { message } = req.body;
            let context = "";
            if (req.user.role === 'OWNER' && req.user.ownerId) {
                const [stats, products, forecasting, vacancies] = await Promise.all([
                    statService.getOwnerStats(req.user.ownerId),
                    productService.getProductsByOwner(req.user.ownerId),
                    productService.identifyFastMovingProducts(req.user.ownerId),
                    vacancyService.getVacancies(req.user.ownerId)
                ]);
                context = JSON.stringify({
                    stats: stats.stats,
                    productCount: products.products.length,
                    fastMoving: forecasting.fastMoving,
                    nearbyDemand: forecasting.demandedFromMissing,
                    vacancies: vacancies.vacancies
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