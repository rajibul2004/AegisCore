const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case',
      required: [true, 'Case ID is required for a report'],
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reportType: {
      type: String,
      enum: ['investigation', 'interrogation', 'forensic', 'closing', 'summary', 'other'],
      default: 'investigation',
    },
    title: {
      type: String,
      required: [true, 'Report title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Report content is required'],
      trim: true,
    },
    // Future-proofing for the AI integration module
    aiSummary: {
      type: String,
      trim: true,
      default: '',
    },
    isAiGenerated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
