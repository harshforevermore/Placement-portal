import { useState } from 'react';
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
  Edit,
  Bell,
  Search,
  Filter,
  MapPin,
  DollarSign
} from 'lucide-react';

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock student data
  const studentInfo = {
    name: 'Rahul Kumar',
    rollNumber: 'CS21B1001',
    institution: 'IIT Delhi',
    branch: 'Computer Science',
    cgpa: 8.7,
    semester: '6th',
    profileComplete: 85
  };

  const stats = {
    totalApplications: 12,
    pendingApplications: 4,
    acceptedApplications: 2,
    rejectedApplications: 6
  };

  const upcomingEvents = [
    { id: 1, company: 'Google', type: 'Technical Round', date: '2025-01-10', time: '10:00 AM' },
    { id: 2, company: 'Microsoft', type: 'HR Round', date: '2025-01-12', time: '2:00 PM' },
    { id: 3, company: 'Amazon', type: 'Final Round', date: '2025-01-15', time: '11:30 AM' }
  ];

  const recentApplications = [
    { 
      id: 1, 
      company: 'Google', 
      position: 'Software Engineer', 
      status: 'interview', 
      appliedDate: '2025-01-05',
      salary: '₹25 LPA',
      location: 'Bangalore'
    },
    { 
      id: 2, 
      company: 'Microsoft', 
      position: 'SDE Intern', 
      status: 'accepted', 
      appliedDate: '2025-01-03',
      salary: '₹15 LPA',
      location: 'Hyderabad'
    },
    { 
      id: 3, 
      company: 'Amazon', 
      position: 'Backend Developer', 
      status: 'pending', 
      appliedDate: '2025-01-02',
      salary: '₹22 LPA',
      location: 'Mumbai'
    },
    { 
      id: 4, 
      company: 'Flipkart', 
      position: 'Full Stack Developer', 
      status: 'rejected', 
      appliedDate: '2024-12-28',
      salary: '₹18 LPA',
      location: 'Bangalore'
    }
  ];

  const availableJobs = [
    { 
      id: 1, 
      company: 'Zomato', 
      position: 'Frontend Developer', 
      salary: '₹12 LPA',
      location: 'Delhi',
      deadline: '2025-01-20',
      requirements: 'React, Node.js, MongoDB'
    },
    { 
      id: 2, 
      company: 'Paytm', 
      position: 'DevOps Engineer', 
      salary: '₹16 LPA',
      location: 'Noida',
      deadline: '2025-01-25',
      requirements: 'AWS, Docker, Kubernetes'
    }
  ];

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

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <User className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{studentInfo.name}</h1>
                <p className="text-slate-400 text-sm">{studentInfo.rollNumber} • {studentInfo.branch}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  className="bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
              <button className="relative p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors duration-200">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Completion Alert */}
        {studentInfo.profileComplete < 100 && (
          <div className="bg-yellow-900/30 border border-yellow-700 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="text-yellow-400 mr-3" size={20} />
              <div>
                <p className="text-yellow-400 font-medium">Complete your profile ({studentInfo.profileComplete}%)</p>
                <p className="text-yellow-300 text-sm">Complete your profile to get better job recommendations</p>
              </div>
            </div>
            <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors duration-200">
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
                <p className="text-3xl font-bold text-white mt-1">{stats.totalApplications}</p>
              </div>
              <div className="bg-blue-600 p-3 rounded-lg">
                <FileText className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.pendingApplications}</p>
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
                <p className="text-3xl font-bold text-white mt-1">{stats.acceptedApplications}</p>
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
                <p className="text-3xl font-bold text-white mt-1">{studentInfo.cgpa}</p>
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
                  ? 'bg-blue-600 text-white'
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
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="bg-slate-700 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-white">{event.company}</h4>
                        <span className="text-xs text-blue-400 bg-blue-900/30 px-2 py-1 rounded-full">
                          {event.type}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm">{new Date(event.date).toLocaleDateString()} • {event.time}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Student Info */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Academic Info</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Institution:</span>
                    <span className="text-white">{studentInfo.institution}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Semester:</span>
                    <span className="text-white">{studentInfo.semester}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">CGPA:</span>
                    <span className="text-white">{studentInfo.cgpa}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Profile:</span>
                    <span className="text-green-400">{studentInfo.profileComplete}% Complete</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Recent Applications */}
            <div className="lg:col-span-2">
              <div className="bg-slate-800 border border-slate-700 rounded-xl">
                <div className="p-6 border-b border-slate-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Recent Applications</h3>
                    <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">View All</button>
                  </div>
                </div>
                
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
                              <div className="bg-blue-600 p-2 rounded-lg mr-3">
                                <Building2 className="text-white" size={16} />
                              </div>
                              <div>
                                <span className="text-white font-medium">{app.company}</span>
                                <p className="text-slate-400 text-xs">{app.salary} • {app.location}</p>
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
                          <td className="p-4 text-slate-400 text-sm">{new Date(app.appliedDate).toLocaleDateString()}</td>
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
            <div className="p-6">
              <p className="text-slate-400">Detailed view of all your job applications with status tracking and interview schedules.</p>
            </div>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="space-y-6">
            {availableJobs.map((job) => (
              <div key={job.id} className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-600 p-3 rounded-lg">
                      <Building2 className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{job.position}</h3>
                      <p className="text-blue-400 font-medium">{job.company}</p>
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
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200">
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Profile Information</h2>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors duration-200">
                <Edit size={16} className="mr-2" />
                Edit Profile
              </button>
            </div>
            <p className="text-slate-400">Manage your personal information, academic details, skills, and preferences.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;