const express = require('express');
const { testAI } = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Ensure AI endpoints are only accessible by authenticated users
router.use(protect);

router.post('/test', testAI);

module.exports = router;
