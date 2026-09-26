const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema(
  {
    caseNumber: {
      type: String,
      unique: true,
      index: true,
    },
    fir: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FIR',
      required: [true, 'FIR ID is required to create a case'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Case title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Case description/summary is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['registered', 'under_investigation', 'pending', 'solved', 'closed'],
      default: 'registered',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    assignedDate: {
      type: Date,
    },
    closureReason: {
      type: String,
      trim: true,
    }
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate unique case number
caseSchema.pre('save', async function () {
  if (this.isNew) {
    const year = new Date().getFullYear();
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    
    // Format: CASE-YYYY-XXXX
    this.caseNumber = `CASE-${year}-${randomStr}`;
  }
  
  if (this.isModified('assignedOfficer') && this.assignedOfficer && !this.assignedDate) {
    this.assignedDate = new Date();
  }
});

const Case = mongoose.model('Case', caseSchema);

module.exports = Case;
