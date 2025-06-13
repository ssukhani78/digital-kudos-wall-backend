import { PrismaClient } from "@prisma/client";

// By creating a single instance and exporting it, we ensure that all parts
// of the application share the same connection pool, which is a best practice.
export const prisma = new PrismaClient();
