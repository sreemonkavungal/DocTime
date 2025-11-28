import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  const getPrimaryCta = () => {
    if (!isAuthenticated) {
      return (
        <>
          <Link
            to="/register"
            className="btn-primary text-base md:text-lg px-6 md:px-8 py-2.5 md:py-3"
          >
            Get Started
          </Link>
          <Link
            to="/doctors"
            className="btn-outline text-base md:text-lg px-6 md:px-8 py-2.5 md:py-3"
          >
            Find Doctors
          </Link>
        </>
      );
    }

    if (user?.role === 'patient') {
      return (
        <Link
          to="/doctors"
          className="btn-primary text-base md:text-lg px-6 md:px-8 py-2.5 md:py-3"
        >
          Find Doctors
        </Link>
      );
    }

    if (user?.role === 'doctor') {
      return (
        <Link
          to="/doctor/dashboard"
          className="btn-primary text-base md:text-lg px-6 md:px-8 py-2.5 md:py-3"
        >
          Go to Dashboard
        </Link>
      );
    }

    if (user?.role === 'admin') {
      return (
        <Link
          to="/admin/dashboard"
          className="btn-primary text-base md:text-lg px-6 md:px-8 py-2.5 md:py-3"
        >
          Go to Admin Panel
        </Link>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        {/* Hero */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* Left: main copy */}
          <div>
            <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 ring-1 ring-indigo-100 mb-4">
              Modern digital appointment platform
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-4">
              Your Health,{' '}
              <span className="text-indigo-600">Our Priority</span>
            </h1>

            <p className="text-base md:text-lg text-slate-600 mb-6 md:mb-8 max-w-xl">
              Discover and book appointments with verified doctors in just a few
              clicks. Manage your visits, stay on top of your health, and get
              care when you need it.
            </p>

            <div className="flex flex-wrap gap-3 md:gap-4 items-center mb-6">
              {getPrimaryCta()}
            </div>

            {/* trust indicators */}
            <div className="flex flex-wrap items-center gap-6 text-xs md:text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Instant online booking</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-sky-500" />
                <span>Verified medical professionals</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span>Secure &amp; private records</span>
              </div>
            </div>
          </div>

          {/* Right: steps / summary panel */}
          <div className="relative">
            <div className="relative bg-white/85 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-100 p-6 md:p-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                A simple way to manage your care
              </h2>

              <div className="space-y-4 text-sm text-slate-700">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 text-base font-semibold">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">
                      Search for a doctor
                    </p>
                    <p className="text-slate-600">
                      Filter by specialization, experience, and patient ratings
                      to find the right match.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 text-base font-semibold">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">
                      Choose a time slot
                    </p>
                    <p className="text-slate-600">
                      View real-time availability and book appointments that
                      fit your schedule.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 text-base font-semibold">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">
                      Manage your visits
                    </p>
                    <p className="text-slate-600">
                      Track upcoming visits, reschedule when needed, and rate
                      your experience with each doctor.
                    </p>
                  </div>
                </div>
              </div>

              {/* mini stats */}
              <div className="mt-6 grid grid-cols-3 gap-3 text-center text-xs md:text-sm">
                <div className="rounded-lg bg-indigo-50 py-3">
                  <div className="font-bold text-indigo-700">500+</div>
                  <div className="text-slate-600">Doctors</div>
                </div>
                <div className="rounded-lg bg-sky-50 py-3">
                  <div className="font-bold text-sky-700">10K+</div>
                  <div className="text-slate-600">Patients</div>
                </div>
                <div className="rounded-lg bg-emerald-50 py-3">
                  <div className="font-bold text-emerald-700">50+</div>
                  <div className="text-slate-600">Specialties</div>
                </div>
              </div>
            </div>

            {/* accent glows */}
            <div className="pointer-events-none absolute -top-8 -right-10 h-32 w-32 rounded-full bg-indigo-100/70 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-sky-100/70 blur-2xl" />
          </div>
        </section>

        {/* Features */}
        <section className="mt-16 md:mt-20">
          <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 text-center mb-4">
            Built for patients, doctors, and administrators
          </h2>
          <p className="text-slate-600 text-center max-w-2xl mx-auto mb-10">
            DocTime streamlines the entire appointment journey—from discovery
            and booking to follow-up and feedback.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="card h-full border border-slate-100">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 text-2xl mb-4">
                🔍
              </div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900">
                Find Specialists Easily
              </h3>
              <p className="text-slate-600 text-sm">
                Search by specialty, location, experience, and patient feedback
                to find the doctor that best matches your needs.
              </p>
            </div>

            <div className="card h-full border border-slate-100">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 text-2xl mb-4">
                📅
              </div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900">
                Streamlined Booking
              </h3>
              <p className="text-slate-600 text-sm">
                Book appointments in seconds with real-time availability and
                instant confirmation—no calls, no queues.
              </p>
            </div>

            <div className="card h-full border border-slate-100">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 text-2xl mb-4">
                💼
              </div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900">
                Smart Appointment Management
              </h3>
              <p className="text-slate-600 text-sm">
                View upcoming visits, cancel or reschedule with ease, and keep a
                clear history of your care and feedback.
              </p>
            </div>
          </div>
        </section>

        {/* Stats strip */}
        <section className="mt-16 md:mt-20">
          <div className="bg-white/90 border border-slate-100 rounded-2xl shadow-sm px-6 py-6 md:px-10 md:py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-indigo-600">
                  500+
                </div>
                <div className="text-slate-600 mt-2 text-sm md:text-base">
                  Qualified Doctors
                </div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-indigo-600">
                  10K+
                </div>
                <div className="text-slate-600 mt-2 text-sm md:text-base">
                  Registered Patients
                </div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-indigo-600">
                  50+
                </div>
                <div className="text-slate-600 mt-2 text-sm md:text-base">
                  Specializations Covered
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
