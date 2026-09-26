const Case = require('../models/Case');
const FIR = require('../models/FIR');

const createCase = async (req, res) => {
  try {
    const { firId, title, description, priority, assignedOfficer } = req.body;

    // Verify FIR exists
    const fir = await FIR.findById(firId);
    if (!fir) {
      return res.status(404).json({ success: false, message: 'Associated FIR not found' });
    }

    // Check if a case already exists for this FIR
    const existingCase = await Case.findOne({ fir: firId });
    if (existingCase) {
      return res.status(400).json({ success: false, message: 'A case already exists for this FIR' });
    }

    const newCase = await Case.create({
      fir: firId,
      title,
      description,
      priority: priority || fir.priority,
      assignedOfficer: assignedOfficer || req.user._id, // Assign to creator by default
    });

    // Update FIR status automatically
    fir.status = 'registered';
    await fir.save();

    res.status(201).json({
      success: true,
      message: 'Case created successfully',
      data: newCase,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while creating Case',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

const getCases = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    let query = {};

    // Filters for Police/Admin
    if (req.query.status) query.status = req.query.status;
    if (req.query.priority) query.priority = req.query.priority;
    if (req.query.assignedOfficer) query.assignedOfficer = req.query.assignedOfficer;

    // If public user, they can only see cases linked to their FIRs
    if (req.user.role === 'public') {
      const userFIRs = await FIR.find({ complainant: req.user._id }).select('_id');
      const firIds = userFIRs.map(f => f._id);
      query.fir = { $in: firIds };
    }

    const total = await Case.countDocuments(query);
    const cases = await Case.find(query)
      .populate('fir', 'firNumber incidentDate location')
      .populate('assignedOfficer', 'name badgeNumber')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: cases.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
      data: cases,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching cases',
    });
  }
};

const getCaseById = async (req, res) => {
  try {
    const investigationCase = await Case.findById(req.params.id)
      .populate({
        path: 'fir',
        populate: { path: 'complainant', select: 'name email phone' }
      })
      .populate('assignedOfficer', 'name badgeNumber department email');

    if (!investigationCase) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    // Security: Public can only view if it's their FIR
    if (req.user.role === 'public' && investigationCase.fir.complainant._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this case' });
    }

    res.status(200).json({
      success: true,
      data: investigationCase,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }
    res.status(500).json({ success: false, message: 'Server error while fetching case' });
  }
};

const updateCase = async (req, res) => {
  try {
    const { status, priority, assignedOfficer, closureReason } = req.body;
    
    const updateFields = {};
    if (status) updateFields.status = status;
    if (priority) updateFields.priority = priority;
    if (assignedOfficer) updateFields.assignedOfficer = assignedOfficer;
    if (closureReason && (status === 'closed' || status === 'solved')) {
      updateFields.closureReason = closureReason;
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid update fields provided' });
    }

    const updatedCase = await Case.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    )
    .populate('fir', 'firNumber')
    .populate('assignedOfficer', 'name badgeNumber');

    if (!updatedCase) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    // Sync FIR status if Case status changed
    if (status) {
      const firStatusMap = {
        'registered': 'registered',
        'under_investigation': 'investigating',
        'pending': 'investigating',
        'solved': 'closed',
        'closed': 'closed'
      };
      
      if (firStatusMap[status]) {
        await FIR.findByIdAndUpdate(updatedCase.fir._id, { status: firStatusMap[status] });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Case updated successfully',
      data: updatedCase,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }
    res.status(500).json({ success: false, message: 'Server error while updating case' });
  }
};

const deleteCase = async (req, res) => {
  try {
    const deletedCase = await Case.findById(req.params.id);

    if (!deletedCase) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    await deletedCase.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Case deleted successfully',
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }
    res.status(500).json({ success: false, message: 'Server error while deleting case' });
  }
};

module.exports = {
  createCase,
  getCases,
  getCaseById,
  updateCase,
  deleteCase,
};
