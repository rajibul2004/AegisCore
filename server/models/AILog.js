const mongoose = require('mongoose');

const aiLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true, // e.g., 'test_prompt', 'summarize_report', 'analyze_suspect'
    },
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case',
    },
    promptTokens: {
      type: Number,
    },
    responseTokens: {
      type: Number,
    },
    modelUsed: {
      type: String,
      default: 'openai/gpt-oss-20b',
    },
    processingTimeMs: {
      type: Number,
    },
    status: {
      type: String,
      enum: ['success', 'error', 'timeout', 'rate_limited'],
      default: 'success',
    },
    errorMessage: {
      type: String,
    }
  },
  {
    timestamps: true,
  }
);

const AILog = mongoose.model('AILog', aiLogSchema);

module.exports = AILog;
