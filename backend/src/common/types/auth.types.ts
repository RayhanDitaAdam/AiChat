import { Role } from '@prisma/client';

export { Role };

export interface AuthUser {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    role: Role;
    ownerId: string | null;
}

export interface JWTPayload {
    userId: string;
    email: string;
    role: Role;
}

declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
        }
    }
}
