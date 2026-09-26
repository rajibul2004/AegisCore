const validateRegister = (req, res, next) => {
  const errors = [];
  const { name, email, password, role } = req.body;

  if (!name || name.trim().length < 2) {
    errors.push('Name is required and must be at least 2 characters');
  }

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    errors.push('A valid email is required');
  }

  if (!password || password.length < 6) {
    errors.push('Password is required and must be at least 6 characters');
  }

  if (role && !['admin', 'police', 'public'].includes(role)) {
    errors.push('Role must be admin, police, or public');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

module.exports = { validateRegister };
