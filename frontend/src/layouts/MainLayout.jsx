import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const MainLayout = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `rounded-md px-3 py-2 text-sm font-medium transition ${
      isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to={isAuthenticated ? (user?.role === 'HR' ? '/hr' : '/employee') : '/login'} className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-sm font-semibold text-white">
              PE
            </div>
            <div>
              <p className="text-base font-semibold text-slate-900">Performance Evaluation</p>
              <p className="text-sm text-slate-500">Internal review workspace</p>
            </div>
          </Link>

          <nav className="flex flex-wrap items-center gap-2 text-sm">
            {isAuthenticated ? (
              <>
                <span className="mr-1 hidden rounded-full bg-slate-100 px-3 py-1 text-slate-700 sm:inline-block">
                  {user?.name || 'User'}
                </span>
                <NavLink to="/employee" className={navLinkClass}>
                  Employee
                </NavLink>
                <NavLink to="/employee/history" className={navLinkClass}>
                  History
                </NavLink>
                {user?.role === 'HR' ? (
                  <NavLink to="/hr" className={navLinkClass}>
                    HR
                  </NavLink>
                ) : null}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <NavLink to="/login" className={navLinkClass}>
                Login
              </NavLink>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
