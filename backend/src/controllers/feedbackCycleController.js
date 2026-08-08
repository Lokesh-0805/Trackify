const FeedbackCycle = require('../models/FeedbackCycle');

const createCycle = async (req, res, next) => {
  try {
    const { month, year, status } = req.body;

    if (!month || !year) {
      const error = new Error('month and year are required');
      error.statusCode = 400;
      throw error;
    }

    const existingCycle = await FeedbackCycle.findOne({
      companyId: req.user.companyId,
      month,
      year,
    });

    if (existingCycle) {
      const error = new Error('A feedback cycle for this month and year already exists');
      error.statusCode = 409;
      throw error;
    }

    const cycle = await FeedbackCycle.create({
      companyId: req.user.companyId,
      month,
      year,
      status: status || 'OPEN',
    });

    res.status(201).json({
      success: true,
      cycle,
    });
  } catch (error) {
    next(error);
  }
};

const getCurrentCycle = async (req, res, next) => {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const cycle = await FeedbackCycle.findOne({
      companyId: req.user.companyId,
      year: currentYear,
      month: currentMonth,
    }).sort({ createdAt: -1 });

    if (!cycle) {
      return res.json({
        success: true,
        cycle: null,
        message: 'No current cycle found for this company',
      });
    }

    res.json({
      success: true,
      cycle,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCycle,
  getCurrentCycle,
};
