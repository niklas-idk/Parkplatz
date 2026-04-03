import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Parkplätze erstellen
  for (let i = 1; i <= 8; i++) {
    await prisma.parkingSpot.upsert({
      where: { label: `P${i}` },
      update: {},
      create: {
        label: `P${i}`,
        description: `Tiefgaragen-Stellplatz ${i}`,
      },
    });
  }
  console.log("8 Parkplätze erstellt (P1-P8)");

  // Admin-User erstellen
  const adminEmail = "admin@parkplatz.de";
  const adminPassword = "admin123!";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN", passwordHash },
    create: {
      email: adminEmail,
      passwordHash,
      name: "Administrator",
      role: "ADMIN",
    },
  });
  console.log(`Admin-User erstellt: ${adminEmail}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
