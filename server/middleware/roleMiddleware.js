const allowRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Access denied. Required role: ${roles.join(' or ')}.`,
    });
  }

  next();
};

module.exports = {
  learnerOnly: allowRoles('learner'),
  trainerOnly: allowRoles('trainer'),
  trainerOrAdmin: allowRoles('trainer', 'admin'),
};