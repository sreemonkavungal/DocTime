import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorAPI, appointmentAPI, ratingAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const DoctorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, hasRole } = useAuth();
  
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [reviews, setReviews] = useState([]);
  const [ratingStats, setRatingStats] = useState(null);
  const [showReviews, setShowReviews] = useState(false);

  useEffect(() => {
    fetchDoctor();
    fetchRatingStats();
    fetchReviews();
    
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
  }, [id]);

  useEffect(() => {
    if (selectedDate) {
      fetchSlots();
    }
  }, [selectedDate]);

  const fetchDoctor = async () => {
    try {
      const response = await doctorAPI.getById(id);
      setDoctor(response.data.doctor);
    } catch (error) {
      console.error('Error fetching doctor:', error);
      setError('Failed to load doctor information');
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async () => {
    try {
      const response = await doctorAPI.getSlots(id, selectedDate);
      setSlots(response.data.slots);
    } catch (error) {
      console.error('Error fetching slots:', error);
    }
  };

  const fetchRatingStats = async () => {
    try {
      const response = await ratingAPI.getDoctorStats(id);
      setRatingStats(response.data);
    } catch (error) {
      console.error('Error fetching rating stats:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await ratingAPI.getDoctorReviews(id, { limit: 5 });
      setReviews(response.data.reviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleBookAppointment = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!hasRole('patient')) {
      setError('Only patients can book appointments');
      return;
    }

    if (!selectedSlot) {
      setError('Please select a time slot');
      return;
    }

    setBookingLoading(true);
    setError('');

    try {
      await appointmentAPI.create({
        doctorId: id,
        date: selectedDate,
        timeSlot: selectedSlot,
        reason,
      });

      setSuccess('Appointment booked successfully!');
      setTimeout(() => {
        navigate('/appointments');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to book appointment');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Doctor not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Doctor Info */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{doctor.name}</h1>
                  <p className="text-xl text-primary-600 font-medium">{doctor.specialization}</p>
                </div>
                <div className="flex items-center text-yellow-500">
                  <span className="text-2xl">⭐</span>
                  <span className="ml-1 text-xl font-semibold">{doctor.rating.toFixed(1)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">Experience</p>
                  <p className="text-lg font-semibold">{doctor.experienceYears} years</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">Consultation Fee</p>
                  <p className="text-lg font-semibold">${doctor.consultationFee}</p>
                </div>
              </div>

              {doctor.education && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">Education</h2>
                  <p className="text-gray-700">{doctor.education}</p>
                </div>
              )}

              {doctor.about && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">About</h2>
                  <p className="text-gray-700">{doctor.about}</p>
                </div>
              )}

              {doctor.location && (
                <div>
                  <h2 className="text-lg font-semibold mb-2">Location</h2>
                  <p className="text-gray-700">
                    {doctor.location.address && `${doctor.location.address}, `}
                    {doctor.location.city && `${doctor.location.city}, `}
                    {doctor.location.state}
                  </p>
                </div>
              )}

              {/* Rating Statistics */}
              {ratingStats && ratingStats.totalReviews > 0 && (
                <div className="mt-6">
                  <h2 className="text-lg font-semibold mb-4">Ratings & Reviews</h2>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary-600">
                        {ratingStats.averageRating.toFixed(1)}
                      </div>
                      <div className="flex items-center gap-1 justify-center mt-1">
                        <span className="text-yellow-500">{'⭐'.repeat(Math.round(ratingStats.averageRating))}</span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {ratingStats.totalReviews} {ratingStats.totalReviews === 1 ? 'review' : 'reviews'}
                      </div>
                    </div>

                    <div className="flex-1">
                      {[5, 4, 3, 2, 1].map((star) => (
                        <div key={star} className="flex items-center gap-2 text-sm">
                          <span className="w-8">{star}⭐</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-yellow-500 h-2 rounded-full"
                              style={{
                                width: `${ratingStats.totalReviews > 0 
                                  ? (ratingStats.distribution[star] / ratingStats.totalReviews) * 100 
                                  : 0}%`,
                              }}
                            />
                          </div>
                          <span className="w-8 text-gray-600">{ratingStats.distribution[star]}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Reviews */}
                  {reviews.length > 0 && (
                    <div>
                      <button
                        onClick={() => setShowReviews(!showReviews)}
                        className="text-primary-600 hover:text-primary-700 font-medium mb-3"
                      >
                        {showReviews ? '− Hide Reviews' : '+ Show Reviews'}
                      </button>

                      {showReviews && (
                        <div className="space-y-4 mt-3">
                          {reviews.map((review) => (
                            <div key={review._id} className="border-l-4 border-primary-200 pl-4 py-2">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{review.patientId?.name || 'Anonymous'}</span>
                                <span className="text-yellow-500">{'⭐'.repeat(review.rating)}</span>
                                <span className="text-sm text-gray-500">
                                  {new Date(review.ratedAt).toLocaleDateString()}
                                </span>
                              </div>
                              {review.review && (
                                <p className="text-gray-700 text-sm italic">"{review.review}"</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Booking Section */}
          <div className="lg:col-span-1">
            <div className="card sticky top-4">
              <h2 className="text-xl font-bold mb-4">Book Appointment</h2>

              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
                  {success}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Date
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Time Slots
                </label>
                {slots.length === 0 ? (
                  <p className="text-gray-500 text-sm">No slots available for this date</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                    {slots.map((slot) => (
                      <button
                        key={slot.timeSlot}
                        disabled={!slot.available}
                        onClick={() => setSelectedSlot(slot.timeSlot)}
                        className={`p-2 rounded border text-sm ${
                          !slot.available
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : selectedSlot === slot.timeSlot
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'border-gray-300 hover:border-primary-500'
                        }`}
                      >
                        {slot.timeSlot}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Visit (Optional)
                </label>
                <textarea
                  className="input-field"
                  rows="3"
                  placeholder="Describe your symptoms or reason for consultation"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <button
                onClick={handleBookAppointment}
                disabled={bookingLoading || !selectedSlot || success}
                className="btn-primary w-full"
              >
                {bookingLoading ? 'Booking...' : 'Book Appointment'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetail;

