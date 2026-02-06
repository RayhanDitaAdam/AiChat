import { z } from 'zod';
export declare const GoogleTokenSchema: z.ZodObject<{
    body: z.ZodObject<{
        token: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export type GoogleTokenInput = z.infer<typeof GoogleTokenSchema>['body'];
export declare const RegisterSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
        name: z.ZodString;
        role: z.ZodOptional<z.ZodEnum<{
            USER: "USER";
            OWNER: "OWNER";
        }>>;
        domain: z.ZodOptional<z.ZodString>;
        storeName: z.ZodOptional<z.ZodString>;
        ownerDomain: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type RegisterInput = z.infer<typeof RegisterSchema>['body'];
export declare const LoginSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export type LoginInput = z.infer<typeof LoginSchema>['body'];
export declare const UpdateProfileSchema: z.ZodObject<{
    body: z.ZodObject<{
        language: z.ZodOptional<z.ZodEnum<{
            id: "id";
            en: "en";
        }>>;
        name: z.ZodOptional<z.ZodString>;
        image: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        avatarVariant: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodString>;
        currentPassword: z.ZodOptional<z.ZodString>;
        password: z.ZodOptional<z.ZodString>;
        domain: z.ZodOptional<z.ZodString>;
        storeName: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodString>;
        latitude: z.ZodOptional<z.ZodNumber>;
        longitude: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>['body'];
//# sourceMappingURL=auth.schema.d.ts.map