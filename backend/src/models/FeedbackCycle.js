const mongoose = require('mongoose');

const feedbackCycleSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'companyId is required'],
      index: true,
    },
    month: {
      type: Number,
      required: [true, 'Month is required'],
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: 2000,
      max: 2100,
    },
    status: {
      type: String,
      enum: ['OPEN', 'CLOSED'],
      default: 'OPEN',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

feedbackCycleSchema.index({ companyId: 1, year: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('FeedbackCycle', feedbackCycleSchema);
