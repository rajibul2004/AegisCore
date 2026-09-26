const FIR = require('../models/FIR');
const Case = require('../models/Case');
const Suspect = require('../models/Suspect');
const Evidence = require('../models/Evidence');

const getDashboardStats = async (req, res) => {
  try {
    const role = req.user.role;
    
    // ==========================================
    // PUBLIC USER STATISTICS
    // ==========================================
    if (role === 'public') {
      const userId = req.user._id;

      // 1. Basic Counts
      const totalFIRs = await FIR.countDocuments({ complainant: userId });
      const pendingFIRs = await FIR.countDocuments({ complainant: userId, status: 'pending' });
      const registeredFIRs = await FIR.countDocuments({ complainant: userId, status: 'registered' });
      
      // 2. Chart Data: FIRs by Status using Aggregation
      const firStatusChart = await FIR.aggregate([
        { $match: { complainant: userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);

      return res.status(200).json({
        success: true,
        data: {
          metrics: {
            totalFIRs,
            pendingFIRs,
            registeredFIRs
          },
          charts: {
            firStatus: firStatusChart.map(item => ({ name: item._id, value: item.count }))
          }
        }
      });
    }

    // ==========================================
    // POLICE & ADMIN STATISTICS
    // ==========================================
    
    // 1. Core Metrics (Simple count queries)
    const totalFIRs = await FIR.countDocuments();
    const activeCases = await Case.countDocuments({ status: { $in: ['registered', 'under_investigation', 'pending'] } });
    const solvedCases = await Case.countDocuments({ status: 'solved' });
    const closedCases = await Case.countDocuments({ status: 'closed' });
    const totalSuspects = await Suspect.countDocuments();
    const totalEvidence = await Evidence.countDocuments();

    // 2. Aggregation: Cases by Status (For Pie Chart)
    const casesByStatus = await Case.aggregate([
      // Stage 1: Group all cases by their 'status' field and count them
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // 3. Aggregation: Cases by Priority (For Bar Chart)
    const casesByPriority = await Case.aggregate([
      // Stage 1: Group all cases by their 'priority' field and count them
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    // 4. Aggregation: Recent FIR Trend (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const firsLast7Days = await FIR.aggregate([
      // Stage 1: Only look at FIRs created in the last 7 days
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      // Stage 2: Group by the day (formatting the date to YYYY-MM-DD)
      { 
        $group: { 
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, 
          count: { $sum: 1 } 
        } 
      },
      // Stage 3: Sort by date ascending (oldest to newest)
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalFIRs,
          activeCases,
          solvedCases,
          closedCases,
          totalSuspects,
          totalEvidence
        },
        charts: {
          casesByStatus: casesByStatus.map(item => ({ name: item._id, value: item.count })),
          casesByPriority: casesByPriority.map(item => ({ name: item._id, value: item.count })),
          firTrend: firsLast7Days.map(item => ({ date: item._id, count: item.count }))
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while aggregating statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  getDashboardStats
};
