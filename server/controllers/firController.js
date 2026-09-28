const auditService = require('../services/auditService');
const FIR = require('../models/FIR');

const createFIR = async (req, res) => {
  try {
    const { title, description, incidentDate, location, isAnonymous } = req.body;

    const fir = await FIR.create({
      complainant: req.user._id,
      title,
      description,
      incidentDate,
      location,
      isAnonymous: isAnonymous || false,
    });

    await auditService.log(req, 'fir_created', 'FIR', fir._id, { firNumber: fir.firNumber });

    res.status(201).json({
      success: true,
      message: 'FIR submitted successfully',
      data: fir,
    });
  } catch (error) {
    console.error("CREATE FIR ERROR:", error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating FIR',
      error: error.message,
      stack: error.stack
    });
  }
};

const getFIRs = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    let query = {};

    // Public users can only see their own FIRs
    if (req.user.role === 'public') {
      query.complainant = req.user._id;
    }

    // Advanced Filtering
    if (req.query.status) query.status = req.query.status;
    if (req.query.priority) query.priority = req.query.priority;
    if (req.query.firNumber) {
      query.firNumber = { $regex: req.query.firNumber, $options: 'i' };
    }
    if (req.query.location) {
      query['location.address'] = { $regex: req.query.location, $options: 'i' };
    }
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    if (req.query.startDate || req.query.endDate) {
      query.createdAt = {};
      if (req.query.startDate) query.createdAt.$gte = new Date(req.query.startDate);
      if (req.query.endDate) {
        const end = new Date(req.query.endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const total = await FIR.countDocuments(query);
    const firs = await FIR.find(query)
      .populate('complainant', 'name email')
      .populate('assignedOfficer', 'name badgeNumber')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: firs.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
      data: firs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching FIRs',
    });
  }
};

const getFIRLocations = async (req, res) => {
  try {
    let query = {};
    
    // Public users only see their own FIRs on the map
    if (req.user.role === 'public') {
      query.complainant = req.user._id;
    }

    // Only return FIRs that actually have coordinates
    query['location.coordinates.lat'] = { $exists: true, $ne: null };
    query['location.coordinates.lng'] = { $exists: true, $ne: null };

    // Select only the minimal fields needed for the map to prevent exposing PII
    // Do not include complainant details or full description unless it's their own
    const firs = await FIR.find(query)
      .select('firNumber title location status priority incidentDate isAnonymous')
      .lean();

    res.status(200).json({
      success: true,
      count: firs.length,
      data: firs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching FIR locations',
    });
  }
};

const getFIRById = async (req, res) => {
  try {
    const fir = await FIR.findById(req.params.id)
      .populate('complainant', 'name email phone')
      .populate('assignedOfficer', 'name badgeNumber department');

    if (!fir) {
      return res.status(404).json({ success: false, message: 'FIR not found' });
    }

    // Security check: Public users can only view their own FIRs
    if (req.user.role === 'public' && fir.complainant._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this FIR' });
    }

    res.status(200).json({
      success: true,
      data: fir,
    });
  } catch (error) {
    // Check if the error is a cast error (invalid MongoDB ID)
    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'FIR not found' });
    }
    res.status(500).json({ success: false, message: 'Server error while fetching FIR' });
  }
};

const updateFIRStatus = async (req, res) => {
  try {
    const { status, priority, assignedOfficer } = req.body;
    
    // Build update object based on what was provided
    const updateFields = {};
    if (status) updateFields.status = status;
    if (priority) updateFields.priority = priority;
    if (assignedOfficer) updateFields.assignedOfficer = assignedOfficer;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid update fields provided' });
    }

    const fir = await FIR.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    )
    .populate('complainant', 'name email')
    .populate('assignedOfficer', 'name badgeNumber');

    if (!fir) {
      return res.status(404).json({ success: false, message: 'FIR not found' });
    }

    await auditService.log(req, 'fir_status_updated', 'FIR', fir._id, updateFields);

    res.status(200).json({
      success: true,
      message: 'FIR updated successfully',
      data: fir,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'FIR not found' });
    }
    res.status(500).json({ success: false, message: 'Server error while updating FIR' });
  }
};

const deleteFIR = async (req, res) => {
  try {
    const fir = await FIR.findById(req.params.id);

    if (!fir) {
      return res.status(404).json({ success: false, message: 'FIR not found' });
    }

    await fir.deleteOne();

    res.status(200).json({
      success: true,
      message: 'FIR deleted successfully',
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'FIR not found' });
    }
    res.status(500).json({ success: false, message: 'Server error while deleting FIR' });
  }
};

module.exports = {
  createFIR,
  getFIRs,
  getFIRLocations,
  getFIRById,
  updateFIRStatus,
  deleteFIR,
};
