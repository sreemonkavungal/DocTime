import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
    phone: '',
    // Doctor specific fields
    specialization: '',
    experienceYears: '',
    consultationFee: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const registrationData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      phone: formData.phone,
    };

    // Add doctor specific data
    if (formData.role === 'doctor') {
      registrationData.doctorData = {
        specialization: formData.specialization || 'General Physician',
        experienceYears: parseInt(formData.experienceYears, 10) || 0,
        consultationFee: parseInt(formData.consultationFee, 10) || 0,
      };
    }

    const result = await register(registrationData);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Registration failed. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-sky-50">
      {/* Similar spacing to Login: close to navbar but with breathing room */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Left panel – brand & messaging (hidden on small if needed) */}
          <div className="hidden lg:flex flex-col justify-start pr-6">
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                Create your <span className="text-indigo-600">DocTime</span> account
              </h1>
              <p className="mt-3 text-sm md:text-base text-slate-600 max-w-md">
                Join thousands of patients and doctors who use DocTime to
                schedule, manage, and track appointments effortlessly.
              </p>
            </div>

            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                <span>Patients can book, reschedule, and track visits easily.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Doctors manage schedules, consultations, and feedback.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-sky-500" />
                <span>Admins get a unified view of the entire platform.</span>
              </div>
            </div>
          </div>

          {/* Right panel – form */}
          <div className="max-w-2xl w-full mx-auto">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-md border border-slate-100 px-6 py-7 sm:px-8 sm:py-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Create your account
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Choose your role and complete your details to get started.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Register as
                  </label>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, role: 'patient' }))}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                        formData.role === 'patient'
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Patient
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, role: 'doctor' }))}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                        formData.role === 'doctor'
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Doctor
                    </button>
                  </div>
                  {/* Hidden radios to keep semantics unchanged if needed */}
                  <input
                    type="radio"
                    name="role"
                    value="patient"
                    checked={formData.role === 'patient'}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <input
                    type="radio"
                    name="role"
                    value="doctor"
                    checked={formData.role === 'doctor'}
                    onChange={handleChange}
                    className="hidden"
                  />
                </div>

                {/* Common Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Full Name *
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      className="input-field"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      className="input-field"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Email address *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="input-field"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Password *
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      className="input-field"
                      placeholder="Min 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Confirm Password *
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      className="input-field"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Doctor Specific Fields */}
                {formData.role === 'doctor' && (
                  <div className="border-t border-slate-100 pt-5">
                    <h3 className="text-base font-semibold text-slate-900 mb-4">
                      Doctor Information
                    </h3>

                    <div className="bg-slate-50/80 rounded-xl border border-slate-100 p-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="specialization"
                            className="block text-sm font-medium text-slate-700 mb-1"
                          >
                            Specialization
                          </label>
                          <input
                            id="specialization"
                            name="specialization"
                            type="text"
                            className="input-field"
                            placeholder="e.g., Cardiologist"
                            value={formData.specialization}
                            onChange={handleChange}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="experienceYears"
                            className="block text-sm font-medium text-slate-700 mb-1"
                          >
                            Years of Experience
                          </label>
                          <input
                            id="experienceYears"
                            name="experienceYears"
                            type="number"
                            min="0"
                            className="input-field"
                            placeholder="e.g., 5"
                            value={formData.experienceYears}
                            onChange={handleChange}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="consultationFee"
                            className="block text-sm font-medium text-slate-700 mb-1"
                          >
                            Consultation Fee ($)
                          </label>
                          <input
                            id="consultationFee"
                            name="consultationFee"
                            type="number"
                            min="0"
                            className="input-field"
                            placeholder="e.g., 100"
                            value={formData.consultationFee}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <p className="text-xs md:text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-md px-3 py-2">
                        Note: Your doctor account may require admin review and approval
                        before becoming fully active.
                      </p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-slate-600">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>

            {/* Mobile brand footer */}
            <div className="mt-6 text-center lg:hidden">
              <h2 className="text-xl font-bold text-slate-900">DocTime</h2>
              <p className="mt-1 text-xs text-slate-500">
                Smart, simple appointment management for everyone.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
