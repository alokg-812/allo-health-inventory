const productService = require('../services/productService');

exports.list = async (_req, res) => {
  const products = await productService.listWithStock();
  res.json({ products });
};
