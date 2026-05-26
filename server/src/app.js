const express = require('express');
const cors = require('cors');

const productsRouter = require('./routes/products');
const warehousesRouter = require('./routes/warehouses');
const reservationsRouter = require('./routes/reservations');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/products', productsRouter);
app.use('/api/warehouses', warehousesRouter);
app.use('/api/reservations', reservationsRouter);

app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));
app.use(errorHandler);

module.exports = app;
