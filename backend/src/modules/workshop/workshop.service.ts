import { prisma } from '../../common/services/prisma.service.js';

export class WorkshopService {
    // ── Work Orders ──────────────────────────────────────────────────────────
    async getWorkOrders(ownerId: string, status?: string) {
        const where: any = { ownerId };
        if (status && status !== 'ALL') where.status = status;
        const orders = await (prisma as any).workOrder.findMany({
            where,
            include: { items: true, mechanicRef: true },
            orderBy: { createdAt: 'desc' }
        });
        return { status: 'success', data: orders };
    }

    async createWorkOrder(ownerId: string, data: {
        vehiclePlate: string; vehicleType?: string; customerName: string;
        customerPhone?: string; complaints: string; mechanic?: string;
        mechanicId?: string; notes?: string;
    }) {
        const order = await (prisma as any).workOrder.create({
            data: { ownerId, ...data, status: 'QUEUED' },
            include: { items: true, mechanicRef: true }
        });
        return { status: 'success', data: order };
    }

    async updateWorkOrder(id: string, ownerId: string, data: {
        status?: string; mechanic?: string; mechanicId?: string; notes?: string;
        totalCost?: number; isPaid?: boolean; paymentMethod?: string;
        vehiclePlate?: string; vehicleType?: string; customerName?: string;
        customerPhone?: string; complaints?: string;
    }) {
        const order = await (prisma as any).workOrder.findFirst({ where: { id, ownerId } });
        if (!order) throw new Error('Work order not found');
        const updated = await (prisma as any).workOrder.update({
            where: { id }, data,
            include: { items: true, mechanicRef: true }
        });
        return { status: 'success', data: updated };
    }

    async deleteWorkOrder(id: string, ownerId: string) {
        const order = await (prisma as any).workOrder.findFirst({ where: { id, ownerId } });
        if (!order) throw new Error('Work order not found');
        await (prisma as any).workOrder.delete({ where: { id } });
        return { status: 'success', message: 'Work order deleted' };
    }

    async addItem(workOrderId: string, ownerId: string, data: {
        type: string; name: string; quantity: number; unitPrice: number;
    }) {
        const order = await (prisma as any).workOrder.findFirst({ where: { id: workOrderId, ownerId } });
        if (!order) throw new Error('Work order not found');
        const item = await (prisma as any).workOrderItem.create({ data: { workOrderId, ...data } });
        const allItems = await (prisma as any).workOrderItem.findMany({ where: { workOrderId } });
        const totalCost = allItems.reduce((sum: number, i: any) => sum + i.quantity * i.unitPrice, 0);
        await (prisma as any).workOrder.update({ where: { id: workOrderId }, data: { totalCost } });
        return { status: 'success', data: item };
    }

    async deleteItem(itemId: string, ownerId: string) {
        const item = await (prisma as any).workOrderItem.findUnique({
            where: { id: itemId }, include: { workOrder: true }
        });
        if (!item || item.workOrder.ownerId !== ownerId) throw new Error('Item not found');
        await (prisma as any).workOrderItem.delete({ where: { id: itemId } });
        const allItems = await (prisma as any).workOrderItem.findMany({ where: { workOrderId: item.workOrderId } });
        const totalCost = allItems.reduce((sum: number, i: any) => sum + i.quantity * i.unitPrice, 0);
        await (prisma as any).workOrder.update({ where: { id: item.workOrderId }, data: { totalCost } });
        return { status: 'success', message: 'Item deleted' };
    }

    async getVehicleHistory(plate: string, ownerId: string) {
        const orders = await (prisma as any).workOrder.findMany({
            where: { ownerId, vehiclePlate: { equals: plate, mode: 'insensitive' } },
            include: { items: true, mechanicRef: true },
            orderBy: { createdAt: 'desc' }
        });
        return { status: 'success', data: orders };
    }

    // ── Mechanics ─────────────────────────────────────────────────────────────
    async getMechanics(ownerId: string) {
        const mechanics = await (prisma as any).mechanic.findMany({
            where: { ownerId },
            orderBy: { name: 'asc' }
        });
        return { status: 'success', data: mechanics };
    }

    async createMechanic(ownerId: string, data: {
        name: string; phone?: string; specialization?: string; commissionRate?: number;
    }) {
        const mechanic = await (prisma as any).mechanic.create({ data: { ownerId, ...data } });
        return { status: 'success', data: mechanic };
    }

    async updateMechanic(id: string, ownerId: string, data: {
        name?: string; phone?: string; specialization?: string;
        commissionRate?: number; isActive?: boolean;
    }) {
        const existing = await (prisma as any).mechanic.findFirst({ where: { id, ownerId } });
        if (!existing) throw new Error('Mechanic not found');
        const mechanic = await (prisma as any).mechanic.update({ where: { id }, data });
        return { status: 'success', data: mechanic };
    }

    async deleteMechanic(id: string, ownerId: string) {
        const existing = await (prisma as any).mechanic.findFirst({ where: { id, ownerId } });
        if (!existing) throw new Error('Mechanic not found');
        await (prisma as any).mechanic.delete({ where: { id } });
        return { status: 'success', message: 'Mechanic deleted' };
    }

