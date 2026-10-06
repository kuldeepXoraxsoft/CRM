import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 10);
  const superAdmin = await prisma.user.upsert({
    where: {
      email: "superadmin@cyvora.com",
    },
    update: {
      role: "superAdmin",
      status: "Active",
    },
    create: {
      name: "Super Admin",
      email: "superadmin@cyvora.com",
      password,
      role: "superAdmin",
      status: "Active",
    },
  });

  console.log("\nSeeded successfully:");
  console.log("--------------------------------");
  console.log(`Name:     ${superAdmin.name}`);
  console.log(`Email:    ${superAdmin.email}`);
  console.log(`Role:     ${superAdmin.role}`);
  console.log(`Password: password123`);
  console.log("--------------------------------\n");
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });