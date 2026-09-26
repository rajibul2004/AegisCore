const mongoose = require('mongoose');

const suspectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Suspect name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    aliases: [{
      type: String,
      trim: true,
    }],
    age: {
      type: Number,
      min: [10, 'Age seems too low'],
      max: [120, 'Age seems too high'],
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Unknown'],
      default: 'Unknown',
    },
    physicalDescription: {
      type: String,
      trim: true,
    },
    lastKnownAddress: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['wanted', 'apprehended', 'cleared', 'under_surveillance', 'unknown'],
      default: 'unknown',
      index: true,
    },
    cases: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case',
      index: true,
    }],
    notes: {
      type: String,
      trim: true,
    },
    mugshotUrl: {
      type: String,
    }
  },
  {
    timestamps: true,
  }
);

// Optional: Virtual to calculate number of associated cases
suspectSchema.virtual('caseCount').get(function() {
  return this.cases ? this.cases.length : 0;
});

// Ensure virtuals are included in JSON output
suspectSchema.set('toJSON', { virtuals: true });
suspectSchema.set('toObject', { virtuals: true });

const Suspect = mongoose.model('Suspect', suspectSchema);

module.exports = Suspect;
