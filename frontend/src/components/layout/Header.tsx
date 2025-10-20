import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated, logout } from '../../store/authSlice';

const Header = () => {
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            VSConnectO
          </Link>

          {isAuthenticated && user ? (
            <div className="flex items-center gap-6">
              <Link to="/dashboard" className="hover:text-blue-600 transition-colors">
                Dashboard
              </Link>
              <Link to="/jobs" className="hover:text-blue-600 transition-colors">
                {user.role === 'client' ? 'My Jobs' : 'Browse Jobs'}
              </Link>
              {user.role === 'provider' && (
                <Link to="/my-orders" className="hover:text-blue-600 transition-colors">
                  My Work
                </Link>
              )}
              {user.role === 'client' && (
                <Link to="/ongoing-jobs" className="hover:text-blue-600 transition-colors">
                  Ongoing Work
                </Link>
              )}
              <Link to="/messages" className="hover:text-blue-600 transition-colors">
                Messages
              </Link>
              <Link to="/profile" className="hover:text-blue-600 transition-colors">
                Profile
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="hover:text-blue-600 transition-colors">
                  Admin
                </Link>
              )}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  {user.fullName}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-4">
              <Link to="/" className="text-gray-600 hover:text-blue-600 transition-colors">
                Home
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
