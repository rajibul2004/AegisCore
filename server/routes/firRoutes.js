const express = require('express');
const {
  createFIR,
  getFIRs,
  getFIRById,
  updateFIRStatus,
  deleteFIR,
} = require('../controllers/firController');
const { protect } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');
const { validateFIR } = require('../middlewares/validateRequest');

const router = express.Router();

// All FIR routes require authentication
router.use(protect);

// GET /api/firs - Get all FIRs (filtered by role)
// POST /api/firs - Create a new FIR (any authenticated user)
router
  .route('/')
  .get(getFIRs)
  .post(validateFIR, createFIR);

// GET /api/firs/:id - Get a specific FIR (public only sees their own)
// PATCH /api/firs/:id - Update FIR status (Police and Admin only)
// DELETE /api/firs/:id - Delete an FIR (Admin only)
router
  .route('/:id')
  .get(getFIRById)
  .patch(requireRole('police', 'admin'), updateFIRStatus)
  .delete(requireRole('admin'), deleteFIR);

module.exports = router;
