const auditService = require('../services/auditService');
const notificationService = require('../services/notificationService');
const FIR = require('../models/FIR');

const createFIR = async (req, res) => {
  try {
    const { title, description, incidentDate, location, isAnonymous } = req.body;

    // Map uploaded files to attachments array
    const attachments = req.files ? req.files.map(file => ({
      url: file.path,
      publicId: file.filename,
      originalName: file.originalname,
      resourceType: file.resource_type || 'auto'
    })) : [];

    const fir = await FIR.create({
      complainant: req.user._id,
      title,
      description,
      incidentDate,
      location,
      isAnonymous: isAnonymous === 'true' || isAnonymous === true, // Handle FormData strings
      attachments,
    });

    await auditService.log(req, 'fir_created', 'FIR', fir._id, { firNumber: fir.firNumber });

    // Notify all admins about the new FIR
    const User = require('../models/User');
    const admins = await User.find({ role: 'admin' });
    if (admins.length > 0) {
      await notificationService.notifyMultiple(admins.map(a => a._id), {
        sender: req.user._id,
        type: 'general',
        title: 'New FIR Submitted',
        message: `A new FIR (${fir.firNumber}) has been filed and requires review.`,
        link: `/firs/${fir._id}`
      });
    }

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
    let andConditions = [{ isDeleted: { $ne: true } }];

    // Public and Police users see only FIRs they personally filed in the registry list
    if (req.user.role === 'public' || req.user.role === 'police') {
      andConditions.push({ complainant: req.user._id });
    } 
    // Admins see everything (no role-based restrictions)
    // BUT they can explicitly request to see ONLY their own via ?mine=true
    if (req.query.mine === 'true' && req.user.role === 'admin') {
      andConditions.push({ complainant: req.user._id });
    }

    // Advanced Filtering
    if (req.query.status) andConditions.push({ status: req.query.status });
    if (req.query.priority) andConditions.push({ priority: req.query.priority });
    if (req.query.firNumber) {
      andConditions.push({ firNumber: { $regex: req.query.firNumber, $options: 'i' } });
    }
    if (req.query.location) {
      andConditions.push({ 'location.address': { $regex: req.query.location, $options: 'i' } });
    }
    if (req.query.search) {
      andConditions.push({
        $or: [
          { title: { $regex: req.query.search, $options: 'i' } },
          { description: { $regex: req.query.search, $options: 'i' } }
        ]
      });
    }
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

    if (andConditions.length > 0) {
      query.$and = andConditions;
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
    let query = { isDeleted: { $ne: true } };
    
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

    if (!fir || fir.isDeleted) {
      return res.status(404).json({ success: false, message: 'FIR not found' });
    }

    // Security check: Public users can only view their own FIRs
    if (req.user.role === 'public' && fir.complainant._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this FIR' });
    }

    // Security check: Police can only view FIRs they registered or are assigned to
    if (req.user.role === 'police') {
      const isComplainant = fir.complainant._id.toString() === req.user._id.toString();
      const isAssigned = fir.assignedOfficer && fir.assignedOfficer._id.toString() === req.user._id.toString();
      if (!isComplainant && !isAssigned) {
        return res.status(403).json({ success: false, message: 'Not authorized to view this FIR. You must be the assigned officer or the complainant.' });
      }
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

    // Auto-generate or update Case if registered or assigned
    if (updateFields.status === 'registered' || updateFields.assignedOfficer) {
      const Case = require('../models/Case');
      let existingCase = await Case.findOne({ fir: fir._id });
      
      if (!existingCase && updateFields.status !== 'rejected') {
         existingCase = await Case.create({
            fir: fir._id,
            caseNumber: `CASE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
            title: `Investigation: ${fir.title || 'Unknown'}`.substring(0, 100),
            description: fir.description || 'No description available',
            priority: updateFields.priority || fir.priority,
            assignedOfficer: updateFields.assignedOfficer || req.user._id,
            status: 'registered'
         });
         
         // Auto-migrate FIR attachments to Evidence Locker
         if (fir.attachments && fir.attachments.length > 0) {
           const Evidence = require('../models/Evidence');
           const evidenceDocs = fir.attachments.map(att => ({
              caseId: existingCase._id,
              title: `FIR Attachment: ${att.originalName || 'File'}`.substring(0, 100),
              description: 'Automatically imported from initial FIR submission.',
              fileUrl: att.url,
              originalName: att.originalName || 'unknown_file',
              mimeType: att.resourceType || 'application/octet-stream',
              size: 1024, // fallback size
              uploadedBy: fir.complainant || req.user._id
           }));
           await Evidence.insertMany(evidenceDocs);
         }
      } else if (existingCase && updateFields.assignedOfficer) {
         existingCase.assignedOfficer = updateFields.assignedOfficer;
         await existingCase.save();
      }

      // Notify the assigned officer if they were just assigned
      if (updateFields.assignedOfficer && existingCase) {
         await notificationService.createNotification({
            recipient: updateFields.assignedOfficer,
            sender: req.user._id,
            type: 'case_assigned',
            title: 'New Case Assigned',
            message: `You have been assigned to Case ${existingCase.caseNumber} (FIR: ${fir.firNumber})`,
            link: `/cases/${existingCase._id}`
         });
      }
    }

    if (updateFields.status && fir.complainant) {
      await notificationService.createNotification({
        recipient: fir.complainant._id || fir.complainant,
        sender: req.user._id,
        type: 'general',
        title: 'FIR Status Updated',
        message: `Your FIR (${fir.firNumber}) status has been updated to: ${updateFields.status.toUpperCase()}.`,
        link: `/my-firs`
      });
    }

    await auditService.log(req, 'fir_status_updated', 'FIR', fir._id, updateFields);

    res.status(200).json({
      success: true,
      message: 'FIR updated successfully',
      data: fir,
    });
  } catch (error) {
    console.error('Error updating FIR:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'FIR not found' });
    }
    res.status(500).json({ success: false, message: 'Server error while updating FIR', error: error.message });
  }
};

const deleteFIR = async (req, res) => {
  try {
    const fir = await FIR.findById(req.params.id);

    if (!fir) {
      return res.status(404).json({ success: false, message: 'FIR not found' });
    }

    fir.isDeleted = true;
    await fir.save();

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
