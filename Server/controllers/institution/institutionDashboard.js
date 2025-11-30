// controllers/institution/institutionDashboard.js
import Institution from '../../models/institution/institution.js';
import Student from '../../models/student/student.js';
import Placement from '../../models/placement.js';
import PlacementDrive from '../../models/placementDrive.js';

// Get institution dashboard statistics
export const getInstitutionDashboardStats = async (req, res) => {
  try {
    const institutionId = req.user.id;

    // Get institution details
    const institution = await Institution.findOne(institutionId)
      .select('institutionName address establishedYear');

    if (!institution) {
      return res.status(404).json({
        success: false,
        message: 'Institution not found'
      });
    }

    // Get student counts
    const totalStudents = await Student.countDocuments({ 
      institutionId: institutionId 
    });

    const placedStudents = await Student.countDocuments({ 
      institutionId: institutionId,
      placementStatus: 'placed'
    });

    // Get active drives count
    const activeDrives = await PlacementDrive.countDocuments({
      institutionId: institutionId,
      status: 'active',
      deadline: { $gte: new Date() }
    });

    // Calculate average package
    const placements = await Placement.find({
      institutionId: institutionId,
      status: 'accepted'
    }).select('package');

    const avgPackage = placements.length > 0
      ? placements.reduce((sum, p) => sum + (p.package || 0), 0) / placements.length
      : 0;

    // Calculate growth (compared to last year)
    const lastYearDate = new Date();
    lastYearDate.setFullYear(lastYearDate.getFullYear() - 1);

    const lastYearStudents = await Student.countDocuments({
      institutionId: institutionId,
      createdAt: { $lt: lastYearDate }
    });

    const studentGrowth = lastYearStudents > 0
      ? Math.round(((totalStudents - lastYearStudents) / lastYearStudents) * 100)
      : 0;

    // Calculate placement rate
    const placementRate = totalStudents > 0
      ? ((placedStudents / totalStudents) * 100).toFixed(1)
      : 0;

    res.json({
      success: true,
      data: {
        institutionInfo: {
          name: institution.institutionName,
          shortName: institution.institutionName.split(' ').slice(0, 2).join(' '),
          location: `${institution.address.city}, ${institution.address.state}`,
          established: institution.establishedYear?.toString() || 'N/A',
          totalStudents,
          placementRate: parseFloat(placementRate)
        },
        stats: {
          totalStudents,
          placedStudents,
          activeDrives,
          avgPackage: avgPackage.toFixed(1)
        },
        growth: {
          students: studentGrowth
        }
      }
    });

  } catch (error) {
    console.error('Institution dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
};

// Get recent placements
export const getRecentPlacements = async (req, res) => {
  try {
    const institutionId = req.user.id;
    const { limit = 10 } = req.query;

    const placements = await Placement.find({
      institutionId: institutionId,
      status: 'accepted'
    })
      .sort({ placedDate: -1 })
      .limit(parseInt(limit))
      .populate('studentId', 'name rollNumber branch')
      .select('company position package placedDate');

    const formattedPlacements = placements.map(p => ({
      id: p._id,
      studentName: p.studentId?.name || 'Unknown',
      rollNumber: p.studentId?.rollNumber || 'N/A',
      branch: p.studentId?.branch || 'N/A',
      company: p.company,
      position: p.position,
      package: `₹${p.package} LPA`,
      placedDate: p.placedDate
    }));

    res.json({
      success: true,
      data: formattedPlacements
    });

  } catch (error) {
    console.error('Recent placements error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent placements'
    });
  }
};

// Get active placement drives
export const getActiveDrives = async (req, res) => {
  try {
    const institutionId = req.user.id;
    const { limit = 10 } = req.query;

    const drives = await PlacementDrive.find({
      institutionId: institutionId,
      status: { $in: ['active', 'closing'] },
      deadline: { $gte: new Date() }
    })
      .sort({ deadline: 1 })
      .limit(parseInt(limit))
      .select('company position package eligibility deadline applicants status');

    const formattedDrives = drives.map(d => ({
      id: d._id,
      company: d.company,
      position: d.position,
      package: `₹${d.package} LPA`,
      eligibility: d.eligibility.join(', '),
      deadline: d.deadline,
      applicants: d.applicants || 0,
      status: d.status
    }));

    res.json({
      success: true,
      data: formattedDrives
    });

  } catch (error) {
    console.error('Active drives error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active drives'
    });
  }
};

// Get upcoming events
export const getUpcomingEvents = async (req, res) => {
  try {
    const institutionId = req.user.id;
    const { limit = 10 } = req.query;

    const events = await PlacementDrive.find({
      institutionId: institutionId,
      eventDate: { $gte: new Date() }
    })
      .sort({ eventDate: 1 })
      .limit(parseInt(limit))
      .select('company eventType eventDate eventTime');

    const formattedEvents = events.map(e => ({
      id: e._id,
      company: e.company,
      type: e.eventType,
      date: e.eventDate,
      time: e.eventTime
    }));

    res.json({
      success: true,
      data: formattedEvents
    });

  } catch (error) {
    console.error('Upcoming events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming events'
    });
  }
};

// Get department statistics
export const getDepartmentStats = async (req, res) => {
  try {
    const institutionId = req.user.id;

    // Get all students grouped by department/branch
    const students = await Student.find({ institutionId })
      .select('branch placementStatus');

    // Group by branch and calculate stats
    const branchMap = {};
    
    students.forEach(student => {
      const branch = student.branch || 'Other';
      if (!branchMap[branch]) {
        branchMap[branch] = { total: 0, placed: 0 };
      }
      branchMap[branch].total++;
      if (student.placementStatus === 'placed') {
        branchMap[branch].placed++;
      }
    });

    // Format as array
    const departmentStats = Object.entries(branchMap).map(([department, data]) => ({
      department,
      students: data.total,
      placed: data.placed,
      percentage: data.total > 0 ? ((data.placed / data.total) * 100).toFixed(1) : 0
    }))
    .sort((a, b) => b.percentage - a.percentage); // Sort by placement percentage

    res.json({
      success: true,
      data: departmentStats
    });

  } catch (error) {
    console.error('Department stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch department statistics'
    });
  }
};

// Get institution profile
export const getInstitutionProfile = async (req, res) => {
  try {
    const institutionId = req.user.id;

    const institution = await Institution.findById(institutionId)
      .select('-password -verificationToken -verificationExpires');

    if (!institution) {
      return res.status(404).json({
        success: false,
        message: 'Institution not found'
      });
    }

    res.json({
      success: true,
      data: institution
    });

  } catch (error) {
    console.error('Get institution profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch institution profile'
    });
  }
};