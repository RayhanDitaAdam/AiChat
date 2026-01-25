import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

class PrismaService {
    private static instance: PrismaClient;

    private constructor() { }

    public static getInstance(): PrismaClient {
        if (!PrismaService.instance) {
            PrismaService.instance = new PrismaClient();
        }
        return PrismaService.instance;
    }
}

const prisma = PrismaService.getInstance();

export { prisma };
export default prisma;
