import { prisma } from '../../common/services/prisma.service.js';

export class WorkshopService {
    // ── Work Orders ──────────────────────────────────────────────────────────
    async getWorkOrders(ownerId, status) {
        const where = { ownerId };
        if (status && status !== 'ALL') where.status = status;
        const orders = await (prisma ).workOrder.findMany({
            where,
            include: { items: true, mechanicRef: true },
            orderBy: { createdAt: 'desc' }
        });
        return { status: 'success', data: orders };
    }

    async createWorkOrder(ownerId, data



) {
        const order = await (prisma ).workOrder.create({
            data: { ownerId, ...data, status: 'QUEUED' },
            include: { items: true, mechanicRef: true }
        });
        return { status: 'success', data: order };
    }

    async updateWorkOrder(id, ownerId, data




) {
        const order = await (prisma ).workOrder.findFirst({ where: { id, ownerId } });
        if (!order) throw new Error('Work order not found');
        const updated = await (prisma ).workOrder.update({
            where: { id }, data,
            include: { items: true, mechanicRef: true }
        });
        return { status: 'success', data: updated };
    }

    async deleteWorkOrder(id, ownerId) {
        const order = await (prisma ).workOrder.findFirst({ where: { id, ownerId } });
        if (!order) throw new Error('Work order not found');
        await (prisma ).workOrder.delete({ where: { id } });
        return { status: 'success', message: 'Work order deleted' };
    }

    async addItem(workOrderId, ownerId, data

) {
        const order = await (prisma ).workOrder.findFirst({ where: { id: workOrderId, ownerId } });
        if (!order) throw new Error('Work order not found');
        const item = await (prisma ).workOrderItem.create({ data: { workOrderId, ...data } });
        const allItems = await (prisma ).workOrderItem.findMany({ where: { workOrderId } });
        const totalCost = allItems.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
        await (prisma ).workOrder.update({ where: { id: workOrderId }, data: { totalCost } });
        return { status: 'success', data: item };
    }

    async deleteItem(itemId, ownerId) {
        const item = await (prisma ).workOrderItem.findUnique({
            where: { id: itemId }, include: { workOrder: true }
        });
        if (!item || item.workOrder.ownerId !== ownerId) throw new Error('Item not found');
        await (prisma ).workOrderItem.delete({ where: { id: itemId } });
        const allItems = await (prisma ).workOrderItem.findMany({ where: { workOrderId: item.workOrderId } });
        const totalCost = allItems.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
        await (prisma ).workOrder.update({ where: { id: item.workOrderId }, data: { totalCost } });
        return { status: 'success', message: 'Item deleted' };
    }

    async getVehicleHistory(plate, ownerId) {
        const orders = await (prisma ).workOrder.findMany({
            where: { ownerId, vehiclePlate: { equals: plate, mode: 'insensitive' } },
            include: { items: true, mechanicRef: true },
            orderBy: { createdAt: 'desc' }
        });
        return { status: 'success', data: orders };
    }

    // ── Mechanics ─────────────────────────────────────────────────────────────
    async getMechanics(ownerId) {
        const mechanics = await (prisma ).mechanic.findMany({
            where: { ownerId },
            orderBy: { name: 'asc' }
        });
        return { status: 'success', data: mechanics };
    }

    async createMechanic(ownerId, data

) {
        const mechanic = await (prisma ).mechanic.create({ data: { ownerId, ...data } });
        return { status: 'success', data: mechanic };
    }

    async updateMechanic(id, ownerId, data


) {
        const existing = await (prisma ).mechanic.findFirst({ where: { id, ownerId } });
        if (!existing) throw new Error('Mechanic not found');
        const mechanic = await (prisma ).mechanic.update({ where: { id }, data });
        return { status: 'success', data: mechanic };
    }

    async deleteMechanic(id, ownerId) {
        const existing = await (prisma ).mechanic.findFirst({ where: { id, ownerId } });
        if (!existing) throw new Error('Mechanic not found');
        await (prisma ).mechanic.delete({ where: { id } });
        return { status: 'success', message: 'Mechanic deleted' };
    }

    // ── Commission ────────────────────────────────────────────────────────────
    async getMechanicCommissions(ownerId, month) {
        // Build date range: default to current month
        const now = month ? new Date(month + '-01') : new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        const mechanics = await (prisma ).mechanic.findMany({
            where: { ownerId },
            include: {
                workOrders: {
                    where: {
                        status: 'DONE',
                        isPaid: true,
                        updatedAt: { gte: start, lte: end }
                    }
                }
            }
        });

        const result = mechanics.map((m) => {
            const jobCount = m.workOrders.length;
            const totalRevenue = m.workOrders.reduce((s, o) => s + (o.totalCost || 0), 0);
            const commission = totalRevenue * (m.commissionRate / 100);
            return {
                id: m.id,
                name: m.name,
                phone: m.phone,
                specialization: m.specialization,
                commissionRate: m.commissionRate,
                jobCount,
                totalRevenue,
                commission: Math.round(commission)
            };
        });

        return { status: 'success', data: result };
    }

