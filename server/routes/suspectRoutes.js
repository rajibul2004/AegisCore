const express = require('express');
const {
  createSuspect,
  getSuspects,
  getSuspectById,
  updateSuspect,
  linkSuspectToCase
} = require('../controllers/suspectController');
const { protect } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');
const { validateSuspect } = require('../middlewares/validateRequest');

const router = express.Router();

// ALL suspect routes are strictly for Police and Admin only
router.use(protect);
router.use(requireRole('police', 'admin'));

// GET /api/suspects
// POST /api/suspects
router
  .route('/')
  .get(getSuspects)
  .post(validateSuspect, createSuspect);

// GET /api/suspects/:id
// PATCH /api/suspects/:id
router
  .route('/:id')
  .get(getSuspectById)
  .patch(updateSuspect);

// POST /api/suspects/:id/link - Add a new case to this suspect
router.post('/:id/link', linkSuspectToCase);

module.exports = router;
