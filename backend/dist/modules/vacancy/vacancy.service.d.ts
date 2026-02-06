import type { CreateVacancyInput, UpdateVacancyInput } from './vacancy.schema.js';
export declare class VacancyService {
    createVacancy(ownerId: string, data: CreateVacancyInput): Promise<{
        status: string;
        message: string;
        vacancy: any;
    }>;
    getVacancies(ownerId: string): Promise<{
        status: string;
        vacancies: any;
    }>;
    getAllPublicVacancies(): Promise<{
        status: string;
        vacancies: any;
    }>;
    updateVacancy(id: string, ownerId: string, data: UpdateVacancyInput): Promise<{
        status: string;
        message: string;
        vacancy: any;
    }>;
    deleteVacancy(id: string, ownerId: string): Promise<{
        status: string;
        message: string;
    }>;
}
//# sourceMappingURL=vacancy.service.d.ts.map