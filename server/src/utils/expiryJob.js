const cron = require('node-cron');
const prisma = require('../prisma');

async function sweepExpiredReservations() {
  const now = new Date();
  const expired = await prisma.reservation.findMany({
    where: { status: 'PENDING', expiresAt: { lt: now } },
    select: { id: true, inventoryId: true, quantity: true },
  });

  if (expired.length === 0) return 0;

  let released = 0;
  for (const r of expired) {
    try {
      await prisma.$transaction(async (tx) => {
        await tx.$queryRaw`
          SELECT id FROM "Inventory" WHERE id = ${r.inventoryId} FOR UPDATE
        `;
        const fresh = await tx.reservation.findUnique({ where: { id: r.id } });
        if (!fresh || fresh.status !== 'PENDING') return;

        await tx.inventory.update({
          where: { id: r.inventoryId },
          data: { reservedUnits: { decrement: r.quantity } },
        });
        await tx.reservation.update({
          where: { id: r.id },
          data: { status: 'RELEASED' },
        });
      });
      released++;
    } catch (e) {
      console.error('[expiryJob] failed to release', r.id, e);
    }
  }

  if (released > 0) {
    console.log(`[expiryJob] released ${released} expired reservation(s)`);
  }
  return released;
}

function startExpiryJob() {
  cron.schedule('0 * * * * *', () => {
    sweepExpiredReservations().catch((e) => console.error('[expiryJob]', e));
  });
  console.log('[expiryJob] scheduled (every minute)');
}

module.exports = { startExpiryJob, sweepExpiredReservations };
