const Suspect = require('../models/Suspect');
const Case = require('../models/Case');

const createSuspect = async (req, res) => {
  try {
    const { 
      name, aliases, age, gender, 
      physicalDescription, lastKnownAddress, 
      status, cases, notes 
    } = req.body;

    // Verify all provided case IDs exist
    if (cases && cases.length > 0) {
      const validCases = await Case.find({ _id: { $in: cases } });
      if (validCases.length !== cases.length) {
        return res.status(400).json({ 
          success: false, 
          message: 'One or more associated Case IDs are invalid' 
        });
      }
    }

    const suspect = await Suspect.create({
      name,
      aliases: aliases ? aliases.split(',').map(a => a.trim()).filter(a => a) : [],
      age,
      gender,
      physicalDescription,
      lastKnownAddress,
      status: status || 'unknown',
      cases: cases || [],
      notes
    });

    res.status(201).json({
      success: true,
      message: 'Suspect profile created successfully',
      data: suspect,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while creating suspect',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

const getSuspects = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    let query = {};

    if (req.query.status) query.status = req.query.status;
    if (req.query.search) {
      query.name = { $regex: req.query.search, $options: 'i' };
    }
    if (req.query.caseId) {
      query.cases = req.query.caseId;
    }

    const total = await Suspect.countDocuments(query);
    const suspects = await Suspect.find(query)
      .populate('cases', 'caseNumber title')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: suspects.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
      data: suspects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching suspects',
    });
  }
};

const getSuspectById = async (req, res) => {
  try {
    const suspect = await Suspect.findById(req.params.id)
      .populate('cases', 'caseNumber title status');

    if (!suspect) {
      return res.status(404).json({ success: false, message: 'Suspect not found' });
    }

    res.status(200).json({
      success: true,
      data: suspect,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'Suspect not found' });
    }
    res.status(500).json({ success: false, message: 'Server error while fetching suspect' });
  }
};

const updateSuspect = async (req, res) => {
  try {
    const { 
      name, aliases, age, gender, 
      physicalDescription, lastKnownAddress, 
      status, cases, notes 
    } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (aliases !== undefined) {
      updateData.aliases = Array.isArray(aliases) 
        ? aliases 
        : aliases.split(',').map(a => a.trim()).filter(a => a);
    }
    if (age !== undefined) updateData.age = age;
    if (gender) updateData.gender = gender;
    if (physicalDescription !== undefined) updateData.physicalDescription = physicalDescription;
    if (lastKnownAddress !== undefined) updateData.lastKnownAddress = lastKnownAddress;
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    
    // Validate and update cases array
    if (cases) {
      const validCases = await Case.find({ _id: { $in: cases } });
      if (validCases.length !== cases.length) {
        return res.status(400).json({ success: false, message: 'One or more Case IDs are invalid' });
      }
      updateData.cases = cases;
    }

    const suspect = await Suspect.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('cases', 'caseNumber title');

    if (!suspect) {
      return res.status(404).json({ success: false, message: 'Suspect not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Suspect updated successfully',
      data: suspect,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'Suspect not found' });
    }
    res.status(500).json({ success: false, message: 'Server error while updating suspect' });
  }
};

const linkSuspectToCase = async (req, res) => {
  try {
    const { caseId } = req.body;
    
    const suspect = await Suspect.findById(req.params.id);
    if (!suspect) {
      return res.status(404).json({ success: false, message: 'Suspect not found' });
    }

    const investigationCase = await Case.findById(caseId);
    if (!investigationCase) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    // Check if already linked
    if (suspect.cases.includes(caseId)) {
      return res.status(400).json({ success: false, message: 'Suspect is already linked to this case' });
    }

    suspect.cases.push(caseId);
    await suspect.save();

    res.status(200).json({
      success: true,
      message: 'Suspect linked to case successfully',
      data: suspect,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while linking suspect' });
  }
};

module.exports = {
  createSuspect,
  getSuspects,
  getSuspectById,
  updateSuspect,
  linkSuspectToCase
};
