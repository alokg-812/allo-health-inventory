const reservationService = require('../services/reservationService');

exports.create = async (req, res) => {
  const { inventoryId, quantity } = req.body || {};

  if (!inventoryId || typeof inventoryId !== 'string') {
    return res.status(400).json({ error: 'inventoryId is required' });
  }
  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty <= 0) {
    return res.status(400).json({ error: 'quantity must be a positive integer' });
  }

  const reservation = await reservationService.reserve({ inventoryId, quantity: qty });
  res.status(201).json({ reservation });
};

exports.confirm = async (req, res) => {
  const reservation = await reservationService.confirm(req.params.id);
  res.json({ reservation });
};

exports.release = async (req, res) => {
  const reservation = await reservationService.release(req.params.id);
  res.json({ reservation });
};
