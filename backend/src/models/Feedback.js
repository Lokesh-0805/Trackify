const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FeedbackAssignment',
      required: [true, 'assignmentId is required'],
      index: true,
    },
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
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

feedbackSchema.index({ assignmentId: 1 }, { unique: true });
feedbackSchema.index({ companyId: 1, cycleId: 1 });
feedbackSchema.index({ reviewerId: 1, revieweeId: 1 });
feedbackSchema.index({ revieweeId: 1, cycleId: 1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
