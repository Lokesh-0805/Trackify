const mongoose = require('mongoose');

const feedbackParameterSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'companyId is required'],
      index: true,
    },
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

feedbackParameterSchema.index({ companyId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('FeedbackParameter', feedbackParameterSchema);
