const express = require('express');
const {
  createReport,
  getReportsByCase,
  getReportById,
  updateReport,
  deleteReport,
  generateReportSummary
} = require('../controllers/reportController');
const { protect } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');

const router = express.Router();

router.use(protect);
router.use(requireRole('police', 'admin'));

router.get('/case/:caseId', getReportsByCase);

router.post('/', createReport);

router.get('/:id', getReportById);
router.patch('/:id', updateReport);
router.delete('/:id', deleteReport);

router.post('/:id/summarize', generateReportSummary);

module.exports = router;
