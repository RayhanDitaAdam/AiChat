export declare class SopService {
    createSop(ownerId: string, title: string, fileUrl: string, fileType: string, content?: string | null): Promise<any>;
    getSopsByOwner(ownerId: string): Promise<any>;
    getSopById(id: string, ownerId: string): Promise<any>;
    deleteSop(id: string, ownerId: string): Promise<any>;
    updateSopText(id: string, ownerId: string, content: string): Promise<any>;
}
//# sourceMappingURL=sop.service.d.ts.map