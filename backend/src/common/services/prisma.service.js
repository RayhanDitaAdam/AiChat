import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

class PrismaService {
    

     constructor() { }

     static getInstance() {
        if (!PrismaService.instance) {
            PrismaService.instance = new PrismaClient();
        }
        return PrismaService.instance;
    }
}

const prisma = PrismaService.getInstance();

export { prisma };
export default prisma;
