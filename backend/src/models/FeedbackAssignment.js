const mongoose = require('mongoose');

const feedbackAssignmentSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'companyId is required'],
      index: true,
    },
    cycleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FeedbackCycle',
      required: [true, 'cycleId is required'],
      index: true,
    },
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'reviewerId is required'],
      index: true,
    },
    revieweeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'revieweeId is required'],
      index: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'SUBMITTED'],
      default: 'PENDING',
      index: true,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

feedbackAssignmentSchema.index(
  { companyId: 1, cycleId: 1, reviewerId: 1, revieweeId: 1 },
  { unique: true }
);
feedbackAssignmentSchema.index({ companyId: 1, cycleId: 1 });
feedbackAssignmentSchema.index({ reviewerId: 1, status: 1 });
feedbackAssignmentSchema.index({ revieweeId: 1, status: 1 });
feedbackAssignmentSchema.index({ companyId: 1, status: 1 });

module.exports = mongoose.model('FeedbackAssignment', feedbackAssignmentSchema);
