import { useState, useEffect, useCallback } from 'react';
import {
  getInstitutionDashboardStats,
  getRecentPlacements,
  getActiveDrives,
  getUpcomingEvents,
  getDepartmentStats
} from '../service/institutionService';

export const useInstitutionDashboard = () => {
  const [institutionInfo, setInstitutionInfo] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentPlacements, setRecentPlacements] = useState([]);
  const [activeDrives, setActiveDrives] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsResult, placementsResult, drivesResult, eventsResult, deptStatsResult] = await Promise.all([
        getInstitutionDashboardStats(),
        getRecentPlacements(4),
        getActiveDrives(3),
        getUpcomingEvents(3),
        getDepartmentStats()
      ]);

      if (statsResult.success) {
        setInstitutionInfo(statsResult.data.institutionInfo);
        setStats(statsResult.data.stats);
      }

      if (placementsResult.success) {
        setRecentPlacements(placementsResult.data);
      }

      if (drivesResult.success) {
        setActiveDrives(drivesResult.data);
      }

      if (eventsResult.success) {
        setUpcomingEvents(eventsResult.data);
      }

      if (deptStatsResult.success) {
        setDepartmentStats(deptStatsResult.data.slice(0, 5)); // Top 5 departments
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
    institutionInfo,
    stats,
    recentPlacements,
    activeDrives,
    upcomingEvents,
    departmentStats,
    loading,
    error,
    refresh: fetchDashboardData
  };
};