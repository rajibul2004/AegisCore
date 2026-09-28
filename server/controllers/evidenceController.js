const auditService = require('../services/auditService');
const Evidence = require('../models/Evidence');
const Case = require('../models/Case');
const storageService = require('../services/storageService');
const notificationService = require('../services/notificationService');

const uploadEvidence = async (req, res) => {
  try {
    const { caseId, title, description } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    // Verify Case exists
    const investigationCase = await Case.findById(caseId).populate('fir');
    if (!investigationCase) {
      return res.status(404).json({ success: false, message: 'Associated Case not found' });
    }

    // Abstracted Storage Call
    const fileUrl = await storageService.uploadFile(file);

    const evidence = await Evidence.create({
      caseId,
      title,
      description,
      fileUrl,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      uploadedBy: req.user._id,
    });

    // Notify the assigned officer if someone else uploaded it
    if (investigationCase.assignedOfficer && investigationCase.assignedOfficer.toString() !== req.user._id.toString()) {
      await notificationService.createNotification({
        recipient: investigationCase.assignedOfficer,
        sender: req.user._id,
        type: 'evidence_uploaded',
        title: 'New Evidence Uploaded',
        message: `New evidence "${title}" added to Case: ${investigationCase.caseNumber}`,
        link: `/cases/${caseId}`
      });
    }

    // Also notify complainant
    if (investigationCase.fir && investigationCase.fir.complainant && investigationCase.fir.complainant.toString() !== req.user._id.toString()) {
       await notificationService.createNotification({
        recipient: investigationCase.fir.complainant,
        sender: req.user._id,
        type: 'evidence_uploaded',
        title: 'Case Update',
        message: `New evidence was attached to your case (${investigationCase.caseNumber}).`,
        link: `/cases/${caseId}`
      });
    }

    await auditService.log(req, 'evidence_uploaded', 'Evidence', evidence._id, { caseId });
    res.status(201).json({
      success: true,
      message: 'Evidence uploaded successfully',
      data: evidence,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while uploading evidence',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

const getEvidenceByCase = async (req, res) => {
  try {
    const { caseId } = req.params;

    const evidence = await Evidence.find({ caseId })
      .populate('uploadedBy', 'name badgeNumber')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: evidence.length,
      data: evidence,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while fetching evidence' });
  }
};

const deleteEvidence = async (req, res) => {
  try {
    const evidence = await Evidence.findById(req.params.id);

    if (!evidence) {
      return res.status(404).json({ success: false, message: 'Evidence not found' });
    }

    // Delete from storage (Local / S3)
    await storageService.deleteFile(evidence.fileUrl);

    // Delete from DB
    await evidence.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Evidence deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while deleting evidence' });
  }
};

const getAllEvidence = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    
    let query = {};
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const total = await Evidence.countDocuments(query);
    const evidence = await Evidence.find(query)
      .populate('uploadedBy', 'name badgeNumber')
      .populate('caseId', 'caseNumber title')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
      data: evidence,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while fetching global evidence' });
  }
};

module.exports = {
  uploadEvidence,
  getEvidenceByCase,
  deleteEvidence,
  getAllEvidence
};
