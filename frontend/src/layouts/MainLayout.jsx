import { Link, Outlet, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const MainLayout = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-xl font-semibold text-blue-600">
            Performance Evaluation Tool
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            {isAuthenticated ? (
              <>
                <span className="text-slate-600">{user?.name || 'User'}</span>
                <Link to="/employee" className="hover:text-blue-600">
                  Employee
                </Link>
                <Link to="/give-feedback" className="hover:text-blue-600">
                  Give Feedback
                </Link>
                <Link to="/feedback-history" className="hover:text-blue-600">
                  History
                </Link>
                {user?.role === 'HR' ? (
                  <Link to="/hr" className="hover:text-blue-600">
                    HR
                  </Link>
                ) : null}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-md border border-slate-300 px-3 py-1 text-slate-700 hover:bg-slate-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="hover:text-blue-600">
                Login
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
