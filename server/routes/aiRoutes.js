const express = require('express');
const { testAI, getAILogs, analyzeCase } = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');

const router = express.Router();

router.use(protect);

router.post('/test', testAI);
router.get('/logs', requireRole('admin'), getAILogs);
router.post('/analyze-case', requireRole('admin', 'police'), analyzeCase);

module.exports = router;
