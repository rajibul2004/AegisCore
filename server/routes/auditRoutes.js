const express = require('express');
const { getAuditLogs } = require('../controllers/auditController');
const { protect } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');

const router = express.Router();

router.use(protect);
router.use(requireRole('admin'));

router.get('/', getAuditLogs);

module.exports = router;
