const aiService = require('../services/aiService');
const AILog = require('../models/AILog');

const testAI = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Please provide a prompt' });
    }

    // Limit prompt length to prevent abuse during testing
    if (prompt.length > 500) {
      return res.status(400).json({ success: false, message: 'Test prompt is too long (max 500 chars)' });
    }

    const response = await aiService.testPrompt(req.user._id, prompt);

    res.status(200).json({
      success: true,
      data: {
        response
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error while processing AI request' 
    });
  }
};

const getAILogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    const total = await AILog.countDocuments();
    const logs = await AILog.find()
      .populate('user', 'name email role')
      .populate('caseId', 'caseNumber title')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: logs.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
      data: logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching AI logs',
    });
  }
};

module.exports = {
  testAI,
  getAILogs
};
