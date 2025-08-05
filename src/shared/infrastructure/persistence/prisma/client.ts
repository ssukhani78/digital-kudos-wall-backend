import { PrismaClient } from "@prisma/client";

export { PrismaClient };

const prisma = new PrismaClient();

export default prisma;
