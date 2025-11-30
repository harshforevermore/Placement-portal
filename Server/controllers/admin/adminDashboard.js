// controllers/admin/adminDashboard.js
import Institution from '../../models/institution/institution.js';
import Student from '../../models/student/student.js';
import Admin from '../../models/admin/admin.js';

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    // Get total counts
    const totalInstitutions = await Institution.countDocuments();
    const totalStudents = await Student.countDocuments();
    const pendingApprovals = await Institution.countDocuments({ status: 'pending' });
    
    // Get active users (students + institutions that are approved)
    const activeStudents = await Student.countDocuments({ isVerified: true });
    const activeInstitutions = await Institution.countDocuments({ status: 'approved' });
    const activeUsers = activeStudents + activeInstitutions;

    // Get growth percentages (compared to last month)
    const lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);

    const lastMonthInstitutions = await Institution.countDocuments({
      createdAt: { $lt: lastMonthDate }
    });
    const institutionGrowth = lastMonthInstitutions > 0 
      ? Math.round(((totalInstitutions - lastMonthInstitutions) / lastMonthInstitutions) * 100)
      : 0;

    const lastMonthStudents = await Student.countDocuments({
      createdAt: { $lt: lastMonthDate }
    });
    const studentGrowth = lastMonthStudents > 0
      ? Math.round(((totalStudents - lastMonthStudents) / lastMonthStudents) * 100)
      : 0;

    // Get last week's active users
    const lastWeekDate = new Date();
    lastWeekDate.setDate(lastWeekDate.getDate() - 7);
    const lastWeekActive = await Student.countDocuments({
      isVerified: true,
      createdAt: { $lt: lastWeekDate }
    }) + await Institution.countDocuments({
      status: 'approved',
      createdAt: { $lt: lastWeekDate }
    });
    
    const userGrowth = lastWeekActive > 0
      ? Math.round(((activeUsers - lastWeekActive) / lastWeekActive) * 100)
      : 0;

    res.json({
      success: true,
      data: {
        totalInstitutions,
        totalStudents,
        pendingApprovals,
        activeUsers,
        growth: {
          institutions: institutionGrowth,
          students: studentGrowth,
          users: userGrowth
        }
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
};

// Get recent institutions
export const getRecentInstitutions = async (req, res) => {
  try {
    const { limit = 10, status } = req.query;

    const query = status ? { status } : {};

    const institutions = await Institution.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('institutionName address.city address.state status createdAt institutionType email');

    const formattedInstitutions = institutions.map(inst => ({
      id: inst._id,
      name: inst.institutionName,
      location: `${inst.address.city}, ${inst.address.state}`,
      status: inst.status,
      date: inst.createdAt,
      type: inst.institutionType,
      email: inst.email
    }));

    res.json({
      success: true,
      data: formattedInstitutions
    });

  } catch (error) {
    console.error('Recent institutions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent institutions'
    });
  }
};

// Get all institutions with filters and pagination
export const getAllInstitutions = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    
    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { institutionName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    // Get institutions
    const institutions = await Institution.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-password');

    // Get total count for pagination
    const totalCount = await Institution.countDocuments(query);

    res.json({
      success: true,
      data: {
        institutions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalCount,
          hasMore: skip + institutions.length < totalCount
        }
      }
    });

  } catch (error) {
    console.error('Get all institutions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch institutions'
    });
  }
};

// Get institution details
export const getInstitutionDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const institution = await Institution.findById(id).select('-password');

    if (!institution) {
      return res.status(404).json({
        success: false,
        message: 'Institution not found'
      });
    }

    // Get student count for this institution
    const studentCount = await Student.countDocuments({ 
      institutionId: institution._id 
    });

    res.json({
      success: true,
      data: {
        ...institution.toObject(),
        studentCount
      }
    });

  } catch (error) {
    console.error('Get institution details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch institution details'
    });
  }
};

// Approve institution
export const approveInstitution = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const adminId = req.user.id;

    const institution = await Institution.findById(id);

    if (!institution) {
      return res.status(404).json({
        success: false,
        message: 'Institution not found'
      });
    }

    if (institution.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Institution is already approved'
      });
    }

    // Update institution status
    institution.status = 'approved';
    institution.approvalDetails = {
      approvedBy: adminId,
      approvedAt: new Date(),
      notes: notes || ''
    };

    await institution.save();

    // TODO: Send approval email to institution

    res.json({
      success: true,
      message: 'Institution approved successfully',
      data: institution
    });

  } catch (error) {
    console.error('Approve institution error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve institution'
    });
  }
};

// Reject institution
export const rejectInstitution = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, notes } = req.body;
    const adminId = req.user.id;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const institution = await Institution.findById(id);

    if (!institution) {
      return res.status(404).json({
        success: false,
        message: 'Institution not found'
      });
    }

    // Update institution status
    institution.status = 'rejected';
    institution.approvalDetails = {
      rejectedBy: adminId,
      rejectedAt: new Date(),
      rejectionReason: reason,
      notes: notes || ''
    };

    await institution.save();

    // TODO: Send rejection email to institution

    res.json({
      success: true,
      message: 'Institution rejected successfully',
      data: institution
    });

  } catch (error) {
    console.error('Reject institution error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject institution'
    });
  }
};

// Suspend institution
export const suspendInstitution = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;

    const institution = await Institution.findById(id);

    if (!institution) {
      return res.status(404).json({
        success: false,
        message: 'Institution not found'
      });
    }

    institution.status = 'suspended';
    institution.approvalDetails = {
      ...institution.approvalDetails,
      suspendedBy: adminId,
      suspendedAt: new Date(),
      suspensionReason: reason
    };

    await institution.save();

    res.json({
      success: true,
      message: 'Institution suspended successfully',
      data: institution
    });

  } catch (error) {
    console.error('Suspend institution error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to suspend institution'
    });
  }
};

// Get system activity logs
export const getActivityLogs = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    // Get recent registrations
    const recentInstitutions = await Institution.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) / 2)
      .select('institutionName createdAt status');

    const recentStudents = await Student.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) / 2)
      .select('name createdAt')
      .populate('institutionId', 'institutionName');

    // Combine and format activities
    const activities = [
      ...recentInstitutions.map(inst => ({
        type: 'institution_registration',
        name: inst.institutionName,
        status: inst.status,
        timestamp: inst.createdAt
      })),
      ...recentStudents.map(student => ({
        type: 'student_registration',
        name: student.name,
        institution: student.institutionId?.institutionName,
        timestamp: student.createdAt
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      success: true,
      data: activities.slice(0, parseInt(limit))
    });

  } catch (error) {
    console.error('Activity logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity logs'
    });
  }
};