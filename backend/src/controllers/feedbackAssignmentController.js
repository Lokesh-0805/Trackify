const FeedbackAssignment = require('../models/FeedbackAssignment');
const FeedbackCycle = require('../models/FeedbackCycle');
const User = require('../models/User');

const createAssignments = async (req, res, next) => {
  try {
    const { cycleId, revieweeIds } = req.body;

    if (!cycleId || !Array.isArray(revieweeIds) || revieweeIds.length === 0) {
      const error = new Error('cycleId and revieweeIds are required');
      error.statusCode = 400;
      throw error;
    }

    const cycle = await FeedbackCycle.findOne({
      _id: cycleId,
      companyId: req.user.companyId,
    });

    if (!cycle) {
      const error = new Error('Feedback cycle not found');
      error.statusCode = 404;
      throw error;
    }

    const reviewer = req.user;

    const directReports = await User.find({
      companyId: req.user.companyId,
      managerId: reviewer._id,
    });

    const directReportIds = new Set(directReports.map((user) => user._id.toString()));

    const invalidReviewees = revieweeIds.filter((id) => !directReportIds.has(id.toString()));
    if (invalidReviewees.length > 0) {
      const error = new Error('You can only create assignments for your direct reports');
      error.statusCode = 403;
      throw error;
    }

    const existingAssignments = await FeedbackAssignment.find({
      companyId: req.user.companyId,
      cycleId,
      reviewerId: reviewer._id,
    });

    const existingRevieweeSet = new Set(existingAssignments.map((assignment) => assignment.revieweeId.toString()));

    const newAssignments = [];

    for (const revieweeId of revieweeIds) {
      if (existingRevieweeSet.has(revieweeId.toString())) {
        continue;
      }

      const assignment = await FeedbackAssignment.create({
        companyId: req.user.companyId,
        cycleId,
        reviewerId: reviewer._id,
        revieweeId,
        status: 'PENDING',
      });

      newAssignments.push(assignment);
    }

    res.status(201).json({
      success: true,
      created: newAssignments.length,
      assignments: newAssignments,
    });
  } catch (error) {
    next(error);
  }
};

const getPendingAssignments = async (req, res, next) => {
  try {
    const assignments = await FeedbackAssignment.find({
      companyId: req.user.companyId,
      reviewerId: req.user._id,
      status: 'PENDING',
    })
      .populate('cycleId', 'month year status')
      .populate('revieweeId', 'name email role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: assignments.length,
      assignments,
    });
  } catch (error) {
    next(error);
  }
};

const getAssignmentById = async (req, res, next) => {
  try {
    const assignment = await FeedbackAssignment.findOne({
      _id: req.params.id,
      companyId: req.user.companyId,
    })
      .populate('cycleId', 'month year status')
      .populate('reviewerId', 'name email role')
      .populate('revieweeId', 'name email role');

    if (!assignment) {
      const error = new Error('Assignment not found');
      error.statusCode = 404;
      throw error;
    }

    res.json({
      success: true,
      assignment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAssignments,
  getPendingAssignments,
  getAssignmentById,
};
