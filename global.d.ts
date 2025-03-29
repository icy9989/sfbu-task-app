import { PrismaClient } from '@prisma/client';

// prismadb type is only work with var

declare global {
    namespace globalThis {
        var prismadb: PrismaClient;
    }
}