import { useState } from 'react';
import { 
  Users, 
  Building2, 
  UserCheck, 
  AlertTriangle, 
  TrendingUp, 
  Settings,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  const stats = {
    totalInstitutions: 45,
    totalStudents: 12847,
    pendingApprovals: 8,
    activeUsers: 11239
  };

  const recentInstitutions = [
    { id: 1, name: 'IIT Delhi', location: 'New Delhi', status: 'pending', date: '2025-01-05' },
    { id: 2, name: 'BITS Pilani', location: 'Pilani', status: 'approved', date: '2025-01-04' },
    { id: 3, name: 'NIT Warangal', location: 'Warangal', status: 'pending', date: '2025-01-03' },
    { id: 4, name: 'VIT Vellore', location: 'Vellore', status: 'rejected', date: '2025-01-02' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-400 bg-green-900/30';
      case 'pending': return 'text-yellow-400 bg-yellow-900/30';
      case 'rejected': return 'text-red-400 bg-red-900/30';
      default: return 'text-slate-400 bg-slate-900/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle size={16} />;
      case 'pending': return <Clock size={16} />;
      case 'rejected': return <XCircle size={16} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-white">Platform Admin</h1>
              <p className="text-slate-400 text-sm">Manage the entire placement ecosystem</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Search institutions..."
                  className="bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors duration-200">
                <Settings size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:bg-slate-750 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Total Institutions</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.totalInstitutions}</p>
              </div>
              <div className="bg-blue-600 p-3 rounded-lg">
                <Building2 className="text-white" size={24} />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <TrendingUp className="text-green-400 mr-1" size={16} />
              <span className="text-green-400">+12%</span>
              <span className="text-slate-400 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:bg-slate-750 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Total Students</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.totalStudents.toLocaleString()}</p>
              </div>
              <div className="bg-green-600 p-3 rounded-lg">
                <Users className="text-white" size={24} />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <TrendingUp className="text-green-400 mr-1" size={16} />
              <span className="text-green-400">+8%</span>
              <span className="text-slate-400 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:bg-slate-750 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Pending Approvals</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.pendingApprovals}</p>
              </div>
              <div className="bg-yellow-600 p-3 rounded-lg">
                <AlertTriangle className="text-white" size={24} />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <Clock className="text-yellow-400 mr-1" size={16} />
              <span className="text-yellow-400">Requires attention</span>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:bg-slate-750 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Active Users</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.activeUsers.toLocaleString()}</p>
              </div>
              <div className="bg-purple-600 p-3 rounded-lg">
                <UserCheck className="text-white" size={24} />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <TrendingUp className="text-green-400 mr-1" size={16} />
              <span className="text-green-400">+5%</span>
              <span className="text-slate-400 ml-1">from last week</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-slate-800 p-1 rounded-lg mb-8 w-fit">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'institutions', label: 'Institution Approvals' },
            { id: 'users', label: 'User Management' },
            { id: 'settings', label: 'System Settings' }
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
          <div className="space-y-8">
            {/* Recent Institution Applications */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl">
              <div className="p-6 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">Recent Institution Applications</h2>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors duration-200">
                      <Filter size={18} />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left p-4 text-slate-400 font-medium">Institution</th>
                      <th className="text-left p-4 text-slate-400 font-medium">Location</th>
                      <th className="text-left p-4 text-slate-400 font-medium">Status</th>
                      <th className="text-left p-4 text-slate-400 font-medium">Date</th>
                      <th className="text-left p-4 text-slate-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentInstitutions.map((institution) => (
                      <tr key={institution.id} className="border-b border-slate-700 hover:bg-slate-750">
                        <td className="p-4">
                          <div className="flex items-center">
                            <div className="bg-blue-600 p-2 rounded-lg mr-3">
                              <Building2 className="text-white" size={16} />
                            </div>
                            <span className="text-white font-medium">{institution.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-400">{institution.location}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(institution.status)}`}>
                            {getStatusIcon(institution.status)}
                            <span className="ml-1 capitalize">{institution.status}</span>
                          </span>
                        </td>
                        <td className="p-4 text-slate-400">{new Date(institution.date).toLocaleDateString()}</td>
                        <td className="p-4">
                          <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors duration-200">
                            <MoreVertical size={16} className="text-slate-400" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:bg-slate-750 transition-colors duration-200 cursor-pointer">
                <div className="flex items-center mb-4">
                  <div className="bg-green-600 p-3 rounded-lg mr-4">
                    <CheckCircle className="text-white" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Review Approvals</h3>
                </div>
                <p className="text-slate-400 text-sm">Review and approve pending institution applications</p>
                <div className="mt-4">
                  <span className="text-yellow-400 font-medium">{stats.pendingApprovals} pending</span>
                </div>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:bg-slate-750 transition-colors duration-200 cursor-pointer">
                <div className="flex items-center mb-4">
                  <div className="bg-purple-600 p-3 rounded-lg mr-4">
                    <Users className="text-white" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Manage Users</h3>
                </div>
                <p className="text-slate-400 text-sm">View and manage all platform users</p>
                <div className="mt-4">
                  <span className="text-green-400 font-medium">{stats.activeUsers.toLocaleString()} active</span>
                </div>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:bg-slate-750 transition-colors duration-200 cursor-pointer">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-600 p-3 rounded-lg mr-4">
                    <Settings className="text-white" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-white">System Settings</h3>
                </div>
                <p className="text-slate-400 text-sm">Configure platform settings and preferences</p>
                <div className="mt-4">
                  <span className="text-slate-400 font-medium">Configure system</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'institutions' && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Institution Approval Management</h2>
            <p className="text-slate-400">This section will contain detailed institution approval workflows, document verification, and approval history.</p>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">User Management</h2>
            <p className="text-slate-400">This section will contain user management tools, role assignments, and user activity monitoring.</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">System Settings</h2>
            <p className="text-slate-400">This section will contain platform configuration options, feature toggles, and system maintenance tools.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;