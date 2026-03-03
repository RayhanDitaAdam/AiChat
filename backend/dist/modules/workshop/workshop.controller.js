import {} from 'express';
import { workshopService } from './workshop.service.js';
const str = (v) => {
    if (Array.isArray(v))
        return typeof v[0] === 'string' ? v[0] : '';
    return typeof v === 'string' ? v : '';
};
class WorkshopController {
    getOwnerId(req) {
        const user = req.user;
        return user?.ownerId || user?.memberOfId || '';
    }
    // ── Work Orders ───────────────────────────────────────────────────────────
    async getWorkOrders(req, res) {
        try {
            const statusStr = str(req.query['status']);
            const result = await workshopService.getWorkOrders(this.getOwnerId(req), statusStr ? statusStr : undefined);
            res.json(result);
        }
        catch (e) {
            res.status(400).json({ status: 'error', message: e.message });
        }
    }
    async createWorkOrder(req, res) {
        try {
            res.status(201).json(await workshopService.createWorkOrder(this.getOwnerId(req), req.body));
        }
        catch (e) {
            res.status(400).json({ status: 'error', message: e.message });
        }
    }
    async updateWorkOrder(req, res) {
        try {
            res.json(await workshopService.updateWorkOrder(str(req.params['id']), this.getOwnerId(req), req.body));
        }
        catch (e) {
            res.status(400).json({ status: 'error', message: e.message });
        }
    }
    async deleteWorkOrder(req, res) {
        try {
            res.json(await workshopService.deleteWorkOrder(str(req.params['id']), this.getOwnerId(req)));
        }
        catch (e) {
            res.status(400).json({ status: 'error', message: e.message });
        }
    }
    async addItem(req, res) {
        try {
            res.status(201).json(await workshopService.addItem(str(req.params['workOrderId']), this.getOwnerId(req), req.body));
        }
        catch (e) {
            res.status(400).json({ status: 'error', message: e.message });
        }
    }
    async deleteItem(req, res) {
        try {
            res.json(await workshopService.deleteItem(str(req.params['itemId']), this.getOwnerId(req)));
        }
        catch (e) {
            res.status(400).json({ status: 'error', message: e.message });
        }
    }
    async getVehicleHistory(req, res) {
        try {
            res.json(await workshopService.getVehicleHistory(str(req.params['plate']), this.getOwnerId(req)));
        }
        catch (e) {
            res.status(400).json({ status: 'error', message: e.message });
        }
    }
    // ── Mechanics ─────────────────────────────────────────────────────────────
    async getMechanics(req, res) {
        try {
            res.json(await workshopService.getMechanics(this.getOwnerId(req)));
        }
        catch (e) {
            res.status(400).json({ status: 'error', message: e.message });
        }
    }
    async createMechanic(req, res) {
        try {
            res.status(201).json(await workshopService.createMechanic(this.getOwnerId(req), req.body));
        }
        catch (e) {
            res.status(400).json({ status: 'error', message: e.message });
        }
    }
    async updateMechanic(req, res) {
        try {
            res.json(await workshopService.updateMechanic(str(req.params['id']), this.getOwnerId(req), req.body));
        }
        catch (e) {
            res.status(400).json({ status: 'error', message: e.message });
        }
    }
    async deleteMechanic(req, res) {
        try {
            res.json(await workshopService.deleteMechanic(str(req.params['id']), this.getOwnerId(req)));
        }
        catch (e) {
            res.status(400).json({ status: 'error', message: e.message });
        }
    }
    // ── Commission ────────────────────────────────────────────────────────────
    async getMechanicCommissions(req, res) {
        try {
            const monthStr = str(req.query['month']);
            res.json(await workshopService.getMechanicCommissions(this.getOwnerId(req), monthStr ? monthStr : undefined));
        }
        catch (e) {
            res.status(400).json({ status: 'error', message: e.message });
        }
    }
    // ── Attendance ────────────────────────────────────────────────────────────
    async getAttendances(req, res) {
        try {
            const mechanicIdStr = str(req.query['mechanicId']);
            const monthStr = str(req.query['month']);
            res.json(await workshopService.getAttendances(this.getOwnerId(req), mechanicIdStr ? mechanicIdStr : undefined, monthStr ? monthStr : undefined));
        }
        catch (e) {
            res.status(400).json({ status: 'error', message: e.message });
        }
    }
    async clockIn(req, res) {
        try {
            res.json(await workshopService.clockIn(this.getOwnerId(req), str(req.params['mechanicId'])));
        }
        catch (e) {
            res.status(400).json({ status: 'error', message: e.message });
        }
    }
    async clockOut(req, res) {
        try {
            res.json(await workshopService.clockOut(this.getOwnerId(req), str(req.params['mechanicId'])));
        }
        catch (e) {
            res.status(400).json({ status: 'error', message: e.message });
        }
    }
    async createAttendance(req, res) {
        try {
            res.status(201).json(await workshopService.createAttendance(this.getOwnerId(req), req.body));
        }
        catch (e) {
            res.status(400).json({ status: 'error', message: e.message });
        }
    }
    async deleteAttendance(req, res) {
        try {
            res.json(await workshopService.deleteAttendance(str(req.params['id']), this.getOwnerId(req)));
        }
        catch (e) {
            res.status(400).json({ status: 'error', message: e.message });
        }
    }
    // ── Suppliers ─────────────────────────────────────────────────────────────
    async getSuppliers(req, res) {
        try {
            res.json(await workshopService.getSuppliers(this.getOwnerId(req)));
        }
        catch (e) {
            res.status(400).json({ status: 'error', message: e.message });
        }
    }
    async createSupplier(req, res) {
        try {
            res.status(201).json(await workshopService.createSupplier(this.getOwnerId(req), req.body));
        }
        catch (e) {
            res.status(400).json({ status: 'error', message: e.message });
        }
    }
    async updateSupplier(req, res) {
        try {
            res.json(await workshopService.updateSupplier(str(req.params['id']), this.getOwnerId(req), req.body));
        }
        catch (e) {
            res.status(400).json({ status: 'error', message: e.message });
        }
    }
    async deleteSupplier(req, res) {
        try {
            res.json(await workshopService.deleteSupplier(str(req.params['id']), this.getOwnerId(req)));
        }
        catch (e) {
            res.status(400).json({ status: 'error', message: e.message });
        }
    }
}
export const workshopController = new WorkshopController();
//# sourceMappingURL=workshop.controller.js.map