const User = require('../models/User');

const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({
      _id: req.user._id,
      companyId: req.user.companyId,
    }).select('-password');

    if (!user) {
      const error = new Error('Employee not found');
      error.statusCode = 404;
      throw error;
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

const getMyTeam = async (req, res, next) => {
  try {
    const teamMembers = await User.find({
      companyId: req.user.companyId,
      managerId: req.user._id,
    })
      .select('-password')
      .sort({ name: 1 });

    res.json({
      success: true,
      count: teamMembers.length,
      team: teamMembers,
    });
  } catch (error) {
    next(error);
  }
};

const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await User.findOne({
      _id: req.params.id,
      companyId: req.user.companyId,
    }).select('-password');

    if (!employee) {
      const error = new Error('Employee not found');
      error.statusCode = 404;
      throw error;
    }

    res.json({
      success: true,
      employee,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProfile,
  getMyTeam,
  getEmployeeById,
};
