const Report = require('../models/Report');
const Case = require('../models/Case');
const aiService = require('../services/aiService');

const createReport = async (req, res) => {
  try {
    const { caseId, title, content, reportType } = req.body;

    // Verify Case exists
    const investigationCase = await Case.findById(caseId);
    if (!investigationCase) {
      return res.status(404).json({ success: false, message: 'Associated Case not found' });
    }

    // Future AI Hook: Generate summary of the content upon creation
    // const aiSummary = await aiService.generateSummary(content);

    const report = await Report.create({
      caseId,
      author: req.user._id,
      reportType: reportType || 'investigation',
      title,
      content,
      // aiSummary, // Will be enabled when Groq is integrated
    });

    res.status(201).json({
      success: true,
      message: 'Report created successfully',
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while creating report',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

const getReportsByCase = async (req, res) => {
  try {
    const { caseId } = req.params;

    const reports = await Report.find({ caseId })
      .populate('author', 'name badgeNumber')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while fetching reports' });
  }
};

const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('author', 'name badgeNumber department email')
      .populate('caseId', 'caseNumber title status');

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }
    res.status(500).json({ success: false, message: 'Server error while fetching report' });
  }
};

const updateReport = async (req, res) => {
  try {
    const { title, content, reportType } = req.body;
    
    let report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    // Basic authorization: Only author or admin can edit
    if (report.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this report' });
    }

    if (title) report.title = title;
    if (reportType) report.reportType = reportType;
    
    // If content changes, we might want to regenerate the AI summary
    if (content && content !== report.content) {
      report.content = content;
      // report.aiSummary = await aiService.generateSummary(content);
    }

    await report.save();

    res.status(200).json({
      success: true,
      message: 'Report updated successfully',
      data: report,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }
    res.status(500).json({ success: false, message: 'Server error while updating report' });
  }
};

const deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only administrators can delete reports' });
    }

    await report.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Report deleted successfully',
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }
    res.status(500).json({ success: false, message: 'Server error while deleting report' });
  }
};

module.exports = {
  createReport,
  getReportsByCase,
  getReportById,
  updateReport,
  deleteReport
};
