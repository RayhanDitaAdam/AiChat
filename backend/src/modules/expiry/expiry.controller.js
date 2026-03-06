 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
import { ExpiryService } from './expiry.service.js';

export class ExpiryController {
    

    constructor() {
        this.expiryService = new ExpiryService();
    }

    async getExpiries(req, res) {
        try {
            const ownerId = _optionalChain([req, 'access', _ => _.user, 'optionalAccess', _2 => _2.ownerId]) || _optionalChain([req, 'access', _3 => _3.user, 'optionalAccess', _4 => _4.id]);
            if (!ownerId) {
                return res.status(403).json({ success: false, message: 'Unauthorized access' });
            }

            const expiries = await this.expiryService.getExpiries(ownerId);
            res.json({ success: true, data: expiries });
        } catch (error) {
            console.error('Get Expiries Error:', error);
            res.status(500).json({ success: false, message: error.message || 'Failed to fetch expiries' });
        }
    }

    async createExpiry(req, res) {
        try {
            const ownerId = _optionalChain([req, 'access', _5 => _5.user, 'optionalAccess', _6 => _6.ownerId]) || _optionalChain([req, 'access', _7 => _7.user, 'optionalAccess', _8 => _8.id]);
            if (!ownerId) {
                return res.status(403).json({ success: false, message: 'Unauthorized access' });
            }

            const { date } = req.body;
            if (!date) {
                return res.status(400).json({ success: false, message: 'Date is required' });
            }

            const expiry = await this.expiryService.createExpiry(ownerId, new Date(date));
            res.status(201).json({ success: true, data: expiry });
        } catch (error) {
            console.error('Create Expiry Error:', error);
            res.status(500).json({ success: false, message: error.message || 'Failed to create expiry grouping' });
        }
    }

    async deleteExpiry(req, res) {
        try {
            const ownerId = _optionalChain([req, 'access', _9 => _9.user, 'optionalAccess', _10 => _10.ownerId]) || _optionalChain([req, 'access', _11 => _11.user, 'optionalAccess', _12 => _12.id]);
            const { id } = req.params;

            if (!ownerId || !id) {
                return res.status(400).json({ success: false, message: 'Invalid parameters' });
            }

            await this.expiryService.deleteExpiry(ownerId, id );
            res.json({ success: true, message: 'Expiry group deleted successfully' });
        } catch (error) {
            console.error('Delete Expiry Error:', error);
            res.status(500).json({ success: false, message: error.message || 'Failed to delete expiry' });
        }
    }

    async assignProduct(req, res) {
        try {
            const ownerId = _optionalChain([req, 'access', _13 => _13.user, 'optionalAccess', _14 => _14.ownerId]) || _optionalChain([req, 'access', _15 => _15.user, 'optionalAccess', _16 => _16.id]);
            const { id: productExpiryId } = req.params;
            const { productId, quantity } = req.body;

            if (!ownerId || !productExpiryId || !productId) {
                return res.status(400).json({ success: false, message: 'Invalid parameters' });
            }

            const item = await this.expiryService.assignProduct(productExpiryId , productId, ownerId, quantity);
            res.status(201).json({ success: true, data: item });
        } catch (error) {
            console.error('Assign Product Error:', error);
            res.status(500).json({ success: false, message: error.message || 'Failed to assign product' });
        }
    }

    async removeProduct(req, res) {
        try {
            const ownerId = _optionalChain([req, 'access', _17 => _17.user, 'optionalAccess', _18 => _18.ownerId]) || _optionalChain([req, 'access', _19 => _19.user, 'optionalAccess', _20 => _20.id]);
            const { id: productExpiryId, productId } = req.params;

            if (!ownerId || !productExpiryId || !productId) {
                return res.status(400).json({ success: false, message: 'Invalid parameters' });
            }

            await this.expiryService.removeProduct(productExpiryId , productId , ownerId);
            res.json({ success: true, message: 'Product removed from expiry group' });
        } catch (error) {
            console.error('Remove Product Error:', error);
            res.status(500).json({ success: false, message: error.message || 'Failed to remove product' });
        }
    }
}
