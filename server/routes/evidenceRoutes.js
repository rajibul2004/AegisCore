const express = require('express');
const {
  uploadEvidence,
  getEvidenceByCase,
  deleteEvidence,
} = require('../controllers/evidenceController');
const { protect } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.use(protect);

// GET /api/evidence/case/:caseId - Get all evidence for a case
router.get('/case/:caseId', getEvidenceByCase);

// POST /api/evidence - Upload evidence (Police/Admin)
// Notice how multer upload middleware is injected BEFORE the controller
router.post(
  '/', 
  requireRole('police', 'admin'), 
  upload.single('file'), 
  uploadEvidence
);

// DELETE /api/evidence/:id - Delete evidence (Admin only)
router.delete('/:id', requireRole('admin'), deleteEvidence);

module.exports = router;
