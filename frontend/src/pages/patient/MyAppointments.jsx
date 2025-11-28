import { useState, useEffect } from 'react';
import { appointmentAPI, ratingAPI } from '../../utils/api';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, upcoming, past
  const [cancellingId, setCancellingId] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await appointmentAPI.getMyAppointments();
      setAppointments(response.data.appointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    setCancellingId(id);
    try {
      await appointmentAPI.cancel(id);
      fetchAppointments();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to cancel appointment');
    } finally {
      setCancellingId(null);
    }
  };

  const openRatingModal = (appointment) => {
    setSelectedAppointment(appointment);
    setRating(appointment.rating || 0);
    setReview(appointment.review || '');
    setShowRatingModal(true);
  };

  const closeRatingModal = () => {
    setShowRatingModal(false);
    setSelectedAppointment(null);
    setRating(0);
    setReview('');
  };

  const handleSubmitRating = async () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setSubmittingRating(true);
    try {
      if (selectedAppointment.rating) {
        // Update existing rating
        await ratingAPI.updateRating({
          appointmentId: selectedAppointment._id,
          rating,
          review,
        });
        alert('Rating updated successfully!');
      } else {
        // Submit new rating
        await ratingAPI.submitRating({
          appointmentId: selectedAppointment._id,
          rating,
          review,
        });
        alert('Thank you for your rating!');
      }
      fetchAppointments();
      closeRatingModal();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to submit rating');
    } finally {
      setSubmittingRating(false);
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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') {
      return new Date(apt.date) >= new Date() && apt.status !== 'cancelled';
    }
    if (filter === 'past') {
      return new Date(apt.date) < new Date() || apt.status === 'completed';
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Appointments</h1>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'upcoming'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'past'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Past
            </button>
          </div>
        </div>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600 text-lg">No appointments found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <div key={appointment._id} className="card">
                <div className="flex flex-col gap-4 md:flex-row md:items-stretch md:justify-between">
                  {/* Left section: details */}
                  <div className="flex-1">
                    {/* Header row */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between border-b border-gray-100 pb-3 mb-3">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          Dr. {appointment.doctorId.name}
                        </h3>
                        <p className="text-primary-600 font-medium text-sm mt-1">
                          {appointment.doctorId.specialization}
                        </p>
                      </div>

                      <div className="flex flex-col items-start sm:items-end gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${getStatusBadge(
                            appointment.status
                          )}`}
                        >
                          {appointment.status.toUpperCase()}
                        </span>

                        {appointment.status === 'completed' && appointment.rating && (
                          <div className="text-xs text-gray-700">
                            <p className="font-medium mb-1 text-right">Your Rating</p>
                            <div className="flex items-center justify-end gap-1">
                              <span className="text-yellow-500 text-base">
                                {'⭐'.repeat(appointment.rating)}
                              </span>
                              <span className="text-gray-300 text-base">
                                {'⭐'.repeat(5 - appointment.rating)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Info grid */}
                    <div className="grid gap-3 text-sm text-gray-700 sm:grid-cols-2">
                      <div className="flex items-start gap-2">
                        <span className="font-medium min-w-[70px]">Date</span>
                        <span className="text-gray-800">
                          {formatDate(appointment.date)}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium min-w-[70px]">Time</span>
                        <span className="text-gray-800">
                          {appointment.timeSlot}
                        </span>
                      </div>

                      {appointment.reason && (
                        <div className="flex items-start gap-2 sm:col-span-2">
                          <span className="font-medium min-w-[70px]">Reason</span>
                          <span className="text-gray-800">
                            {appointment.reason}
                          </span>
                        </div>
                      )}

                      {appointment.notes && (
                        <div className="flex items-start gap-2 sm:col-span-2">
                          <span className="font-medium min-w-[70px]">Notes</span>
                          <span className="text-gray-800">
                            {appointment.notes}
                          </span>
                        </div>
                      )}

                      {appointment.status === 'completed' && appointment.review && (
                        <div className="flex items-start gap-2 sm:col-span-2">
                          <span className="font-medium min-w-[70px]">Review</span>
                          <span className="text-gray-700 italic">
                            "{appointment.review}"
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right section: actions */}
                  <div className="flex md:flex-col gap-2 md:items-end md:justify-between md:w-48">
                    {(appointment.status === 'pending' ||
                      appointment.status === 'confirmed') && (
                      <button
                        onClick={() => handleCancelAppointment(appointment._id)}
                        disabled={cancellingId === appointment._id}
                        className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 font-medium text-sm border border-red-100 disabled:opacity-50 w-full md:w-auto"
                      >
                        {cancellingId === appointment._id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    )}

                    {appointment.status === 'completed' && (
                      <button
                        onClick={() => openRatingModal(appointment)}
                        className="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 font-medium text-sm border border-primary-100 w-full md:w-auto"
                      >
                        {appointment.rating ? 'Edit Rating' : 'Rate Doctor'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rating Modal */}
        {showRatingModal && selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-4">
                {selectedAppointment.rating ? 'Edit Your Rating' : 'Rate Your Experience'}
              </h3>

              <div className="mb-4">
                <p className="text-gray-700 mb-1">
                  Doctor:{' '}
                  <span className="font-semibold">
                    {selectedAppointment.doctorId.name}
                  </span>
                </p>
                <p className="text-gray-600 text-sm">
                  {formatDate(selectedAppointment.date)} at {selectedAppointment.timeSlot}
                </p>
              </div>

              {/* Star Rating */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating *
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="text-3xl focus:outline-none transition-transform hover:scale-110"
                    >
                      <span className={star <= rating ? 'text-yellow-500' : 'text-gray-300'}>
                        ⭐
                      </span>
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    {rating === 1 && 'Poor'}
                    {rating === 2 && 'Fair'}
                    {rating === 3 && 'Good'}
                    {rating === 4 && 'Very Good'}
                    {rating === 5 && 'Excellent'}
                  </p>
                )}
              </div>

              {/* Review Text */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review (Optional)
                </label>
                <textarea
                  className="input-field"
                  rows="4"
                  placeholder="Share your experience with this doctor..."
                  maxLength="500"
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {review.length}/500 characters
                </p>
              </div>

              {selectedAppointment.rating && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm text-blue-800">
                    ℹ️ You can edit your rating within 7 days of submission.
                  </p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={handleSubmitRating}
                  disabled={submittingRating || rating === 0}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  {submittingRating
                    ? 'Submitting...'
                    : selectedAppointment.rating
                    ? 'Update Rating'
                    : 'Submit Rating'}
                </button>
                <button
                  onClick={closeRatingModal}
                  disabled={submittingRating}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAppointments;
