const prisma = require('../prisma');

exports.list = async (_req, res) => {
  const warehouses = await prisma.warehouse.findMany({ orderBy: { name: 'asc' } });
  res.json({ warehouses });
};
