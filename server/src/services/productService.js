const prisma = require('../prisma');

exports.listWithStock = async () => {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'asc' },
    include: {
      inventory: {
        include: { warehouse: true },
      },
    },
  });

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    createdAt: p.createdAt,
    inventory: p.inventory.map((inv) => ({
      id: inv.id,
      warehouse: { id: inv.warehouse.id, name: inv.warehouse.name },
      totalUnits: inv.totalUnits,
      reservedUnits: inv.reservedUnits,
      available: inv.totalUnits - inv.reservedUnits,
    })),
  }));
};
