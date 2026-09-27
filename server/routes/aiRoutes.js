const express = require('express');
const { testAI, getAILogs } = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');

const router = express.Router();

// Ensure AI endpoints are only accessible by authenticated users
router.use(protect);

router.post('/test', testAI);
router.get('/logs', requireRole('admin'), getAILogs);

module.exports = router;