    // ── Commission ────────────────────────────────────────────────────────────
    async getMechanicCommissions(ownerId: string, month?: string) {
        // Build date range: default to current month
        const now = month ? new Date(month + '-01') : new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        const mechanics = await (prisma as any).mechanic.findMany({
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

        const result = mechanics.map((m: any) => {
            const jobCount = m.workOrders.length;
            const totalRevenue = m.workOrders.reduce((s: number, o: any) => s + (o.totalCost || 0), 0);
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
    async getAttendances(ownerId: string, mechanicId?: string, month?: string) {
        const where: any = { ownerId };
        if (mechanicId) where.mechanicId = mechanicId;
        if (month) {
            const start = new Date(month + '-01');
            const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
            where.date = { gte: start, lte: end };
        }
        const records = await (prisma as any).mechanicAttendance.findMany({
            where,
            include: { mechanic: { select: { id: true, name: true } } },
            orderBy: { date: 'desc' }
        });
        return { status: 'success', data: records };
    }

    async clockIn(ownerId: string, mechanicId: string) {
        const mechanic = await (prisma as any).mechanic.findFirst({ where: { id: mechanicId, ownerId } });
        if (!mechanic) throw new Error('Mechanic not found');

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existing = await (prisma as any).mechanicAttendance.findFirst({
            where: { mechanicId, ownerId, date: today }
        });
        if (existing) {
            if (existing.clockIn) throw new Error('Already clocked in today');
            const updated = await (prisma as any).mechanicAttendance.update({
                where: { id: existing.id }, data: { clockIn: new Date() }
            });
            return { status: 'success', data: updated };
        }

        const record = await (prisma as any).mechanicAttendance.create({
            data: { mechanicId, ownerId, date: today, clockIn: new Date() }
        });
        return { status: 'success', data: record };
    }

    async clockOut(ownerId: string, mechanicId: string) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const record = await (prisma as any).mechanicAttendance.findFirst({
            where: { mechanicId, ownerId, date: today }
        });
        if (!record || !record.clockIn) throw new Error('Not clocked in today');
        if (record.clockOut) throw new Error('Already clocked out today');

        const clockOut = new Date();
        const totalHours = (clockOut.getTime() - record.clockIn.getTime()) / 3600000;

        const updated = await (prisma as any).mechanicAttendance.update({
            where: { id: record.id },
            data: { clockOut, totalHours: parseFloat(totalHours.toFixed(2)) }
        });
        return { status: 'success', data: updated };
    }

    async createAttendance(ownerId: string, data: {
        mechanicId: string; date: string; clockIn?: string;
        clockOut?: string; totalHours?: number; notes?: string;
    }) {
        const mechanic = await (prisma as any).mechanic.findFirst({ where: { id: data.mechanicId, ownerId } });
        if (!mechanic) throw new Error('Mechanic not found');

        const dateObj = new Date(data.date);
        dateObj.setHours(0, 0, 0, 0);

        let totalHours = data.totalHours;
        if (data.clockIn && data.clockOut && !totalHours) {
            const ci = new Date(data.clockIn);
            const co = new Date(data.clockOut);
            totalHours = parseFloat(((co.getTime() - ci.getTime()) / 3600000).toFixed(2));
        }

        const record = await (prisma as any).mechanicAttendance.create({
            data: {
                mechanicId: data.mechanicId, ownerId, date: dateObj,
                clockIn: data.clockIn ? new Date(data.clockIn) : null,
                clockOut: data.clockOut ? new Date(data.clockOut) : null,
                totalHours: totalHours || null, notes: data.notes
            }
        });
        return { status: 'success', data: record };
    }

    async deleteAttendance(id: string, ownerId: string) {
        const record = await (prisma as any).mechanicAttendance.findFirst({ where: { id, ownerId } });
        if (!record) throw new Error('Attendance record not found');
        await (prisma as any).mechanicAttendance.delete({ where: { id } });
        return { status: 'success', message: 'Attendance deleted' };
    }

    // ── Suppliers ─────────────────────────────────────────────────────────────
    async getSuppliers(ownerId: string) {
        const suppliers = await (prisma as any).supplier.findMany({
            where: { ownerId },
            orderBy: { name: 'asc' }
        });
        return { status: 'success', data: suppliers };
    }

    async createSupplier(ownerId: string, data: {
        name: string; contact?: string; phone?: string; address?: string; notes?: string;
    }) {
        const supplier = await (prisma as any).supplier.create({ data: { ownerId, ...data } });
        return { status: 'success', data: supplier };
    }

    async updateSupplier(id: string, ownerId: string, data: {
        name?: string; contact?: string; phone?: string;
        address?: string; notes?: string; isActive?: boolean;
    }) {
        const existing = await (prisma as any).supplier.findFirst({ where: { id, ownerId } });
        if (!existing) throw new Error('Supplier not found');
        const supplier = await (prisma as any).supplier.update({ where: { id }, data });
        return { status: 'success', data: supplier };
    }

    async deleteSupplier(id: string, ownerId: string) {
        const existing = await (prisma as any).supplier.findFirst({ where: { id, ownerId } });
        if (!existing) throw new Error('Supplier not found');
        await (prisma as any).supplier.delete({ where: { id } });
        return { status: 'success', message: 'Supplier deleted' };
    }
}

export const workshopService = new WorkshopService();
