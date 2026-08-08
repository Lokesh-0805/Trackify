const mongoose = require('mongoose');

const feedbackParameterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Parameter name is required'],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

feedbackParameterSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model('FeedbackParameter', feedbackParameterSchema);
