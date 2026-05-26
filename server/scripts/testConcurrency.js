require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const API = `http://localhost:${process.env.PORT || 4000}`;
const N = 20;

async function main() {
  const product = await prisma.product.findFirst({
    where: { name: 'Allo Wellness Kit' },
  });
  const wh = await prisma.warehouse.findFirst({ where: { name: 'Bangalore DC' } });
  if (!product || !wh) throw new Error('Run `npm run seed` first.');

  const inv = await prisma.inventory.findFirst({
    where: { productId: product.id, warehouseId: wh.id },
  });
  if (!inv) throw new Error('Contended inventory row not found.');

  await prisma.reservation.deleteMany({ where: { inventoryId: inv.id } });
  await prisma.inventory.update({
    where: { id: inv.id },
    data: { totalUnits: 1, reservedUnits: 0 },
  });

  console.log(`Firing ${N} concurrent reservations against inventory ${inv.id}…`);

  const requests = Array.from({ length: N }, () =>
    fetch(`${API}/api/reservations`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ inventoryId: inv.id, quantity: 1 }),
    }).then(async (r) => ({ status: r.status, body: await r.json().catch(() => null) })),
  );

  const results = await Promise.all(requests);
  const tally = results.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  console.log('Response tally:', tally);

  const ok = tally[201] === 1 && tally[409] === N - 1;
  if (ok) {
    console.log('✅ PASS — exactly one reservation succeeded, all others 409.');
    process.exit(0);
  } else {
    console.error('❌ FAIL — race condition or wrong response distribution.');
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
