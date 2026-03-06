 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
import * as reportService from './report.service.js';

export const getSalesAnalytics = async (req, res) => {
    try {
        const user = (req ).user;
        const effectiveStoreId = _optionalChain([user, 'optionalAccess', _ => _.ownerId]) || _optionalChain([user, 'optionalAccess', _2 => _2.memberOfId]);

        if (!user || !effectiveStoreId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

        const contributorId = user.role === 'CONTRIBUTOR' ? user.id : undefined;
        const { period } = req.query;
        const data = await reportService.getSalesAnalytics(effectiveStoreId, period , contributorId);
        res.status(200).json({ status: 'success', data });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const getComprehensiveReport = async (req, res) => {
    try {
        const user = (req ).user;
        const effectiveStoreId = _optionalChain([user, 'optionalAccess', _3 => _3.ownerId]) || _optionalChain([user, 'optionalAccess', _4 => _4.memberOfId]);

        if (!user || !effectiveStoreId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

        const contributorId = user.role === 'CONTRIBUTOR' ? user.id : undefined;
        const { startDate, endDate } = req.query;

        const data = await reportService.getComprehensiveReport(
            effectiveStoreId,
            startDate ,
            endDate ,
            contributorId
        );

        res.status(200).json({ status: 'success', data });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const getTopSellingProducts = async (req, res) => {
    try {
        const user = (req ).user;
        const effectiveStoreId = _optionalChain([user, 'optionalAccess', _5 => _5.ownerId]) || _optionalChain([user, 'optionalAccess', _6 => _6.memberOfId]);

        if (!user || !effectiveStoreId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

        const contributorId = user.role === 'CONTRIBUTOR' ? user.id : undefined;
        const { limit } = req.query;
        const data = await reportService.getTopSellingProducts(effectiveStoreId, Number(limit) || 5, contributorId);
        res.status(200).json({ status: 'success', data });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const getStockAlerts = async (req, res) => {
    try {
        const user = (req ).user;
        const effectiveStoreId = _optionalChain([user, 'optionalAccess', _7 => _7.ownerId]) || _optionalChain([user, 'optionalAccess', _8 => _8.memberOfId]);

        if (!user || !effectiveStoreId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

        const contributorId = user.role === 'CONTRIBUTOR' ? user.id : undefined;
        const { threshold } = req.query;
        const data = await reportService.getStockAlerts(effectiveStoreId, Number(threshold) || 10, contributorId);
        res.status(200).json({ status: 'success', data });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
