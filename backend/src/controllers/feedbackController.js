const Feedback = require('../models/Feedback');
const FeedbackItem = require('../models/FeedbackItem');
const FeedbackAssignment = require('../models/FeedbackAssignment');
const FeedbackCycle = require('../models/FeedbackCycle');
const FeedbackParameter = require('../models/FeedbackParameter');

const submitFeedback = async (req, res, next) => {
  try {
    const { assignmentId, items } = req.body;

    if (!assignmentId) {
      const error = new Error('assignmentId is required');
      error.statusCode = 400;
      throw error;
    }

    if (!Array.isArray(items) || items.length !== 5) {
      const error = new Error('Exactly five feedback items are required');
      error.statusCode = 400;
      throw error;
    }

    const seenParameterIds = new Set();
    const normalizedItems = [];

    for (const item of items) {
      if (!item || !item.parameterId || item.score === undefined || item.comment === undefined) {
        const error = new Error('Each feedback item must include parameterId, score, and comment');
        error.statusCode = 400;
        throw error;
      }

      if (seenParameterIds.has(item.parameterId.toString())) {
        const error = new Error('Duplicate parameterId values are not allowed');
        error.statusCode = 400;
        throw error;
      }

      seenParameterIds.add(item.parameterId.toString());

      if (typeof item.score !== 'number' || !Number.isFinite(item.score) || item.score < 1 || item.score > 5) {
        const error = new Error('Score must be a number between 1 and 5');
        error.statusCode = 400;
        throw error;
      }

      const trimmedComment = String(item.comment).trim();
      if (!trimmedComment) {
        const error = new Error('Comment is required for each feedback item');
        error.statusCode = 400;
        throw error;
      }

      normalizedItems.push({
        parameterId: item.parameterId,
        score: item.score,
        comment: trimmedComment,
      });
    }

    const existingFeedback = await Feedback.findOne({ assignmentId });
    if (existingFeedback) {
      const error = new Error('Feedback has already been submitted for this assignment');
      error.statusCode = 409;
      throw error;
    }

    const assignment = await FeedbackAssignment.findOne({
      _id: assignmentId,
      companyId: req.user.companyId,
      reviewerId: req.user._id,
      status: 'PENDING',
    });

    if (!assignment) {
      const error = new Error('Assignment not found or is no longer pending');
      error.statusCode = 404;
      throw error;
    }

    const cycle = await FeedbackCycle.findOne({
      _id: assignment.cycleId,
      status: 'OPEN',
    });

    if (!cycle) {
      const error = new Error('The feedback cycle is not open');
      error.statusCode = 400;
      throw error;
    }

    const parameterIds = normalizedItems.map((item) => item.parameterId);
    const parameters = await FeedbackParameter.find({
      _id: { $in: parameterIds },
      active: true,
    });

    if (parameters.length !== 5) {
      const error = new Error('One or more feedback parameters are invalid');
      error.statusCode = 400;
      throw error;
    }

    let createdFeedback = null;

    try {
      createdFeedback = await Feedback.create({
        assignmentId,
        companyId: req.user.companyId,
        cycleId: assignment.cycleId,
        reviewerId: req.user._id,
        revieweeId: assignment.revieweeId,
        submittedAt: new Date(),
      });

      const feedbackItems = normalizedItems.map((item) => ({
        feedbackId: createdFeedback._id,
        parameterId: item.parameterId,
        score: item.score,
        comment: item.comment,
      }));

      await FeedbackItem.insertMany(feedbackItems);

      await FeedbackAssignment.findByIdAndUpdate(assignment._id, {
        status: 'SUBMITTED',
        submittedAt: new Date(),
      });

      res.status(201).json({
        success: true,
        message: 'Feedback submitted successfully',
        feedback: createdFeedback,
      });
    } catch (error) {
      if (createdFeedback) {
        await Feedback.deleteOne({ _id: createdFeedback._id });
        await FeedbackItem.deleteMany({ feedbackId: createdFeedback._id });
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

const getMySubmissions = async (req, res, next) => {
  try {
    const submissions = await Feedback.find({
      companyId: req.user.companyId,
      reviewerId: req.user._id,
    })
      .sort({ submittedAt: -1 })
      .populate('cycleId', 'month year status')
      .populate('revieweeId', 'name email role')
      .populate('assignmentId', 'status submittedAt');

    const feedbackIds = submissions.map((submission) => submission._id);
    const items = await FeedbackItem.find({ feedbackId: { $in: feedbackIds } }).populate('parameterId', 'name description');

    const itemsByFeedbackId = items.reduce((acc, item) => {
      const key = item.feedbackId.toString();
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});

    const response = submissions.map((submission) => ({
      ...submission.toObject(),
      items: itemsByFeedbackId[submission._id.toString()] || [],
    }));

    res.json({
      success: true,
      count: response.length,
      submissions: response,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitFeedback,
  getMySubmissions,
};
