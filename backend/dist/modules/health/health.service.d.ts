export declare const processMedicalRecord: (memberId: string, filePath: string) => Promise<{
    id: string;
    createdAt: Date;
    type: string;
    memberId: string;
    content: string;
    imageUrl: string | null;
    aiResponse: string | null;
}>;
export declare const saveMedicalRecord: (memberId: string, content: string) => Promise<{
    id: string;
    createdAt: Date;
    type: string;
    memberId: string;
    content: string;
    imageUrl: string | null;
    aiResponse: string | null;
}>;
export declare const analyzeFood: (memberId: string, filePath: string | undefined, text: string) => Promise<{
    id: string;
    createdAt: Date;
    type: string;
    memberId: string;
    content: string;
    imageUrl: string | null;
    aiResponse: string | null;
}>;
export declare const getHealthHistory: (memberId: string) => Promise<{
    id: string;
    createdAt: Date;
    type: string;
    memberId: string;
    content: string;
    imageUrl: string | null;
    aiResponse: string | null;
}[]>;
//# sourceMappingURL=health.service.d.ts.map