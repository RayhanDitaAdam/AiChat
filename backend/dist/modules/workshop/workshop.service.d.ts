export declare class WorkshopService {
    getWorkOrders(ownerId: string, status?: string): Promise<{
        status: string;
        data: any;
    }>;
    createWorkOrder(ownerId: string, data: {
        vehiclePlate: string;
        vehicleType?: string;
        customerName: string;
        customerPhone?: string;
        complaints: string;
        mechanic?: string;
        mechanicId?: string;
        notes?: string;
    }): Promise<{
        status: string;
        data: any;
    }>;
    updateWorkOrder(id: string, ownerId: string, data: {
        status?: string;
        mechanic?: string;
        mechanicId?: string;
        notes?: string;
        totalCost?: number;
        isPaid?: boolean;
        paymentMethod?: string;
        vehiclePlate?: string;
        vehicleType?: string;
        customerName?: string;
        customerPhone?: string;
        complaints?: string;
    }): Promise<{
        status: string;
        data: any;
    }>;
    deleteWorkOrder(id: string, ownerId: string): Promise<{
        status: string;
        message: string;
    }>;
    addItem(workOrderId: string, ownerId: string, data: {
        type: string;
        name: string;
        quantity: number;
        unitPrice: number;
    }): Promise<{
        status: string;
        data: any;
    }>;
    deleteItem(itemId: string, ownerId: string): Promise<{
        status: string;
        message: string;
    }>;
    getVehicleHistory(plate: string, ownerId: string): Promise<{
        status: string;
        data: any;
    }>;
    getMechanics(ownerId: string): Promise<{
        status: string;
        data: any;
    }>;
    createMechanic(ownerId: string, data: {
        name: string;
        phone?: string;
        specialization?: string;
        commissionRate?: number;
    }): Promise<{
        status: string;
        data: any;
    }>;
    updateMechanic(id: string, ownerId: string, data: {
        name?: string;
        phone?: string;
        specialization?: string;
        commissionRate?: number;
        isActive?: boolean;
    }): Promise<{
        status: string;
        data: any;
    }>;
    deleteMechanic(id: string, ownerId: string): Promise<{
        status: string;
        message: string;
    }>;
    getMechanicCommissions(ownerId: string, month?: string): Promise<{
        status: string;
        data: any;
    }>;
    getAttendances(ownerId: string, mechanicId?: string, month?: string): Promise<{
        status: string;
        data: any;
    }>;
    clockIn(ownerId: string, mechanicId: string): Promise<{
        status: string;
        data: any;
    }>;
    clockOut(ownerId: string, mechanicId: string): Promise<{
        status: string;
        data: any;
    }>;
    createAttendance(ownerId: string, data: {
        mechanicId: string;
        date: string;
        clockIn?: string;
        clockOut?: string;
        totalHours?: number;
        notes?: string;
    }): Promise<{
        status: string;
        data: any;
    }>;
    deleteAttendance(id: string, ownerId: string): Promise<{
        status: string;
        message: string;
    }>;
    getSuppliers(ownerId: string): Promise<{
        status: string;
        data: any;
    }>;
    createSupplier(ownerId: string, data: {
        name: string;
        contact?: string;
        phone?: string;
        address?: string;
        notes?: string;
    }): Promise<{
        status: string;
        data: any;
    }>;
    updateSupplier(id: string, ownerId: string, data: {
        name?: string;
        contact?: string;
        phone?: string;
        address?: string;
        notes?: string;
        isActive?: boolean;
    }): Promise<{
        status: string;
        data: any;
    }>;
    deleteSupplier(id: string, ownerId: string): Promise<{
        status: string;
        message: string;
    }>;
}
export declare const workshopService: WorkshopService;
//# sourceMappingURL=workshop.service.d.ts.map