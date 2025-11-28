import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../utils/api';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await adminAPI.getAnalytics();
      setAnalytics(response.data.analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <p className="text-sm opacity-90">Total Users</p>
            <p className="text-4xl font-bold mt-2">{analytics?.totalUsers}</p>
          </div>
          
          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <p className="text-sm opacity-90">Total Patients</p>
            <p className="text-4xl font-bold mt-2">{analytics?.totalPatients}</p>
          </div>

          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <p className="text-sm opacity-90">Approved Doctors</p>
            <p className="text-4xl font-bold mt-2">{analytics?.totalDoctors}</p>
          </div>

          <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <p className="text-sm opacity-90">Pending Doctors</p>
            <p className="text-4xl font-bold mt-2">{analytics?.pendingDoctors}</p>
          </div>
        </div>

        {/* Appointments Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <p className="text-gray-600 text-sm">Total Appointments</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {analytics?.totalAppointments}
            </p>
          </div>

          <div className="card">
            <p className="text-gray-600 text-sm">Pending Appointments</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {analytics?.pendingAppointments}
            </p>
          </div>

          <div className="card">
            <p className="text-gray-600 text-sm">Completed Appointments</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {analytics?.completedAppointments}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link to="/admin/doctors" className="card hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">👨‍⚕️</div>
            <h3 className="text-xl font-semibold mb-2">Manage Doctors</h3>
            <p className="text-gray-600">Approve or reject doctor registrations</p>
            {analytics?.pendingDoctors > 0 && (
              <div className="mt-4 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium inline-block">
                {analytics.pendingDoctors} pending
              </div>
            )}
          </Link>

          <Link to="/admin/users" className="card hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-2">Manage Users</h3>
            <p className="text-gray-600">View and manage all users</p>
          </Link>

          <Link to="/admin/appointments" className="card hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-xl font-semibold mb-2">View Appointments</h3>
            <p className="text-gray-600">Monitor all appointments</p>
          </Link>
        </div>

        {/* Appointments by Specialty */}
        {analytics?.appointmentsBySpecialty?.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Appointments by Specialty</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Specialty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Total Appointments
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Percentage
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analytics.appointmentsBySpecialty.map((item, index) => {
                    const percentage = (
                      (item.count / analytics.totalAppointments) *
                      100
                    ).toFixed(1);
                    return (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                          {item._id || 'Unspecified'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{item.count}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className="bg-primary-600 h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">{percentage}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

