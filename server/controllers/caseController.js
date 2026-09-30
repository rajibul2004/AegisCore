const auditService = require('../services/auditService');
const Case = require('../models/Case');
const FIR = require('../models/FIR');
const notificationService = require('../services/notificationService');

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

    const assignedTo = assignedOfficer || req.user._id;

    const newCase = await Case.create({
      fir: firId,
      title,
      description,
      priority: priority || fir.priority,
      assignedOfficer: assignedTo,
    });

    // Update FIR status automatically
    fir.status = 'registered';
    await fir.save();
    
    await FIR.findByIdAndUpdate(firId, { caseId: newCase._id });

    // Trigger Notification for the assigned officer
    if (assignedTo.toString() !== req.user._id.toString()) {
      await notificationService.createNotification({
        recipient: assignedTo,
        sender: req.user._id,
        type: 'case_assigned',
        title: 'New Case Assigned',
        message: `You have been assigned to Case: ${newCase.caseNumber} - ${newCase.title}`,
        link: `/cases/${newCase._id}`
      });
    }

    await auditService.log(req, 'case_created', 'Case', newCase._id, { caseNumber: newCase.caseNumber, firId: firId });

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
    let andConditions = [];

    // Filters for Police/Admin from UI
    if (req.query.status) andConditions.push({ status: req.query.status });
    if (req.query.priority) andConditions.push({ priority: req.query.priority });
    if (req.query.assignedOfficer) andConditions.push({ assignedOfficer: req.query.assignedOfficer });
    if (req.query.caseNumber) {
      andConditions.push({ caseNumber: { $regex: req.query.caseNumber, $options: 'i' } });
    }

    // Role-based Restrictions
    if (req.user.role === 'police') {
      andConditions.push({ assignedOfficer: req.user._id });
    }

    // Text search
    if (req.query.search) {
      andConditions.push({
        $or: [
          { title: { $regex: req.query.search, $options: 'i' } },
          { description: { $regex: req.query.search, $options: 'i' } }
        ]
      });
    }
    
    // Date ranges
    if (req.query.startDate || req.query.endDate) {
      let dateQuery = {};
      if (req.query.startDate) dateQuery.$gte = new Date(req.query.startDate);
      if (req.query.endDate) {
        const end = new Date(req.query.endDate);
        end.setHours(23, 59, 59, 999);
        dateQuery.$lte = end;
      }
      andConditions.push({ createdAt: dateQuery });
    }

    // Advanced relational query: Filter cases by FIR Number (requires lookup first)
    if (req.query.firNumber) {
      const matchedFIRs = await FIR.find({ 
        firNumber: { $regex: req.query.firNumber, $options: 'i' } 
      }).select('_id');
      const matchedFirIds = matchedFIRs.map(f => f._id);
      andConditions.push({ fir: { $in: matchedFirIds } });
    }

    // If public user, they can ONLY see cases linked to their FIRs
    if (req.user.role === 'public') {
      const userFIRs = await FIR.find({ complainant: req.user._id }).select('_id');
      const userFirIds = userFIRs.map(f => f._id);
      
      // We push this mandatory restriction for public users
      andConditions.push({ fir: { $in: userFirIds } });
    }

    if (andConditions.length > 0) {
      query.$and = andConditions;
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
      .populate('fir', 'firNumber complainant incidentDate location status')
      .populate('assignedOfficer', 'name email badgeNumber')
      .populate('evidence')
      .populate('suspects', 'name aliases status')
      .populate('reports', 'title reportType createdAt');

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
    
    const existingCase = await Case.findById(req.params.id).populate('fir', 'firNumber complainant');
    if (!existingCase) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

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
    .populate('fir', 'firNumber complainant')
    .populate('assignedOfficer', 'name badgeNumber');

    // Sync FIR status if Case status changed
    if (status && status !== existingCase.status) {
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

      // Notify the complainant about status change
      if (updatedCase.fir && updatedCase.fir.complainant) {
        await notificationService.createNotification({
          recipient: updatedCase.fir.complainant,
          sender: req.user._id,
          type: 'status_changed',
          title: 'Case Status Updated',
          message: `The status of your case (${updatedCase.caseNumber}) is now: ${status.replace('_', ' ')}.`,
          link: `/cases/${updatedCase._id}`
        });
      }
    }

    // Notify newly assigned officer
    if (assignedOfficer && (!existingCase.assignedOfficer || existingCase.assignedOfficer.toString() !== assignedOfficer.toString())) {
      await notificationService.createNotification({
        recipient: assignedOfficer,
        sender: req.user._id,
        type: 'case_assigned',
        title: 'Reassigned to Case',
        message: `You have been reassigned to Case: ${updatedCase.caseNumber}`,
        link: `/cases/${updatedCase._id}`
      });
    }

    await auditService.log(req, 'case_updated', 'Case', updatedCase._id, updateFields);

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
