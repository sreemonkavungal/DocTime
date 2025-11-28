import { useState, useEffect } from 'react';
import { doctorAPI } from '../../utils/api';

const DoctorProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    experienceYears: '',
    consultationFee: '',
    about: '',
    education: '',
    location: {
      address: '',
      city: '',
      state: '',
      pincode: '',
    },
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await doctorAPI.getMyProfile();
      const doctor = response.data.doctor;
      setProfile(doctor);
      setFormData({
        name: doctor.name || '',
        specialization: doctor.specialization || '',
        experienceYears: doctor.experienceYears || '',
        consultationFee: doctor.consultationFee || '',
        about: doctor.about || '',
        education: doctor.education || '',
        location: {
          address: doctor.location?.address || '',
          city: doctor.location?.city || '',
          state: doctor.location?.state || '',
          pincode: doctor.location?.pincode || '',
        },
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          [locationField]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await doctorAPI.updateProfile(formData);
      await fetchProfile();
      setEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          {!editing && (
            <button onClick={() => setEditing(true)} className="btn-primary">
              Edit Profile
            </button>
          )}
        </div>

        <div className="card">
          {profile?.status === 'pending' && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 font-medium">
                ⏳ Your profile is pending approval from admin.
              </p>
            </div>
          )}

          {profile?.status === 'rejected' && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">
                ❌ Your profile has been rejected. Please contact admin.
              </p>
            </div>
          )}

          {profile?.status === 'approved' && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">
                ✅ Your profile is approved and visible to patients.
              </p>
            </div>
          )}

          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="input-field"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specialization *
                  </label>
                  <input
                    type="text"
                    name="specialization"
                    required
                    className="input-field"
                    value={formData.specialization}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience (Years) *
                  </label>
                  <input
                    type="number"
                    name="experienceYears"
                    required
                    min="0"
                    className="input-field"
                    value={formData.experienceYears}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Consultation Fee ($) *
                  </label>
                  <input
                    type="number"
                    name="consultationFee"
                    required
                    min="0"
                    className="input-field"
                    value={formData.consultationFee}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Education
                </label>
                <input
                  type="text"
                  name="education"
                  className="input-field"
                  placeholder="e.g., MBBS, MD from XYZ University"
                  value={formData.education}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  About
                </label>
                <textarea
                  name="about"
                  rows="4"
                  className="input-field"
                  placeholder="Tell patients about yourself, your expertise, and approach to healthcare"
                  value={formData.about}
                  onChange={handleChange}
                />
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      name="location.address"
                      className="input-field"
                      value={formData.location.address}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="location.city"
                      className="input-field"
                      value={formData.location.city}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      name="location.state"
                      className="input-field"
                      value={formData.location.state}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode
                    </label>
                    <input
                      type="text"
                      name="location.pincode"
                      className="input-field"
                      value={formData.location.pincode}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    fetchProfile();
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="text-lg font-medium">{profile?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Specialization</p>
                  <p className="text-lg font-medium">{profile?.specialization}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Experience</p>
                  <p className="text-lg font-medium">{profile?.experienceYears} years</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Consultation Fee</p>
                  <p className="text-lg font-medium">${profile?.consultationFee}</p>
                </div>
              </div>

              {profile?.education && (
                <div>
                  <p className="text-sm text-gray-600">Education</p>
                  <p className="text-lg font-medium">{profile.education}</p>
                </div>
              )}

              {profile?.about && (
                <div>
                  <p className="text-sm text-gray-600">About</p>
                  <p className="text-gray-700">{profile.about}</p>
                </div>
              )}

              {profile?.location && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Location</p>
                  <p className="text-gray-700">
                    {profile.location.address && `${profile.location.address}, `}
                    {profile.location.city && `${profile.location.city}, `}
                    {profile.location.state}
                    {profile.location.pincode && ` - ${profile.location.pincode}`}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                <div>
                  <p className="text-sm text-gray-600">Rating</p>
                  <p className="text-lg font-medium">⭐ {profile?.rating?.toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Reviews</p>
                  <p className="text-lg font-medium">{profile?.totalReviews}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;

