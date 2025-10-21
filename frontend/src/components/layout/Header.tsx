import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated, logout } from '../../store/authSlice';
import NotificationBell from '../notifications/NotificationBell';
import MessageIcon from '../messages/MessageIcon';

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
              
              {/* Message Icon with Badge */}
              <MessageIcon />
              
              {/* Notification Bell */}
              <NotificationBell />
              
              <Link to="/profile" className="hover:text-blue-600 transition-colors">
                Profile
              </Link>
              {user.role === 'admin' && (
                <Link 
                  to="/admin" 
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg font-semibold"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Admin Panel</span>
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
