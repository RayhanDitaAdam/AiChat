import type { CreateContributorRequestDto, UpdateContributorRequestStatusDto } from "./contributor.schema.js";
export declare const createContributorRequest: (userId: string, dto: CreateContributorRequestDto) => Promise<{
    id: string;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
    status: string;
    userId: string;
}>;
export declare const getContributorRequests: (ownerId: string) => Promise<({
    user: {
        name: string | null;
        id: string;
        email: string;
        image: string | null;
    };
} & {
    id: string;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
    status: string;
    userId: string;
})[]>;
export declare const updateContributorRequestStatus: (ownerId: string, requestId: string, dto: UpdateContributorRequestStatusDto) => Promise<{
    id: string;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
    status: string;
    userId: string;
}>;
export declare const getContributors: (ownerId: string) => Promise<{
    name: string | null;
    id: string;
    email: string;
    image: string | null;
    createdAt: Date;
}[]>;
//# sourceMappingURL=contributor.service.d.ts.map