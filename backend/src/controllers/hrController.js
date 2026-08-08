const FeedbackAssignment = require('../models/FeedbackAssignment');
const FeedbackCycle = require('../models/FeedbackCycle');
const User = require('../models/User');

const getPendingFeedback = async (req, res, next) => {
  try {
    const { cycleId } = req.query;

    let cycle = null;

    if (cycleId) {
      cycle = await FeedbackCycle.findOne({
        _id: cycleId,
        companyId: req.user.companyId,
      });
    } else {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      cycle = await FeedbackCycle.findOne({
        companyId: req.user.companyId,
        year: currentYear,
        month: currentMonth,
      });
    }

    if (!cycle) {
      return res.json({
        success: true,
        cycle: null,
        pending: [],
      });
    }

    const assignments = await FeedbackAssignment.find({
      companyId: req.user.companyId,
      cycleId: cycle._id,
    })
      .populate('reviewerId', 'name')
      .populate('revieweeId', 'name')
      .sort({ createdAt: 1 });

    const pending = assignments
      .filter((assignment) => assignment.status === 'PENDING')
      .map((assignment) => ({
        reviewer: assignment.reviewerId?.name || 'Unknown',
        reviewee: assignment.revieweeId?.name || 'Unknown',
        status: assignment.status,
      }));

    res.json({
      success: true,
      cycle: `${cycle.month} ${cycle.year}`,
      pending,
    });
  } catch (error) {
    next(error);
  }
};

const getFeedbackStatusSummary = async (req, res, next) => {
  try {
    const { cycleId } = req.query;

    let cycle = null;

    if (cycleId) {
      cycle = await FeedbackCycle.findOne({
        _id: cycleId,
        companyId: req.user.companyId,
      });
    } else {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      cycle = await FeedbackCycle.findOne({
        companyId: req.user.companyId,
        year: currentYear,
        month: currentMonth,
      });
    }

    if (!cycle) {
      return res.json({
        success: true,
        cycle: null,
        summary: [],
      });
    }

    const assignments = await FeedbackAssignment.find({
      companyId: req.user.companyId,
      cycleId: cycle._id,
    }).populate('reviewerId', 'name');

    const summaryMap = new Map();

    assignments.forEach((assignment) => {
      const reviewerName = assignment.reviewerId?.name || 'Unknown';
      if (!summaryMap.has(reviewerName)) {
        summaryMap.set(reviewerName, {
          reviewer: reviewerName,
          total: 0,
          submitted: 0,
          pending: 0,
        });
      }

      const row = summaryMap.get(reviewerName);
      row.total += 1;
      if (assignment.status === 'SUBMITTED') {
        row.submitted += 1;
      } else {
        row.pending += 1;
      }
    });

    const summary = Array.from(summaryMap.values()).sort((a, b) => a.reviewer.localeCompare(b.reviewer));

    res.json({
      success: true,
      cycle: `${cycle.month} ${cycle.year}`,
      summary,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPendingFeedback,
  getFeedbackStatusSummary,
};
