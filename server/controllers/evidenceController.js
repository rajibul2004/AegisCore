const Evidence = require('../models/Evidence');
const Case = require('../models/Case');
const storageService = require('../services/storageService');

const uploadEvidence = async (req, res) => {
  try {
    const { caseId, title, description } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    // Verify Case exists
    const investigationCase = await Case.findById(caseId);
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

module.exports = {
  uploadEvidence,
  getEvidenceByCase,
  deleteEvidence,
};
