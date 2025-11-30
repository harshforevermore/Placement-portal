// pages/institution/InstitutionDashboard.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  Briefcase, 
  Calendar, 
  TrendingUp, 
  Award,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Eye,
  Download,
  MapPin,
  DollarSign,
  GraduationCap,
  Target,
  BarChart3,
  MoreVertical,
  Loader2,
  User,
  Settings,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useInstitutionDashboard } from '../../hooks/useInstitutionDashboard';
import { useAuth } from '../../context/AuthContext';

const InstitutionDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const {
    institutionInfo,
    stats,
    recentPlacements,
    activeDrives,
    upcomingEvents,
    departmentStats,
    loading,
    error
  } = useInstitutionDashboard();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-900/30';
      case 'closing': return 'text-yellow-400 bg-yellow-900/30';
      case 'closed': return 'text-red-400 bg-red-900/30';
      default: return 'text-slate-400 bg-slate-900/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle size={16} />;
      case 'closing': return <Clock size={16} />;
      case 'closed': return <XCircle size={16} />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-purple-600 p-2 rounded-lg">
                <Building2 className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{institutionInfo?.shortName || 'Loading...'}</h1>
                <p className="text-slate-400 text-sm">Placement Admin Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Search - Commented for now */}
              {/* <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search students, companies..."
                  className="bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-64"
                />
              </div> */}
              
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center">
                <Plus size={18} className="mr-2" />
                New Drive
              </button>

              {/* Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg transition-colors duration-200"
                >
                  <div className="bg-purple-600 p-1.5 rounded-full">
                    <User size={16} className="text-white" />
                  </div>
                  <ChevronDown size={16} className="text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-2 z-50">
                    <div className="px-4 py-3 border-b border-slate-700">
                      <p className="text-sm font-medium text-white truncate">{institutionInfo?.name}</p>
                      <p className="text-xs text-slate-400 truncate">{institutionInfo?.location}</p>
                    </div>
                    
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        // navigate('/institution/settings');
                      }}
                      className="w-full px-4 py-2 text-left text-slate-300 hover:bg-slate-700 transition-colors flex items-center space-x-3"
                    >
                      <Settings size={16} />
                      <span>Settings</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        // navigate('/institution/profile');
                      }}
                      className="w-full px-4 py-2 text-left text-slate-300 hover:bg-slate-700 transition-colors flex items-center space-x-3"
                    >
                      <User size={16} />
                      <span>Profile</span>
                    </button>

                    <div className="border-t border-slate-700 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-red-400 hover:bg-slate-700 transition-colors flex items-center space-x-3"
                      >
                        <LogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Close dropdown when clicking outside */}
      {showProfileMenu && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setShowProfileMenu(false)}
        ></div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Institution Info Banner */}
        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-slate-700 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{institutionInfo?.name || 'Loading...'}</h2>
              <div className="flex items-center space-x-6 text-slate-300">
                <span className="flex items-center">
                  <MapPin size={16} className="mr-2" />
                  {institutionInfo?.location || 'N/A'}
                </span>
                <span className="flex items-center">
                  <Calendar size={16} className="mr-2" />
                  Est. {institutionInfo?.established || 'N/A'}
                </span>
                <span className="flex items-center">
                  <Target size={16} className="mr-2" />
                  {institutionInfo?.placementRate || 0}% Placement Rate
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-white">{stats?.placedStudents || 0}</p>
              <p className="text-slate-400">Students Placed</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:bg-slate-750 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Total Students</p>
                <p className="text-3xl font-bold text-white mt-1">{stats?.totalStudents || 0}</p>
              </div>
              <div className="bg-blue-600 p-3 rounded-lg">
                <Users className="text-white" size={24} />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <TrendingUp className="text-green-400 mr-1" size={16} />
              <span className="text-green-400">Active</span>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:bg-slate-750 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Students Placed</p>
                <p className="text-3xl font-bold text-white mt-1">{stats?.placedStudents || 0}</p>
              </div>
              <div className="bg-green-600 p-3 rounded-lg">
                <Award className="text-white" size={24} />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-green-400">
                {stats?.totalStudents > 0 
                  ? ((stats.placedStudents / stats.totalStudents) * 100).toFixed(1)
                  : 0}%
              </span>
              <span className="text-slate-400 ml-1">placement rate</span>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:bg-slate-750 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Active Drives</p>
                <p className="text-3xl font-bold text-white mt-1">{stats?.activeDrives || 0}</p>
              </div>
              <div className="bg-purple-600 p-3 rounded-lg">
                <Briefcase className="text-white" size={24} />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <Clock className="text-yellow-400 mr-1" size={16} />
              <span className="text-yellow-400">In progress</span>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:bg-slate-750 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Avg Package</p>
                <p className="text-3xl font-bold text-white mt-1">₹{stats?.avgPackage || 0}L</p>
              </div>
              <div className="bg-yellow-600 p-3 rounded-lg">
                <DollarSign className="text-white" size={24} />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <TrendingUp className="text-green-400 mr-1" size={16} />
              <span className="text-green-400">This year</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-slate-800 p-1 rounded-lg mb-8 w-fit">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'drives', label: 'Placement Drives' },
            { id: 'students', label: 'Student Management' },
            { id: 'analytics', label: 'Analytics' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Recent Placements */}
            <div className="lg:col-span-2">
              <div className="bg-slate-800 border border-slate-700 rounded-xl mb-6">
                <div className="p-6 border-b border-slate-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Recent Placements</h3>
                    <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">View All</button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left p-4 text-slate-400 font-medium">Student</th>
                        <th className="text-left p-4 text-slate-400 font-medium">Company</th>
                        <th className="text-left p-4 text-slate-400 font-medium">Package</th>
                        <th className="text-left p-4 text-slate-400 font-medium">Date</th>
                        <th className="text-left p-4 text-slate-400 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentPlacements.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="p-8 text-center text-slate-400">
                            No placements yet
                          </td>
                        </tr>
                      ) : (
                        recentPlacements.map((placement) => (
                          <tr key={placement.id} className="border-b border-slate-700 hover:bg-slate-750">
                            <td className="p-4">
                              <div className="flex items-center">
                                <div className="bg-blue-600 p-2 rounded-lg mr-3">
                                  <GraduationCap className="text-white" size={16} />
                                </div>
                                <div>
                                  <span className="text-white font-medium">{placement.studentName}</span>
                                  <p className="text-slate-400 text-xs">{placement.rollNumber} • {placement.branch}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div>
                                <span className="text-white font-medium">{placement.company}</span>
                                <p className="text-slate-400 text-xs">{placement.position}</p>
                              </div>
                            </td>
                            <td className="p-4 text-green-400 font-medium">{placement.package}</td>
                            <td className="p-4 text-slate-400 text-sm">
                              {new Date(placement.placedDate).toLocaleDateString()}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                <button className="p-1.5 hover:bg-slate-700 rounded-md transition-colors duration-200">
                                  <Eye size={14} className="text-slate-400" />
                                </button>
                                <button className="p-1.5 hover:bg-slate-700 rounded-md transition-colors duration-200">
                                  <Download size={14} className="text-slate-400" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Active Drives */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl">
                <div className="p-6 border-b border-slate-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Active Placement Drives</h3>
                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors duration-200">
                      Create New
                    </button>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {activeDrives.length === 0 ? (
                    <p className="text-center text-slate-400 py-8">No active drives</p>
                  ) : (
                    activeDrives.map((drive) => (
                      <div key={drive.id} className="bg-slate-700 p-4 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-medium text-white">{drive.company}</h4>
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(drive.status)}`}>
                                {getStatusIcon(drive.status)}
                                <span className="ml-1 capitalize">{drive.status}</span>
                              </span>
                            </div>
                            <p className="text-slate-300 mb-1">{drive.position}</p>
                            <div className="flex items-center space-x-4 text-sm text-slate-400">
                              <span>{drive.package}</span>
                              <span>•</span>
                              <span>Eligible: {drive.eligibility}</span>
                              <span>•</span>
                              <span>{drive.applicants} applicants</span>
                            </div>
                            <p className="text-sm text-slate-400 mt-1">
                              Deadline: {new Date(drive.deadline).toLocaleDateString()}
                            </p>
                          </div>
                          <button className="p-2 hover:bg-slate-600 rounded-lg transition-colors duration-200">
                            <MoreVertical size={16} className="text-slate-400" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Upcoming Events & Department Stats */}
            <div className="lg:col-span-1">
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Calendar className="mr-2" size={20} />
                  Upcoming Events
                </h3>
                <div className="space-y-3">
                  {upcomingEvents.length === 0 ? (
                    <p className="text-center text-slate-400 py-4">No upcoming events</p>
                  ) : (
                    upcomingEvents.map((event) => (
                      <div key={event.id} className="bg-slate-700 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-white">{event.company}</h4>
                          <span className="text-xs text-purple-400 bg-purple-900/30 px-2 py-1 rounded-full">
                            {event.type}
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm">
                          {new Date(event.date).toLocaleDateString()} • {event.time}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Department Performance */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <BarChart3 className="mr-2" size={20} />
                  Department Performance
                </h3>
                <div className="space-y-3">
                  {departmentStats.length === 0 ? (
                    <p className="text-center text-slate-400 py-4">No data available</p>
                  ) : (
                    departmentStats.map((dept, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="text-white text-sm font-medium">{dept.department}</p>
                          <p className="text-slate-400 text-xs">{dept.placed}/{dept.students} placed</p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 font-medium">{dept.percentage}%</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'drives' && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Placement Drive Management</h2>
            <p className="text-slate-400">Manage all placement drives, schedule interviews, and track company requirements.</p>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Student Management</h2>
            <p className="text-slate-400">View and manage all students, their profiles, and placement status.</p>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Placement Analytics</h2>
            <p className="text-slate-400">Detailed analytics on placement trends, company statistics, and performance metrics.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstitutionDashboard;