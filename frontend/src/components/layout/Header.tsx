import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { selectCurrentUser, selectIsAuthenticated, logout } from '../../store/authSlice';
import NotificationBell from '../notifications/NotificationBell';
import MessageIcon from '../messages/MessageIcon';
import SearchBar from '../ui/SearchBar';
import LanguageSwitcher from '../language/LanguageSwitcher';
import RoleToggle from '../role/RoleToggle';

const Header = () => {
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <header className="bg-white sticky top-0 z-50 border-b border-neutral-200">
      {/* Top Bar - Logo, Search, Actions */}
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0 group">
            <img 
              src="/assets/images/connecto-logo.png" 
              alt="ConnectO Logo" 
              className="w-10 h-10 rounded-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <span className="text-xl font-bold text-neutral-900 hidden sm:block">
              ConnectO
            </span>
          </Link>

          {isAuthenticated && user ? (
            <>
              {/* Search Bar - Like Upwork */}
              <div className="flex-1 max-w-2xl mx-8 hidden md:block">
                <SearchBar
                  placeholder="Search for services, jobs, or providers..."
                  onSearch={(q) => navigate(`/jobs?search=${encodeURIComponent(q)}`)}
                />
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-2">
                {/* Role Toggle - Only show for non-admin users */}
                {user.role !== 'admin' && <RoleToggle />}
                
                {/* Message Icon */}
                <MessageIcon />
                
                {/* Notification Bell */}
                <NotificationBell />

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-neutral-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold shadow-soft">
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                    <svg className={`w-4 h-4 text-gray-600 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-medium border border-neutral-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-gray-900">{user.fullName}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <span className="inline-block mt-1 px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full font-medium">
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </div>
                      
                      <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors" onClick={() => setShowProfileMenu(false)}>
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-gray-700">{t('profile.myProfile')}</span>
                      </Link>

                      <Link to="/settings" className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors" onClick={() => setShowProfileMenu(false)}>
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-gray-700">{t('profile.settings')}</span>
                      </Link>

                      <Link to="/gdpr-settings" className="flex items-center gap-3 px-4 py-2.5 hover:bg-emerald-50 transition-colors group" onClick={() => setShowProfileMenu(false)}>
                        <svg className="w-5 h-5 text-emerald-600 group-hover:text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span className="text-emerald-700 group-hover:text-emerald-800 font-medium">Privacy & Data</span>
                      </Link>

                      <div className="border-t border-gray-100 my-2"></div>

                      <Link to="/wishlist" className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors" onClick={() => setShowProfileMenu(false)}>
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span className="text-gray-700">{t('profile.wishlist')}</span>
                      </Link>

                      <Link to="/referrals" className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors" onClick={() => setShowProfileMenu(false)}>
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span className="text-gray-700">{t('profile.referrals')}</span>
                      </Link>

                      <Link to="/reviews" className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors" onClick={() => setShowProfileMenu(false)}>
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        <span className="text-gray-700">{t('profile.reviews')}</span>
                      </Link>

                      <Link to="/followers-following" className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors" onClick={() => setShowProfileMenu(false)}>
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="text-gray-700">{t('profile.network')}</span>
                      </Link>

                      <div className="border-t border-gray-100 my-2"></div>

                      {/* Language Switcher */}
                      <LanguageSwitcher onClose={() => setShowProfileMenu(false)} />

                      {user.role === 'admin' && (
                        <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors" onClick={() => setShowProfileMenu(false)}>
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          <span className="text-gray-700">{t('profile.adminPanel')}</span>
                        </Link>
                      )}

                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={() => { handleLogout(); setShowProfileMenu(false); }}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors w-full text-left"
                        >
                          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span className="text-red-600 font-medium">{t('profile.logout')}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              {/* Language Switcher for Landing Page */}
              <LanguageSwitcher onClose={() => {}} />
              
              <Link to="/login" className="text-gray-700 hover:text-[#0D2B1D] font-medium transition-colors">
                Login
              </Link>
              <Link to="/register" className="bg-gradient-to-r from-[#345635] to-[#0D2B1D] text-white px-5 py-2 rounded-full hover:shadow-lg transition-all font-medium">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation Bar - minimal */}
      {isAuthenticated && user && (
        <div className="bg-neutral-50 border-t border-neutral-200">
          <div className="container mx-auto px-6">
            <nav className="flex items-center gap-1 h-12 overflow-x-auto">
              <Link 
                to="/dashboard" 
                className="flex items-center gap-2 px-4 py-2 text-neutral-700 hover:text-primary-700 hover:bg-white rounded-lg transition-colors font-medium whitespace-nowrap"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {t('nav.dashboard')}
              </Link>

              <Link 
                to="/jobs" 
                className="flex items-center gap-2 px-4 py-2 text-neutral-700 hover:text-primary-700 hover:bg-white rounded-lg transition-colors font-medium whitespace-nowrap"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {user.role === 'client' ? t('nav.myJobs') : t('nav.browseJobs')}
              </Link>

              {user.role === 'provider' && (
                <Link 
                  to="/my-orders" 
                  className="flex items-center gap-2 px-4 py-2 text-neutral-700 hover:text-primary-700 hover:bg-white rounded-lg transition-colors font-medium whitespace-nowrap"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  {t('nav.myWork')}
                </Link>
              )}

              {user.role === 'client' && (
                <Link 
                  to="/ongoing-jobs" 
                  className="flex items-center gap-2 px-4 py-2 text-neutral-700 hover:text-primary-700 hover:bg-white rounded-lg transition-colors font-medium whitespace-nowrap"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t('nav.ongoingWork')}
                </Link>
              )}

              {(user.role === 'client' || (user.role === 'provider' && user.providerType === 'Non-Technical')) && (
                <Link 
                  to="/find-nearby" 
                  className="flex items-center gap-2 px-4 py-2 text-neutral-700 hover:text-primary-700 hover:bg-white rounded-lg transition-colors font-medium whitespace-nowrap"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {t('nav.findNearby')}
                </Link>
              )}

              <Link 
                to="/leaderboard" 
                className="flex items-center gap-2 px-4 py-2 text-neutral-700 hover:text-primary-700 hover:bg-white rounded-lg transition-colors font-medium whitespace-nowrap"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 21h8M12 17v4m7-14a5 5 0 01-10 0V4h10v3zM5 7a4 4 0 004 4V4H5v3z" />
                </svg>
                {t('nav.leaderboard')}
              </Link>

              <Link 
                to="/community" 
                className="flex items-center gap-2 px-4 py-2 text-neutral-700 hover:text-primary-700 hover:bg-white rounded-lg transition-colors font-medium whitespace-nowrap"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h8M8 14h6m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Community
              </Link>

              {user.role === 'provider' && (
                <Link 
                  to="/collaboration" 
                  className="flex items-center gap-2 px-4 py-2 text-neutral-700 hover:text-primary-700 hover:bg-white rounded-lg transition-colors font-medium whitespace-nowrap"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a5 5 0 00-5-5h-1m-4 7H7v-2a5 5 0 015-5h0m0-4a3 3 0 110-6 3 3 0 010 6zm6 0a3 3 0 110-6 3 3 0 010 6z" />
                  </svg>
                  Collaboration
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
