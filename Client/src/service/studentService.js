// Client/src/services/studentService.js
import axiosClient from '../API/axiosClient';

/**
 * Get dashboard statistics and student info
 */
export const getStudentDashboardStats = async () => {
  try {
    const response = await axiosClient.get('/api/student/dashboard/stats');
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch stats'
    };
  }
};

/**
 * Get recent applications
 */
export const getRecentApplications = async (limit = 5) => {
  try {
    const response = await axiosClient.get(`/api/student/dashboard/recent-applications?limit=${limit}`);
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch applications'
    };
  }
};

/**
 * Get upcoming events/interviews
 */
export const getUpcomingEvents = async (limit = 5) => {
  try {
    const response = await axiosClient.get(`/api/student/dashboard/upcoming-events?limit=${limit}`);
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch events'
    };
  }
};

/**
 * Get available job postings
 */
export const getAvailableJobs = async (limit = 10) => {
  try {
    const response = await axiosClient.get(`/api/student/dashboard/available-jobs?limit=${limit}`);
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch jobs'
    };
  }
};

/**
 * Get student profile
 */
export const getStudentProfile = async () => {
  try {
    const response = await axiosClient.get('/api/student/profile');
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch profile'
    };
  }
};

/**
 * Update student profile
 */
export const updateStudentProfile = async (profileData) => {
  try {
    const response = await axiosClient.put('/api/student/profile', profileData);
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update profile'
    };
  }
};