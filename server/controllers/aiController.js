const aiService = require('../services/aiService');

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

module.exports = {
  testAI
};