    // ── Attendance ────────────────────────────────────────────────────────────
    async getAttendances(ownerId, mechanicId, month) {
        const where = { ownerId };
        if (mechanicId) where.mechanicId = mechanicId;
        if (month) {
            const start = new Date(month + '-01');
            const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
            where.date = { gte: start, lte: end };
        }
        const records = await (prisma ).mechanicAttendance.findMany({
            where,
            include: { mechanic: { select: { id: true, name: true } } },
            orderBy: { date: 'desc' }
        });
        return { status: 'success', data: records };
    }

    async clockIn(ownerId, mechanicId) {
        const mechanic = await (prisma ).mechanic.findFirst({ where: { id: mechanicId, ownerId } });
        if (!mechanic) throw new Error('Mechanic not found');

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existing = await (prisma ).mechanicAttendance.findFirst({
            where: { mechanicId, ownerId, date: today }
        });
        if (existing) {
            if (existing.clockIn) throw new Error('Already clocked in today');
            const updated = await (prisma ).mechanicAttendance.update({
                where: { id: existing.id }, data: { clockIn: new Date() }
            });
            return { status: 'success', data: updated };
        }

        const record = await (prisma ).mechanicAttendance.create({
            data: { mechanicId, ownerId, date: today, clockIn: new Date() }
        });
        return { status: 'success', data: record };
    }

    async clockOut(ownerId, mechanicId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const record = await (prisma ).mechanicAttendance.findFirst({
            where: { mechanicId, ownerId, date: today }
        });
        if (!record || !record.clockIn) throw new Error('Not clocked in today');
        if (record.clockOut) throw new Error('Already clocked out today');

        const clockOut = new Date();
        const totalHours = (clockOut.getTime() - record.clockIn.getTime()) / 3600000;

        const updated = await (prisma ).mechanicAttendance.update({
            where: { id: record.id },
            data: { clockOut, totalHours: parseFloat(totalHours.toFixed(2)) }
        });
        return { status: 'success', data: updated };
    }

    async createAttendance(ownerId, data


) {
        const mechanic = await (prisma ).mechanic.findFirst({ where: { id: data.mechanicId, ownerId } });
        if (!mechanic) throw new Error('Mechanic not found');

        const dateObj = new Date(data.date);
        dateObj.setHours(0, 0, 0, 0);

        let totalHours = data.totalHours;
        if (data.clockIn && data.clockOut && !totalHours) {
            const ci = new Date(data.clockIn);
            const co = new Date(data.clockOut);
            totalHours = parseFloat(((co.getTime() - ci.getTime()) / 3600000).toFixed(2));
        }

        const record = await (prisma ).mechanicAttendance.create({
            data: {
                mechanicId: data.mechanicId, ownerId, date: dateObj,
                clockIn: data.clockIn ? new Date(data.clockIn) : null,
                clockOut: data.clockOut ? new Date(data.clockOut) : null,
                totalHours: totalHours || null, notes: data.notes
            }
        });
        return { status: 'success', data: record };
    }

    async deleteAttendance(id, ownerId) {
        const record = await (prisma ).mechanicAttendance.findFirst({ where: { id, ownerId } });
        if (!record) throw new Error('Attendance record not found');
        await (prisma ).mechanicAttendance.delete({ where: { id } });
        return { status: 'success', message: 'Attendance deleted' };
    }

    // ── Suppliers ─────────────────────────────────────────────────────────────
    async getSuppliers(ownerId) {
        const suppliers = await (prisma ).supplier.findMany({
            where: { ownerId },
            orderBy: { name: 'asc' }
        });
        return { status: 'success', data: suppliers };
    }

    async createSupplier(ownerId, data

) {
        const supplier = await (prisma ).supplier.create({ data: { ownerId, ...data } });
        return { status: 'success', data: supplier };
    }

    async updateSupplier(id, ownerId, data


) {
        const existing = await (prisma ).supplier.findFirst({ where: { id, ownerId } });
        if (!existing) throw new Error('Supplier not found');
        const supplier = await (prisma ).supplier.update({ where: { id }, data });
        return { status: 'success', data: supplier };
    }

    async deleteSupplier(id, ownerId) {
        const existing = await (prisma ).supplier.findFirst({ where: { id, ownerId } });
        if (!existing) throw new Error('Supplier not found');
        await (prisma ).supplier.delete({ where: { id } });
        return { status: 'success', message: 'Supplier deleted' };
    }
}

export const workshopService = new WorkshopService();
