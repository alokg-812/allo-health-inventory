const router = require('express').Router();
const ctrl = require('../controllers/reservationsController');
const asyncHandler = require('../middleware/asyncHandler');

router.post('/', asyncHandler(ctrl.create));
router.post('/:id/confirm', asyncHandler(ctrl.confirm));
router.post('/:id/release', asyncHandler(ctrl.release));

module.exports = router;
