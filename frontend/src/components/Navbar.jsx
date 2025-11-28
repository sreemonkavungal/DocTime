import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setOpen(false);
  };

  const linkClass = ({ isActive }) =>
    `font-medium transition ${
      isActive
        ? 'text-primary-600'
        : 'text-gray-700 hover:text-primary-600'
    }`;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex items-center">
            <NavLink to="/" className="flex items-center space-x-2">
              <div className="text-2xl font-extrabold text-primary-600 tracking-tight">
                <span className="text-primary-700">Doc</span>
                <span className="text-primary-500">Time</span>
              </div>
            </NavLink>
          </div>

          {/* Desktop menu (UNCHANGED) */}
          <div className="hidden md:flex items-center">
            {!isAuthenticated ? (
              <div className="flex items-center gap-4">
                <NavLink to="/login" className={linkClass}>Login</NavLink>
                <NavLink to="/register" className="btn-primary text-sm">Sign Up</NavLink>
              </div>
            ) : (
              <div className="flex items-center gap-6">

                <div className="hidden sm:block text-right">
                  <p className="text-xs text-gray-500">Welcome</p>
                  <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                </div>

                {user?.role === 'patient' && (
                  <div className="flex items-center gap-5">
                    <NavLink to="/doctors" className={linkClass}>Find Doctors</NavLink>
                    <NavLink to="/appointments" className={linkClass}>My Appointments</NavLink>
                    <NavLink to="/patient/profile" className={linkClass}>Profile</NavLink>
                  </div>
                )}

                {user?.role === 'doctor' && (
                  <div className="flex items-center gap-5">
                    <NavLink to="/doctor/dashboard" className={linkClass}>Dashboard</NavLink>
                    <NavLink to="/doctor/profile" className={linkClass}>Profile</NavLink>
                    <NavLink to="/doctor/availability" className={linkClass}>Availability</NavLink>
                    <NavLink to="/doctor/settings" className={linkClass}>Settings</NavLink>
                  </div>
                )}

                {user?.role === 'admin' && (
                  <div className="flex items-center gap-5">
                    <NavLink to="/admin/dashboard" className={linkClass}>Dashboard</NavLink>
                    <NavLink to="/admin/doctors" className={linkClass}>Manage Doctors</NavLink>
                    <NavLink to="/admin/users" className={linkClass}>Manage Users</NavLink>
                    <NavLink to="/admin/settings" className={linkClass}>Settings</NavLink>
                  </div>
                )}

                <button onClick={handleLogout} className="btn-secondary text-sm">
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:bg-gray-100"
            aria-label="Toggle Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

        </div>

        {/* Mobile Dropdown Menu */}
        {open && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-4">

            {isAuthenticated && (
              <div className="px-2">
                <p className="text-xs text-gray-500">Logged in as</p>
                <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
              </div>
            )}

            <div className="flex flex-col gap-3 px-2">
              {!isAuthenticated ? (
                <>
                  <NavLink onClick={() => setOpen(false)} to="/login" className={linkClass}>Login</NavLink>
                  <NavLink onClick={() => setOpen(false)} to="/register" className="btn-primary w-fit">Sign Up</NavLink>
                </>
              ) : (
                <>
                  {user?.role === 'patient' && (
                    <>
                      <NavLink onClick={() => setOpen(false)} to="/doctors" className={linkClass}>Find Doctors</NavLink>
                      <NavLink onClick={() => setOpen(false)} to="/appointments" className={linkClass}>My Appointments</NavLink>
                      <NavLink onClick={() => setOpen(false)} to="/patient/profile" className={linkClass}>Profile</NavLink>
                    </>
                  )}

                  {user?.role === 'doctor' && (
                    <>
                      <NavLink onClick={() => setOpen(false)} to="/doctor/dashboard" className={linkClass}>Dashboard</NavLink>
                      <NavLink onClick={() => setOpen(false)} to="/doctor/profile" className={linkClass}>Profile</NavLink>
                      <NavLink onClick={() => setOpen(false)} to="/doctor/availability" className={linkClass}>Availability</NavLink>
                      <NavLink onClick={() => setOpen(false)} to="/doctor/settings" className={linkClass}>Settings</NavLink>
                    </>
                  )}

                  {user?.role === 'admin' && (
                    <>
                      <NavLink onClick={() => setOpen(false)} to="/admin/dashboard" className={linkClass}>Dashboard</NavLink>
                      <NavLink onClick={() => setOpen(false)} to="/admin/doctors" className={linkClass}>Manage Doctors</NavLink>
                      <NavLink onClick={() => setOpen(false)} to="/admin/users" className={linkClass}>Manage Users</NavLink>
                      <NavLink onClick={() => setOpen(false)} to="/admin/settings" className={linkClass}>Settings</NavLink>
                    </>
                  )}

                  <button
                    onClick={handleLogout}
                    className="btn-secondary w-fit mt-2"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
