const express = require('express');
const {
  createCase,
  getCases,
  getCaseById,
  updateCase,
  deleteCase,
} = require('../controllers/caseController');
const { protect } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');
const { validateCase } = require('../middlewares/validateRequest');

const router = express.Router();

router.use(protect);

// GET /api/cases - Get all cases (filtered by role)
// POST /api/cases - Create a new Case (Police/Admin only)
router
  .route('/')
  .get(getCases)
  .post(requireRole('police', 'admin'), validateCase, createCase);

// GET /api/cases/:id - Get a specific case
// PATCH /api/cases/:id - Update case (Police/Admin only)
// DELETE /api/cases/:id - Delete a case (Admin only)
router
  .route('/:id')
  .get(getCaseById)
  .patch(requireRole('police', 'admin'), updateCase)
  .delete(requireRole('admin'), deleteCase);

module.exports = router;
