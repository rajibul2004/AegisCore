const express = require('express');
const {
  createReport,
  getReportsByCase,
  getReportById,
  updateReport,
  deleteReport
} = require('../controllers/reportController');
const { protect } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');

const router = express.Router();

// Only Police and Admin can access Reports
router.use(protect);
router.use(requireRole('police', 'admin'));

// GET /api/reports/case/:caseId - List reports for a case
router.get('/case/:caseId', getReportsByCase);

// POST /api/reports - Create new report
router.post('/', createReport);

// GET /api/reports/:id - View single report
// PATCH /api/reports/:id - Update report
// DELETE /api/reports/:id - Delete report (Admin only within controller)
router
  .route('/:id')
  .get(getReportById)
  .patch(updateReport)
  .delete(deleteReport);

module.exports = router;
