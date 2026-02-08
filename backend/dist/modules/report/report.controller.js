import * as reportService from './report.service.js';
export const getSalesAnalytics = async (req, res) => {
    try {
        const user = req.user;
        if (!user || !user.ownerId)
            return res.status(401).json({ status: 'error', message: 'Unauthorized' });
        const { period } = req.query;
        const data = await reportService.getSalesAnalytics(user.ownerId, period);
        res.status(200).json({ status: 'success', data });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
export const getTopSellingProducts = async (req, res) => {
    try {
        const user = req.user;
        if (!user || !user.ownerId)
            return res.status(401).json({ status: 'error', message: 'Unauthorized' });
        const { limit } = req.query;
        const data = await reportService.getTopSellingProducts(user.ownerId, Number(limit) || 5);
        res.status(200).json({ status: 'success', data });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
export const getStockAlerts = async (req, res) => {
    try {
        const user = req.user;
        if (!user || !user.ownerId)
            return res.status(401).json({ status: 'error', message: 'Unauthorized' });
        const { threshold } = req.query;
        const data = await reportService.getStockAlerts(user.ownerId, Number(threshold) || 10);
        res.status(200).json({ status: 'success', data });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
//# sourceMappingURL=report.controller.js.map