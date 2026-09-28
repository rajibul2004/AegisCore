const express = require('express');
const {
  createFIR,
  getFIRs,
  getFIRLocations,
  getFIRById,
  updateFIRStatus,
  deleteFIR,
} = require('../controllers/firController');
const { protect } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');
const { validateFIR } = require('../middlewares/validateRequest');

const router = express.Router();

router.use(protect);

router.get('/', getFIRs);
router.post('/', validateFIR, createFIR);

router.get('/locations', getFIRLocations);

router.get('/:id', getFIRById);
router.patch('/:id', requireRole('police', 'admin'), updateFIRStatus);
router.delete('/:id', requireRole('admin'), deleteFIR);

module.exports = router;
