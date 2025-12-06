// Client/src/hooks/useStudentDashboard.js
import { useState, useEffect, useCallback } from 'react';
import {
  getStudentDashboardStats,
  getRecentApplications,
  getUpcomingEvents,
  getAvailableJobs
} from '../service/studentService';

export const useStudentDashboard = () => {
  const [studentInfo, setStudentInfo] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentApplications, setRecentApplications] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [availableJobs, setAvailableJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsResult, applicationsResult, eventsResult, jobsResult] = await Promise.all([
        getStudentDashboardStats(),
        getRecentApplications(5),
        getUpcomingEvents(5),
        getAvailableJobs(10)
      ]);

      if (statsResult.success) {
        setStudentInfo(statsResult.data.studentInfo);
        setStats(statsResult.data.stats);
      }

      if (applicationsResult.success) {
        setRecentApplications(applicationsResult.data);
      }

      if (eventsResult.success) {
        setUpcomingEvents(eventsResult.data);
      }

      if (jobsResult.success) {
        setAvailableJobs(jobsResult.data);
      }

    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    studentInfo,
    stats,
    recentApplications,
    upcomingEvents,
    availableJobs,
    loading,
    error,
    refresh: fetchDashboardData
  };
};

export default useStudentDashboard;