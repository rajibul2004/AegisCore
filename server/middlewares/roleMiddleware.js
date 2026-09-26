const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized — please login first',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied — requires ${allowedRoles.join(' or ')} role`,
        yourRole: req.user.role,
      });
    }

    next();
  };
};

module.exports = { requireRole };
