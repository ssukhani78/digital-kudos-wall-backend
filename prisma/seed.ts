import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.role.upsert({
    where: { role: "TEAMLEAD" },
    update: {},
    create: { role: "TEAMLEAD" },
  });
  await prisma.role.upsert({
    where: { role: "MEMBER" },
    update: {},
    create: { role: "MEMBER" },
  });
  console.log("Seeded roles: TEAMLEAD, MEMBER");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
