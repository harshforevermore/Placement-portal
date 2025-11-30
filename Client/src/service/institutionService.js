import axiosClient from '../API/axiosClient';

export const getInstitutionDashboardStats = async () => {
  try {
    const response = await axiosClient.get('/api/institution/dashboard/stats');
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch stats'
    };
  }
};

export const getRecentPlacements = async (limit = 10) => {
  try {
    const response = await axiosClient.get(`/api/institution/dashboard/recent-placements?limit=${limit}`);
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch placements'
    };
  }
};

export const getActiveDrives = async (limit = 10) => {
  try {
    const response = await axiosClient.get(`/api/institution/dashboard/active-drives?limit=${limit}`);
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch drives'
    };
  }
};

export const getUpcomingEvents = async (limit = 10) => {
  try {
    const response = await axiosClient.get(`/api/institution/dashboard/upcoming-events?limit=${limit}`);
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch events'
    };
  }
};

export const getDepartmentStats = async () => {
  try {
    const response = await axiosClient.get('/api/institution/dashboard/department-stats');
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch department stats'
    };
  }
};