import { useState, useEffect } from 'react';
import { adminAPI } from '../../utils/api';

const ManageDoctors = () => {
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchPendingDoctors();
  }, []);

  const fetchPendingDoctors = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getPendingDoctors();
      setPendingDoctors(response.data.doctors);
    } catch (error) {
      console.error('Error fetching pending doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (doctorId, status) => {
    if (!confirm(`Are you sure you want to ${status} this doctor?`)) {
      return;
    }

    setUpdatingId(doctorId);
    try {
      await adminAPI.updateDoctorStatus(doctorId, status);
      fetchPendingDoctors();
      alert(`Doctor ${status} successfully`);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update doctor status');
    } finally {
      setUpdatingId(null);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Manage Doctors</h1>

        {pendingDoctors.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600 text-lg">No pending doctor approvals</p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingDoctors.map((doctor) => (
              <div key={doctor._id} className="card">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-2xl font-bold text-gray-900">{doctor.name}</h3>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                        PENDING APPROVAL
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{doctor.userId?.email}</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium">{doctor.userId?.phone || 'N/A'}</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600">Specialization</p>
                        <p className="font-medium text-primary-600">{doctor.specialization}</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600">Experience</p>
                        <p className="font-medium">{doctor.experienceYears} years</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600">Consultation Fee</p>
                        <p className="font-medium">${doctor.consultationFee}</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600">Registered On</p>
                        <p className="font-medium">
                          {new Date(doctor.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {doctor.education && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600">Education</p>
                        <p className="font-medium">{doctor.education}</p>
                      </div>
                    )}

                    {doctor.about && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600">About</p>
                        <p className="text-gray-700">{doctor.about}</p>
                      </div>
                    )}

                    {doctor.location && (
                      <div>
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="font-medium">
                          {doctor.location.address && `${doctor.location.address}, `}
                          {doctor.location.city && `${doctor.location.city}, `}
                          {doctor.location.state}
                          {doctor.location.pincode && ` - ${doctor.location.pincode}`}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 ml-6">
                    <button
                      onClick={() => handleUpdateStatus(doctor._id, 'approved')}
                      disabled={updatingId === doctor._id}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(doctor._id, 'rejected')}
                      disabled={updatingId === doctor._id}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageDoctors;

