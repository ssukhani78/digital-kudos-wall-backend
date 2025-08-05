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
  await prisma.user.upsert({
    where: { email: "teamlead@test.com" },
    update: {},
    create: {
      name: "Team Lead",
      email: "teamlead@test.com",
      password: "teamlead@123",
      role: {
        connect: {
          role: "TEAMLEAD",
        },
      },
    },
  });
  await prisma.user.upsert({
    where: { email: "member@test.com" },
    update: {},
    create: {
      name: "Member",
      email: "member@test.com",
      password: "member@123",
      role: {
        connect: {
          role: "MEMBER",
        },
      },
    },
  });

  // Seed categories
  const categories = [
    "Teamwork",
    "Innovation",
    "Leadership",
    "Ownership",
    "Customer Focus",
    "Going Above & Beyond",
    "Reliability",
    "Learning & Growth",
    "Communication",
    "Positive Attitude",
  ];

  for (const categoryName of categories) {
    await prisma.category.upsert({
      where: { name: categoryName },
      update: {},
      create: { name: categoryName },
    });
  }

  console.log("Seeded roles: TEAMLEAD, MEMBER");
  console.log("Seeded categories:", categories.join(", "));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
