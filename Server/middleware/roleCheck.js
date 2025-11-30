export const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

export const institutionOnly = (req, res, next) => {
  if (req.user.role !== 'institution') {
    return res.status(403).json({
      success: false,
      message: 'Institution access required'
    });
  }
  next();
};

export const studentOnly = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Student access required'
    });
  }
  next();
};