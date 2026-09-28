const express = require('express');
const {
  createSuspect,
  getSuspects,
  getSuspectById,
  updateSuspect,
  linkSuspectToCase,
  deleteSuspect
} = require('../controllers/suspectController');
const { protect } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');
const { validateSuspect } = require('../middlewares/validateRequest');

const router = express.Router();

router.use(protect);
router.use(requireRole('police', 'admin'));

router.get('/', getSuspects);
router.post('/', validateSuspect, createSuspect);

router.get('/:id', getSuspectById);
router.patch('/:id', updateSuspect);

router.post('/:id/link', linkSuspectToCase);
router.delete('/:id', requireRole('admin'), deleteSuspect);

module.exports = router;
