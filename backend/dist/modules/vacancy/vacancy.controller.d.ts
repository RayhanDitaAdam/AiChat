import type { Request, Response } from 'express';
export declare class VacancyController {
    createVacancy(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getOwnerVacancies(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getAllVacancies(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateVacancy(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteVacancy(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    applyToVacancy(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getAllApplicants(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getApplicants(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getUserApplications(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateApplicationStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=vacancy.controller.d.ts.map