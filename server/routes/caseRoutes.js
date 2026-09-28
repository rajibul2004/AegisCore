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

router.get('/', getCases);
router.post('/', requireRole('police', 'admin'), validateCase, createCase);

router.get('/:id', getCaseById);
router.patch('/:id', requireRole('police', 'admin'), updateCase);
router.delete('/:id', requireRole('admin'), deleteCase);

module.exports = router;
