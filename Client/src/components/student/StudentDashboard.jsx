import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Briefcase, 
  Calendar, 
  FileText, 
  TrendingUp, 
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Eye,
  Bell,
  Search,
  Filter,
  MapPin,
  DollarSign,
  Loader2,
  Settings,
  LogOut,
  ChevronDown
} from 'lucide-react';
import useStudentDashboard from '../../hooks/useStudentDashboard';
import { useAuth } from '../../context/AuthContext';

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  // Fetch data using custom hook
  const {
    studentInfo,
    stats,
    recentApplications,
    upcomingEvents,
    availableJobs,
    loading,
    error,
    refresh
  } = useStudentDashboard();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'text-green-400 bg-green-900/30';
      case 'pending': return 'text-yellow-400 bg-yellow-900/30';
      case 'rejected': return 'text-red-400 bg-red-900/30';
      case 'interview': return 'text-blue-400 bg-blue-900/30';
      default: return 'text-slate-400 bg-slate-900/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted': return <CheckCircle size={16} />;
      case 'pending': return <Clock size={16} />;
      case 'rejected': return <XCircle size={16} />;
      case 'interview': return <AlertCircle size={16} />;
      default: return null;
    }
  };

  // Loading state
  if (loading && !studentInfo) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-green-500 mx-auto mb-4" size={48} />
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !studentInfo) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <p className="text-slate-400 mb-4">{error}</p>
          <button 
            onClick={refresh}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
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
              <div className="bg-green-600 p-2 rounded-lg">
                <User className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  {studentInfo?.name || 'Loading...'}
                </h1>
                <p className="text-slate-400 text-sm">
                  {studentInfo?.rollNumber} • {studentInfo?.branch}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  className="bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-64"
                />
              </div>
              <button className="relative p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors duration-200">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">0</span>
              </button>
              
              {/* Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors duration-200"
                >
                  <User size={20} />
                  <ChevronDown size={16} className={`transform transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showProfileMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowProfileMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20">
                      <div className="p-3 border-b border-slate-700">
                        <p className="text-sm font-medium text-white truncate">{studentInfo?.name}</p>
                        <p className="text-xs text-slate-400 truncate">{studentInfo?.email}</p>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            navigate('/student/settings');
                          }}
                          className="w-full flex items-center px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors duration-200"
                        >
                          <Settings size={16} className="mr-3" />
                          Settings
                        </button>
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center px-4 py-2 text-sm text-red-400 hover:bg-slate-700 transition-colors duration-200"
                        >
                          <LogOut size={16} className="mr-3" />
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Completion Alert */}
        {studentInfo && studentInfo.profileComplete < 100 && (
          <div className="bg-yellow-900/30 border border-yellow-700 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="text-yellow-400 mr-3" size={20} />
              <div>
                <p className="text-yellow-400 font-medium">
                  Complete your profile ({studentInfo.profileComplete}%)
                </p>
                <p className="text-yellow-300 text-sm">
                  Complete your profile to get better job recommendations
                </p>
              </div>
            </div>
            <button 
              onClick={() => setActiveTab('profile')}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              Complete Now
            </button>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Total Applications</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {loading ? '...' : stats?.totalApplications || 0}
                </p>
              </div>
              <div className="bg-green-600 p-3 rounded-lg">
                <FileText className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {loading ? '...' : stats?.pendingApplications || 0}
                </p>
              </div>
              <div className="bg-yellow-600 p-3 rounded-lg">
                <Clock className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Accepted</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {loading ? '...' : stats?.acceptedApplications || 0}
                </p>
              </div>
              <div className="bg-green-600 p-3 rounded-lg">
                <CheckCircle className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">CGPA</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {loading ? '...' : studentInfo?.cgpa || 'N/A'}
                </p>
              </div>
              <div className="bg-purple-600 p-3 rounded-lg">
                <TrendingUp className="text-white" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-slate-800 p-1 rounded-lg mb-8 w-fit">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'applications', label: 'My Applications' },
            { id: 'jobs', label: 'Available Jobs' },
            { id: 'profile', label: 'Profile' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'bg-green-600 text-white'
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
            {/* Left Column - Upcoming Events */}
            <div className="lg:col-span-1">
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Calendar className="mr-2" size={20} />
                  Upcoming Events
                </h3>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin text-green-500" size={24} />
                  </div>
                ) : upcomingEvents.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-8">
                    No upcoming events
                  </p>
                ) : (
                  <div className="space-y-3">
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className="bg-slate-700 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-white">{event.company}</h4>
                          <span className="text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded-full">
                            {event.type}
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm">
                          {new Date(event.date).toLocaleDateString()} • {event.time}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Student Info */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Academic Info</h3>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin text-green-500" size={24} />
                  </div>
                ) : (
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Institution:</span>
                      <span className="text-white">{studentInfo?.institution}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Semester:</span>
                      <span className="text-white">{studentInfo?.semester}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">CGPA:</span>
                      <span className="text-white">{studentInfo?.cgpa}/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Profile:</span>
                      <span className="text-green-400">
                        {studentInfo?.profileComplete}% Complete
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Recent Applications */}
            <div className="lg:col-span-2">
              <div className="bg-slate-800 border border-slate-700 rounded-xl">
                <div className="p-6 border-b border-slate-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Recent Applications</h3>
                    <button 
                      onClick={() => setActiveTab('applications')}
                      className="text-green-400 hover:text-green-300 text-sm font-medium"
                    >
                      View All
                    </button>
                  </div>
                </div>
                
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-green-500" size={32} />
                  </div>
                ) : recentApplications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Briefcase className="mx-auto text-slate-600 mb-3" size={48} />
                    <p className="text-slate-400">No applications yet</p>
                    <button 
                      onClick={() => setActiveTab('jobs')}
                      className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                    >
                      Browse Jobs
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left p-4 text-slate-400 font-medium">Company</th>
                          <th className="text-left p-4 text-slate-400 font-medium">Position</th>
                          <th className="text-left p-4 text-slate-400 font-medium">Status</th>
                          <th className="text-left p-4 text-slate-400 font-medium">Applied</th>
                          <th className="text-left p-4 text-slate-400 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentApplications.slice(0, 4).map((app) => (
                          <tr key={app.id} className="border-b border-slate-700 hover:bg-slate-750">
                            <td className="p-4">
                              <div className="flex items-center">
                                <div className="bg-green-600 p-2 rounded-lg mr-3">
                                  <Building2 className="text-white" size={16} />
                                </div>
                                <div>
                                  <span className="text-white font-medium">{app.company}</span>
                                  <p className="text-slate-400 text-xs">
                                    {app.salary} • {app.location}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-slate-300">{app.position}</td>
                            <td className="p-4">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                                {getStatusIcon(app.status)}
                                <span className="ml-1 capitalize">{app.status}</span>
                              </span>
                            </td>
                            <td className="p-4 text-slate-400 text-sm">
                              {new Date(app.appliedDate).toLocaleDateString()}
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
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">My Applications</h2>
                <div className="flex items-center space-x-2">
                  <button className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors duration-200">
                    <Filter size={18} />
                  </button>
                </div>
              </div>
            </div>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-green-500" size={32} />
              </div>
            ) : (
              <div className="p-6">
                <p className="text-slate-400">
                  {recentApplications.length === 0 
                    ? 'No applications yet. Start applying to jobs!' 
                    : 'Detailed view of all your job applications with status tracking and interview schedules.'}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'jobs' && (
          <div>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-green-500" size={32} />
              </div>
            ) : availableJobs.length === 0 ? (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
                <Briefcase className="mx-auto text-slate-600 mb-4" size={64} />
                <h3 className="text-xl font-semibold text-white mb-2">No Jobs Available</h3>
                <p className="text-slate-400">
                  Check back later for new job postings from companies
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {availableJobs.map((job) => (
                  <div key={job.id} className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="bg-green-600 p-3 rounded-lg">
                          <Building2 className="text-white" size={24} />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white">{job.position}</h3>
                          <p className="text-green-400 font-medium">{job.company}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-slate-400">
                            <span className="flex items-center">
                              <DollarSign size={16} className="mr-1" />
                              {job.salary}
                            </span>
                            <span className="flex items-center">
                              <MapPin size={16} className="mr-1" />
                              {job.location}
                            </span>
                            <span className="flex items-center">
                              <Calendar size={16} className="mr-1" />
                              Deadline: {new Date(job.deadline).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-slate-300 mt-2">
                            <span className="text-slate-400">Requirements:</span> {job.requirements}
                          </p>
                        </div>
                      </div>
                      <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors duration-200">
                        Apply Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Profile Information</h2>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors duration-200">
                <Settings size={16} className="mr-2" />
                Edit Profile
              </button>
            </div>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-green-500" size={32} />
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-slate-400 mb-4">
                  Manage your personal information, academic details, skills, and preferences.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400 text-sm">Name</p>
                    <p className="text-white font-medium">{studentInfo?.name}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Roll Number</p>
                    <p className="text-white font-medium">{studentInfo?.rollNumber}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Branch</p>
                    <p className="text-white font-medium">{studentInfo?.branch}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">CGPA</p>
                    <p className="text-white font-medium">{studentInfo?.cgpa}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;