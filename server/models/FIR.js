const mongoose = require('mongoose');

const firSchema = new mongoose.Schema(
  {
    firNumber: {
      type: String,
      unique: true,
      index: true,
    },
    complainant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Complainant ID is required'],
      index: true,
    },
    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    title: {
      type: String,
      required: [true, 'FIR title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'FIR description is required'],
      trim: true,
    },
    incidentDate: {
      type: Date,
      required: [true, 'Incident date is required'],
    },
    location: {
      address: {
        type: String,
        required: [true, 'Incident address is required'],
      },
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    status: {
      type: String,
      enum: ['pending', 'registered', 'investigating', 'closed', 'rejected'],
      default: 'pending',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate a unique FIR number
firSchema.pre('save', async function (next) {
  if (this.isNew) {
    const year = new Date().getFullYear();
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    
    // Format: FIR-YYYY-XXXX (e.g., FIR-2023-A4F2)
    // A robust system would use a counter collection, but this is simple and effective for this project
    this.firNumber = `FIR-${year}-${randomStr}`;
  }
  next();
});

const FIR = mongoose.model('FIR', firSchema);

module.exports = FIR;
