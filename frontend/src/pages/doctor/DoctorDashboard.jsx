import { useState, useEffect } from 'react';
import { appointmentAPI } from '../../utils/api';

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Fetching doctor appointments...');
      const response = await appointmentAPI.getMyAppointments({ upcoming: 'true' });
      const appointments = response.data.appointments;
      console.log('Fetched appointments:', appointments.length);
      setAppointments(appointments);

      // Calculate stats
      const stats = {
        total: appointments.length,
        pending: appointments.filter((a) => a.status === 'pending').length,
        confirmed: appointments.filter((a) => a.status === 'confirmed').length,
        completed: appointments.filter((a) => a.status === 'completed').length,
      };
      setStats(stats);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      const errorMsg = error.response?.data?.error || 'Failed to fetch appointments';
      setError(errorMsg);
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await appointmentAPI.updateStatus(id, { status });
      fetchAppointments();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update appointment');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
          <button 
            onClick={fetchAppointments} 
            className="btn-secondary"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : '🔄 Refresh'}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
            <p className="text-sm text-red-600 mt-2">
              If you just registered, please ask an admin to approve your account.
              If you're already approved, try logging out and back in.
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <p className="text-gray-600 text-sm">Total Appointments</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
          </div>
          <div className="card">
            <p className="text-gray-600 text-sm">Pending</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
          </div>
          <div className="card">
            <p className="text-gray-600 text-sm">Confirmed</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.confirmed}</p>
          </div>
          <div className="card">
            <p className="text-gray-600 text-sm">Completed</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{stats.completed}</p>
          </div>
        </div>

        {/* Appointments List */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Upcoming Appointments</h2>

          {appointments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No upcoming appointments</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.map((appointment) => (
                    <tr key={appointment._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.patientId.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {appointment.patientId.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(appointment.date)}</div>
                        <div className="text-sm text-gray-500">{appointment.timeSlot}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {appointment.reason || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
                            appointment.status
                          )}`}
                        >
                          {appointment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {appointment.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateStatus(appointment._id, 'confirmed')}
                              disabled={updatingId === appointment._id}
                              className="text-green-600 hover:text-green-900 font-medium"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(appointment._id, 'cancelled')}
                              disabled={updatingId === appointment._id}
                              className="text-red-600 hover:text-red-900 font-medium"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {appointment.status === 'confirmed' && (
                          <button
                            onClick={() => handleUpdateStatus(appointment._id, 'completed')}
                            disabled={updatingId === appointment._id}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            Mark Complete
                          </button>
                        )}
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
  );
};

export default DoctorDashboard;

