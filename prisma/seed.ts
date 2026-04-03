import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
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
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
