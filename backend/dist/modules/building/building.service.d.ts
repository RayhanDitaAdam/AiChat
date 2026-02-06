export declare class BuildingService {
    createSubLocation(ownerId: string, data: any): Promise<{
        status: string;
        message: string;
        subLocation: any;
    }>;
    getSubLocations(ownerId: string): Promise<{
        status: string;
        subLocations: any;
    }>;
    updateSubLocation(id: string, ownerId: string, data: any): Promise<{
        status: string;
        message: string;
        subLocation: any;
    }>;
    deleteSubLocation(id: string, ownerId: string): Promise<{
        status: string;
        message: string;
    }>;
}
//# sourceMappingURL=building.service.d.ts.map