import Institution from '../../models/institution/institution.js';
import Student from '../../models/student/student.js';

export const getDashboardStats = async (req, res) => {
    console.log("getDashboardStats");
  try {
    const email = req.user.email;

    const student = await Student.findOne({email});
    console.log("student: ", student);

    const institution = await Institution.findOne({institutionId: student.institutionId});

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // TODO: When Application model is created, fetch real application stats
    // For now, returning mock data structure
    const stats = {
      totalApplications: 0,
      pendingApplications: 0,
      acceptedApplications: 0,
      rejectedApplications: 0,
      interviewScheduled: 0
    };

    res.status(200).json({
      success: true,
      data: {
        studentInfo: {
          name: `${student.firstName} ${student.lastName}`,
          rollNumber: student.academicInfo.rollNumber,
          institution: institution.institutionName,
          branch: student.academicInfo.branch,
          cgpa: student.academicInfo.cgpa,
          semester: student.academicInfo.semester,
        },
        stats
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
};

/**
 * Get student's recent applications
 * @route GET /api/student/dashboard/recent-applications
 * @access Private (Student only)
 */
export const getRecentApplications = async (req, res) => {
  try {
    const email = req.user.email;
    const limit = parseInt(req.query.limit) || 5;

    // TODO: When Application model is created, fetch real applications
    // For now, returning empty array
    const applications = [];

    res.status(200).json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('Error fetching recent applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent applications',
      error: error.message
    });
  }
};

/**
 * Get upcoming events/interviews for student
 * @route GET /api/student/dashboard/upcoming-events
 * @access Private (Student only)
 */
export const getUpcomingEvents = async (req, res) => {
  try {
    const email = req.user.email;
    const limit = parseInt(req.query.limit) || 5;

    // TODO: When Interview/Event model is created, fetch real events
    // For now, returning empty array
    const events = [];

    res.status(200).json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming events',
      error: error.message
    });
  }
};

/**
 * Get available job postings for student
 * @route GET /api/student/dashboard/available-jobs
 * @access Private (Student only)
 */
export const getAvailableJobs = async (req, res) => {
  try {
    const email = req.user.email;
    const limit = parseInt(req.query.limit) || 10;

    // Get student's institution to filter relevant jobs
    const student = await Student.findOne({email}).select('institutionId');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // TODO: When PlacementDrive model is created, fetch real job postings
    // Filter by student's institution and active status
    // For now, returning empty array
    const jobs = [];

    res.status(200).json({
      success: true,
      data: jobs
    });
  } catch (error) {
    console.error('Error fetching available jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available jobs',
      error: error.message
    });
  }
};

/**
 * Get student's full profile
 * @route GET /api/student/profile
 * @access Private (Student only)
 */
export const getStudentProfile = async (req, res) => {
  try {
    const email = req.user.email;

    const student = await Student.find({email}).select('-password');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Error fetching student profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student profile',
      error: error.message
    });
  }
};

/**
 * Update student profile
 * @route PUT /api/student/profile
 * @access Private (Student only)
 */
export const updateStudentProfile = async (req, res) => {
  try {
    const studentId = req.user.id;
    const updates = req.body;

    // Remove fields that shouldn't be updated via this endpoint
    delete updates.email;
    delete updates.password;
    delete updates.institution;
    delete updates.rollNumber;
    delete updates.emailVerification;

    const student = await Student.findByIdAndUpdate(
      studentId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: student
    });
  } catch (error) {
    console.error('Error updating student profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update student profile',
      error: error.message
    });
  }
};