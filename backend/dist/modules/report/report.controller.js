import * as reportService from './report.service.js';
export const getSalesAnalytics = async (req, res) => {
    try {
        const user = req.user;
        const effectiveStoreId = user?.ownerId || user?.memberOfId;
        if (!user || !effectiveStoreId)
            return res.status(401).json({ status: 'error', message: 'Unauthorized' });
        const contributorId = user.role === 'CONTRIBUTOR' ? user.id : undefined;
        const { period } = req.query;
        const data = await reportService.getSalesAnalytics(effectiveStoreId, period, contributorId);
        res.status(200).json({ status: 'success', data });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
export const getComprehensiveReport = async (req, res) => {
    try {
        const user = req.user;
        const effectiveStoreId = user?.ownerId || user?.memberOfId;
        if (!user || !effectiveStoreId)
            return res.status(401).json({ status: 'error', message: 'Unauthorized' });
        const contributorId = user.role === 'CONTRIBUTOR' ? user.id : undefined;
        const { startDate, endDate } = req.query;
        const data = await reportService.getComprehensiveReport(effectiveStoreId, startDate, endDate, contributorId);
        res.status(200).json({ status: 'success', data });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
export const getTopSellingProducts = async (req, res) => {
    try {
        const user = req.user;
        const effectiveStoreId = user?.ownerId || user?.memberOfId;
        if (!user || !effectiveStoreId)
            return res.status(401).json({ status: 'error', message: 'Unauthorized' });
        const contributorId = user.role === 'CONTRIBUTOR' ? user.id : undefined;
        const { limit } = req.query;
        const data = await reportService.getTopSellingProducts(effectiveStoreId, Number(limit) || 5, contributorId);
        res.status(200).json({ status: 'success', data });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
export const getStockAlerts = async (req, res) => {
    try {
        const user = req.user;
        const effectiveStoreId = user?.ownerId || user?.memberOfId;
        if (!user || !effectiveStoreId)
            return res.status(401).json({ status: 'error', message: 'Unauthorized' });
        const contributorId = user.role === 'CONTRIBUTOR' ? user.id : undefined;
        const { threshold } = req.query;
        const data = await reportService.getStockAlerts(effectiveStoreId, Number(threshold) || 10, contributorId);
        res.status(200).json({ status: 'success', data });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
//# sourceMappingURL=report.controller.js.map