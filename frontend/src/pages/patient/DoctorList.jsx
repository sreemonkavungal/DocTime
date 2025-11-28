import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { doctorAPI } from '../../utils/api';

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    specialization: '',
    city: '',
  });
  const [specializations, setSpecializations] = useState([]);

  useEffect(() => {
    fetchSpecializations();
    fetchDoctors();
  }, []);

  const fetchSpecializations = async () => {
    try {
      const response = await doctorAPI.getSpecializations();
      setSpecializations(response.data.specializations);
    } catch (error) {
      console.error('Error fetching specializations:', error);
    }
  };

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const response = await doctorAPI.getAll(filters);
      setDoctors(response.data.doctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDoctors();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Find Doctors</h1>

        {/* Filters */}
        <div className="card mb-8">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                name="search"
                placeholder="Doctor name or specialty"
                className="input-field"
                value={filters.search}
                onChange={handleFilterChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specialization
              </label>
              <select
                name="specialization"
                className="input-field"
                value={filters.specialization}
                onChange={handleFilterChange}
              >
                <option value="">All Specializations</option>
                {specializations.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                name="city"
                placeholder="City name"
                className="input-field"
                value={filters.city}
                onChange={handleFilterChange}
              />
            </div>

            <div className="flex items-end">
              <button type="submit" className="btn-primary w-full">
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Doctor List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No doctors found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <div key={doctor._id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{doctor.name}</h3>
                    <p className="text-primary-600 font-medium">{doctor.specialization}</p>
                  </div>
                  <div className="flex items-center text-yellow-500">
                    <span className="text-lg">⭐</span>
                    <span className="ml-1 font-semibold">{doctor.rating.toFixed(1)}</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p>
                    <span className="font-medium">Experience:</span> {doctor.experienceYears} years
                  </p>
                  {doctor.location?.city && (
                    <p>
                      <span className="font-medium">Location:</span> {doctor.location.city}
                    </p>
                  )}
                  <p>
                    <span className="font-medium">Fee:</span> ${doctor.consultationFee}
                  </p>
                </div>

                {doctor.about && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {doctor.about}
                  </p>
                )}

                <Link
                  to={`/doctors/${doctor._id}`}
                  className="btn-primary w-full text-center"
                >
                  View Profile & Book
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorList;

