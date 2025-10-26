import { PrismaClient } from "@prisma/client";
import provincesData from "../prisma/resources/1_provinces.json";
import districtsData from "../prisma/resources/2_districts.json";

const prisma = new PrismaClient();

async function seed() {
  // 1. Create Rwanda country (id: 1)
  const country = await prisma.country.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: "Rwanda" },
  });

  // 2. Seed provinces
  const provinces =
    (provincesData as any[]).find((t) => t.type === "table")?.data || [];
  for (const prov of provinces) {
    await prisma.province.upsert({
      where: { id: Number(prov.prv_id) },
      update: {},
      create: {
        id: Number(prov.prv_id),
        name: prov.prv_name.trim(),
        countryId: country.id,
      },
    });
  }

  // 3. Seed districts
  const districts =
    (districtsData as any[]).find((t) => t.type === "table")?.data || [];
  for (const dist of districts) {
    await prisma.district.upsert({
      where: { id: Number(dist.dst_id) },
      update: {},
      create: {
        id: Number(dist.dst_id),
        name: dist.dst_name.trim(),
        provinceId: Number(dist.dst_province),
      },
    });
  }

  console.log("Seeding completed!");
  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
