// Seed: 3 products × 2 warehouses with starting stock.
// Run with: npm run seed

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Wipe in dependency order so re-seeding works.
  await prisma.reservation.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.warehouse.deleteMany();

  const [wh1, wh2] = await Promise.all([
    prisma.warehouse.create({ data: { name: 'Mumbai DC' } }),
    prisma.warehouse.create({ data: { name: 'Bangalore DC' } }),
  ]);

  const products = await Promise.all([
    prisma.product.create({ data: { name: 'Allo Wellness Kit' } }),
    prisma.product.create({ data: { name: 'Allo Daily Supplement' } }),
    prisma.product.create({ data: { name: 'Allo Sleep Aid' } }),
  ]);

  // Intentionally low stock on one row so the concurrency test is meaningful.
  const stockMatrix = [
    { product: products[0], wh: wh1, units: 5 },
    { product: products[0], wh: wh2, units: 1 }, // ← contended row
    { product: products[1], wh: wh1, units: 20 },
    { product: products[1], wh: wh2, units: 12 },
    { product: products[2], wh: wh1, units: 0 },
    { product: products[2], wh: wh2, units: 8 },
  ];

  for (const s of stockMatrix) {
    await prisma.inventory.create({
      data: {
        productId: s.product.id,
        warehouseId: s.wh.id,
        totalUnits: s.units,
      },
    });
  }

  console.log('Seed complete.');
  console.log(
    'Contended inventory id (use this in testConcurrency.js):',
    (await prisma.inventory.findFirst({
      where: { productId: products[0].id, warehouseId: wh2.id },
    })).id,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
