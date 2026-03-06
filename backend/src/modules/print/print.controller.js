 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
import printService from './print.service.js';
import { ShoppingListService } from '../shopping-list/shopping-list.service.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const shoppingListService = new ShoppingListService();

export class PrintController {
    async printShoppingList(req, res) {
        try {
            if (!req.user) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

            // Fetch user printer settings
            const user = await prisma.user.findUnique({
                where: { id: req.user.id }
            }) ;

            if (!_optionalChain([user, 'optionalAccess', _ => _.printerIp]) || !_optionalChain([user, 'optionalAccess', _2 => _2.printerPort])) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Printer settings not configured. Please set them in your profile.'
                });
            }

            // Fetch shopping list items
            const result = await shoppingListService.getOrCreateShoppingList(req.user.id);
            const list = result.list;

            if (!list || !list.items || list.items.length === 0) {
                return res.status(400).json({ status: 'error', message: 'Shopping list is empty' });
            }

            // Format content
            const content = printService.formatShoppingList(user.name || 'User', list.items);

            // Send to printer
            const printResult = await printService.sendToPrinter(user.printerIp, user.printerPort, content);

            if (printResult.success) {
                return res.json({ status: 'success', message: printResult.message });
            } else {
                return res.status(500).json({ status: 'error', message: printResult.message });
            }

        } catch (error) {
            console.error('Print Error:', error);
            return res.status(500).json({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to print'
            });
        }
    }
}
