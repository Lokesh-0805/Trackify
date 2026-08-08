const getHealth = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Performance Evaluation API is running'
  });
};

module.exports = {
  getHealth
};
