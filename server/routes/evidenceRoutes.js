const express = require('express');
const {
  uploadEvidence,
  getEvidenceByCase,
  deleteEvidence,
  getAllEvidence
} = require('../controllers/evidenceController');
const { protect } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', requireRole('police', 'admin'), getAllEvidence);
router.get('/case/:caseId', getEvidenceByCase);

router.post(
  '/', 
  requireRole('police', 'admin'), 
  upload.single('file'), 
  uploadEvidence
);

router.delete('/:id', requireRole('admin'), deleteEvidence);

module.exports = router;
