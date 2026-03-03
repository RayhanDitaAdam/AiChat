import { type Request, type Response } from 'express';
declare class WorkshopController {
    private getOwnerId;
    getWorkOrders(req: Request, res: Response): Promise<void>;
    createWorkOrder(req: Request, res: Response): Promise<void>;
    updateWorkOrder(req: Request, res: Response): Promise<void>;
    deleteWorkOrder(req: Request, res: Response): Promise<void>;
    addItem(req: Request, res: Response): Promise<void>;
    deleteItem(req: Request, res: Response): Promise<void>;
    getVehicleHistory(req: Request, res: Response): Promise<void>;
    getMechanics(req: Request, res: Response): Promise<void>;
    createMechanic(req: Request, res: Response): Promise<void>;
    updateMechanic(req: Request, res: Response): Promise<void>;
    deleteMechanic(req: Request, res: Response): Promise<void>;
    getMechanicCommissions(req: Request, res: Response): Promise<void>;
    getAttendances(req: Request, res: Response): Promise<void>;
    clockIn(req: Request, res: Response): Promise<void>;
    clockOut(req: Request, res: Response): Promise<void>;
    createAttendance(req: Request, res: Response): Promise<void>;
    deleteAttendance(req: Request, res: Response): Promise<void>;
    getSuppliers(req: Request, res: Response): Promise<void>;
    createSupplier(req: Request, res: Response): Promise<void>;
    updateSupplier(req: Request, res: Response): Promise<void>;
    deleteSupplier(req: Request, res: Response): Promise<void>;
}
export declare const workshopController: WorkshopController;
export {};
//# sourceMappingURL=workshop.controller.d.ts.map