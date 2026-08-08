const mongoose = require('mongoose');

const feedbackItemSchema = new mongoose.Schema(
  {
    feedbackId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Feedback',
      required: [true, 'feedbackId is required'],
      index: true,
    },
    parameterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FeedbackParameter',
      required: [true, 'parameterId is required'],
      index: true,
    },
    score: {
      type: Number,
      required: [true, 'Score is required'],
      min: [1, 'Score must be at least 1'],
      max: [5, 'Score must be at most 5'],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
  },
  {
    timestamps: true,
  }
);

feedbackItemSchema.index({ feedbackId: 1, parameterId: 1 }, { unique: true });

module.exports = mongoose.model('FeedbackItem', feedbackItemSchema);
