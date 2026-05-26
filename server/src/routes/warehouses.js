const router = require('express').Router();
const ctrl = require('../controllers/warehousesController');
const asyncHandler = require('../middleware/asyncHandler');

router.get('/', asyncHandler(ctrl.list));

module.exports = router;
