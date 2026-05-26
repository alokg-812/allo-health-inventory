const prisma = require('../prisma');

const TTL_MINUTES = Number(process.env.RESERVATION_TTL_MINUTES) || 10;
function httpError(status, code, message) {
  const err = new Error(message);
  err.status = status;
  err.code = code;
  err.publicMessage = message;
  return err;
}
exports.reserve = async ({ inventoryId, quantity }) => {
  const expiresAt = new Date(Date.now() + TTL_MINUTES * 60 * 1000);

  try {
    return await prisma.$transaction(
      async (tx) => {
      const rows = await tx.$queryRaw`
        SELECT id, "totalUnits", "reservedUnits"
        FROM "Inventory"
        WHERE id = ${inventoryId}
        FOR UPDATE
      `;

      if (rows.length === 0) {
        throw httpError(404, 'INVENTORY_NOT_FOUND', 'Inventory not found');
      }

      const inv = rows[0];
      const available = inv.totalUnits - inv.reservedUnits;
      if (available < quantity) {
        throw httpError(
          409,
          'INSUFFICIENT_STOCK',
          'Sorry, item just went out of stock.',
        );
      }
      await tx.inventory.update({
        where: { id: inventoryId },
        data: { reservedUnits: { increment: quantity } },
      });

      const reservation = await tx.reservation.create({
        data: {
          inventoryId,
          quantity,
          status: 'PENDING',
          expiresAt,
        },
      });
          return reservation;
      },
      {
        timeout: 15000,
        maxWait: 15000,
      }
    );
  } catch (e) {
    if (e.status) throw e;
    throw e;
  }
};

exports.confirm = async (reservationId) => {
  return prisma.$transaction(async (tx) => {
    const reservation = await tx.reservation.findUnique({
      where: { id: reservationId },
    });
    if (!reservation) {
      throw httpError(404, 'RESERVATION_NOT_FOUND', 'Reservation not found');
    }
    if (reservation.status !== 'PENDING') {
      throw httpError(
        409,
        'RESERVATION_NOT_PENDING',
        `Reservation is ${reservation.status.toLowerCase()}`,
      );
    }
    if (reservation.expiresAt.getTime() <= Date.now()) {
      throw httpError(410, 'RESERVATION_EXPIRED', 'Reservation expired.');
    }
    await tx.$queryRaw`
      SELECT id FROM "Inventory" WHERE id = ${reservation.inventoryId} FOR UPDATE
    `;

    await tx.inventory.update({
      where: { id: reservation.inventoryId },
      data: {
        reservedUnits: { decrement: reservation.quantity },
        totalUnits: { decrement: reservation.quantity },
      },
    });

    return tx.reservation.update({
      where: { id: reservation.id },
      data: { status: 'CONFIRMED' },
    });
  });
};

exports.release = async (reservationId) => {
  return prisma.$transaction(async (tx) => {
    const reservation = await tx.reservation.findUnique({
      where: { id: reservationId },
    });
    if (!reservation) {
      throw httpError(404, 'RESERVATION_NOT_FOUND', 'Reservation not found');
    }
    if (reservation.status !== 'PENDING') {
      return reservation; // idempotent no-op
    }

    await tx.$queryRaw`
      SELECT id FROM "Inventory" WHERE id = ${reservation.inventoryId} FOR UPDATE
    `;

    await tx.inventory.update({
      where: { id: reservation.inventoryId },
      data: { reservedUnits: { decrement: reservation.quantity } },
    });

    return tx.reservation.update({
      where: { id: reservation.id },
      data: { status: 'RELEASED' },
    });
  });
};
