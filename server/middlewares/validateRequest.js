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

const validateLogin = (req, res, next) => {
  const errors = [];
  const { email, password } = req.body;

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    errors.push('A valid email is required');
  }

  if (!password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

const validateFIR = (req, res, next) => {
  const errors = [];
  let { title, description, incidentDate, location } = req.body;

  // Handle FormData where location might be a JSON string
  if (typeof location === 'string') {
    try {
      location = JSON.parse(location);
      req.body.location = location; // Write it back so controller gets the object
    } catch (e) {
      errors.push('Invalid location format');
    }
  }

  

  if (!title || title.trim().length < 5) {
    errors.push('Title must be at least 5 characters long');
  }

  if (!description || description.trim().length < 20) {
    errors.push('Description must provide at least 20 characters of detail');
  }

  if (!incidentDate || isNaN(Date.parse(incidentDate))) {
    errors.push('A valid incident date is required');
  } else if (new Date(incidentDate) > new Date()) {
    errors.push('Incident date cannot be in the future');
  }

  if (!location || !location.address || location.address.trim().length < 5) {
    errors.push('A specific incident address is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

const validateCase = (req, res, next) => {
  const errors = [];
  const { firId, title, description } = req.body;

  if (!firId) {
    errors.push('FIR ID is required to create a case');
  }

  if (!title || title.trim().length < 5) {
    errors.push('Case title must be at least 5 characters long');
  }

  if (!description || description.trim().length < 20) {
    errors.push('Case description must provide at least 20 characters of detail');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

const validateSuspect = (req, res, next) => {
  const errors = [];
  const { name, cases } = req.body;

  if (!name || name.trim().length < 2) {
    errors.push('Suspect name must be at least 2 characters long');
  }

  if (cases && !Array.isArray(cases)) {
    errors.push('Cases must be an array of Case IDs');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

module.exports = { validateRegister, validateLogin, validateFIR, validateCase, validateSuspect };
