const express = require('express');
const rateLimit = require('express-rate-limit');
const { testAI, getAILogs, analyzeCase } = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');

const router = express.Router();

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per 15 min per IP
  message: { success: false, message: 'Too many AI requests from this IP, please try again after 15 minutes.' }
});

router.use(protect);

router.post('/test', aiLimiter, testAI);
router.get('/logs', requireRole('admin'), getAILogs);
router.post('/analyze-case', requireRole('admin', 'police'), aiLimiter, analyzeCase);

module.exports = router;
