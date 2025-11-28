import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // IMPORTANT: also get user from context
  const { login, user } = useAuth();
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
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (!result || !result.success) {
      setError(result?.error || 'Login failed. Please try again.');
      setLoading(false);
      return;
    }

    // Try from result first, fall back to context user
    const roleFromResult = result.user?.role;
    const role = roleFromResult || user?.role;

    // console.log('Login result:', result, 'Context user:', user, 'Role used:', role);

    if (role === 'doctor') {
      navigate('/doctor/dashboard');
    } else if (role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      // patient or unknown
      navigate('/');
    }

    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-sky-50">
      {/* Reduced padding so page is closer to navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          {/* Left panel: info (desktop) */}
          <div className="hidden md:flex flex-col justify-start pr-4">
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                Welcome back to <span className="text-indigo-600">DocTime</span>
              </h1>
              <p className="mt-3 text-sm md:text-base text-slate-600 max-w-md">
                Sign in to manage your appointments, connect with doctors,
                and keep track of your health in one place.
              </p>
            </div>

            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Secure and private authentication</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                <span>Access your appointments anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-sky-500" />
                <span>Seamless experience across devices</span>
              </div>
            </div>
          </div>

          {/* Right panel: form */}
          <div className="max-w-md w-full mx-auto">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-md border border-slate-100 px-6 py-7 sm:px-8 sm:py-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Sign in
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Use your registered email and password to continue.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="input-field"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="input-field"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full btn-primary mt-2"
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-slate-600">
                  Do not have an account?{' '}
                  <Link
                    to="/register"
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </div>

            {/* Small brand footer for mobile */}
            <div className="mt-6 text-center md:hidden">
              <h2 className="text-xl font-bold text-slate-900">DocTime</h2>
              <p className="mt-1 text-xs text-slate-500">
                Smart, simple appointment management.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
