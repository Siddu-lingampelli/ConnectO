import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { selectCurrentUser, updateUser } from '../../store/authSlice';
import roleSwitchService from '../../services/roleSwitchService';

/**
 * RoleToggle Component
 * Allows users to switch between Client and Provider modes
 * Shows in Header and manages dual role functionality
 */
const RoleToggle = () => {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [switching, setSwitching] = useState(false);
  const [showEnableModal, setShowEnableModal] = useState(false);
  const [providerType, setProviderType] = useState<'Technical' | 'Non-Technical'>('Technical');

  const activeRole = user?.activeRole || user?.role || 'client';
  const enabledRoles = user?.enabledRoles || [activeRole];

  // Check if user has both roles enabled
  const hasBothRoles = enabledRoles.includes('client') && enabledRoles.includes('provider');
  const canEnableProvider = !enabledRoles.includes('provider');
  const canEnableClient = !enabledRoles.includes('client');

  // Debug logging
  console.log('RoleToggle Debug:', {
    activeRole,
    enabledRoles,
    hasBothRoles,
    canEnableProvider,
    canEnableClient,
    user: user ? 'exists' : 'null'
  });

  /**
   * Handle role switch
   */
  const handleRoleSwitch = async () => {
    if (switching) return;

    const targetRole = activeRole === 'client' ? 'provider' : 'client';

    // If trying to switch to provider but it's not enabled
    if (targetRole === 'provider' && !enabledRoles.includes('provider')) {
      setShowEnableModal(true);
      return;
    }

    setSwitching(true);
    try {
      const response = await roleSwitchService.switchRole(targetRole);
      
      // Update user in Redux store
      dispatch(updateUser(response.data.user));

      toast.success(response.message || `Switched to ${targetRole} mode successfully!`);

      // Redirect to dashboard to refresh the view
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Role switch error:', error);
      // Check if verification is required
      if (error.message && error.message.includes('verification')) {
        toast.error('Please complete verification first!');
        navigate('/verification');
      } else if (error.message && error.message.includes('demo')) {
        toast.error('Please complete demo project first!');
        navigate('/demo-project');
      } else {
        toast.error(error.message || 'Failed to switch role. Please try again.');
      }
    } finally {
      setSwitching(false);
    }
  };

  /**
   * Enable provider role for the first time
   */
  const handleEnableProvider = async () => {
    setSwitching(true);
    try {
      const response = await roleSwitchService.enableRole({
        role: 'provider',
        providerType: providerType
      });

      // Update user in Redux store
      dispatch(updateUser(response.data.user));

      toast.success(response.message || 'Provider role enabled successfully!');
      setShowEnableModal(false);

      // Prompt to complete verification
      toast.info('Please complete verification to start accepting jobs', {
        autoClose: 5000
      });
      
      setTimeout(() => {
        navigate('/verification');
      }, 2000);
    } catch (error: any) {
      console.error('Enable provider error:', error);
      toast.error(error.message || 'Failed to enable provider role. Please try again.');
    } finally {
      setSwitching(false);
    }
  };

  /**
   * Enable client role for the first time
   */
  const handleEnableClient = async () => {
    setSwitching(true);
    try {
      const response = await roleSwitchService.enableRole({
        role: 'client'
      });

      // Update user in Redux store
      dispatch(updateUser(response.data.user));

      toast.success(response.message || 'Client role enabled successfully!');
      setShowEnableModal(false);

      // Refresh dashboard
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Enable client error:', error);
      toast.error(error.message || 'Failed to enable client role. Please try again.');
    } finally {
      setSwitching(false);
    }
  };

  // Don't show for admin users
  if (user?.role === 'admin') {
    return null;
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Switch Role Button - Only show if user has both roles */}
        {hasBothRoles ? (
          <button
            onClick={handleRoleSwitch}
            disabled={switching}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#345635] to-[#0D2B1D] text-white rounded-full hover:shadow-lg transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            title={`Switch to ${activeRole === 'client' ? 'Service Provider' : 'Client'} mode`}
          >
            {switching ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Switching...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span>Switch to {activeRole === 'client' ? 'Selling' : 'Client'}</span>
              </>
            )}
          </button>
        ) : canEnableProvider ? (
          <button
            onClick={() => setShowEnableModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full hover:shadow-lg transition-all font-medium text-sm whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Enable Selling</span>
          </button>
        ) : canEnableClient ? (
          <button
            onClick={handleEnableClient}
            disabled={switching}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-full hover:shadow-lg transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {switching ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Enabling...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Enable Client Mode</span>
              </>
            )}
          </button>
        ) : null}
      </div>

      {/* Enable Provider Modal */}
      {showEnableModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Enable Provider Mode</h2>
              <button
                onClick={() => setShowEnableModal(false)}
                className="text-gray-400 hover:text-gray-600"
                disabled={switching}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Enable provider mode to offer your services and accept job requests from clients.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Verification Required</p>
                    <p>You'll need to complete verification before accepting jobs.</p>
                  </div>
                </div>
              </div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Provider Type *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setProviderType('Technical')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    providerType === 'Technical'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                >
                  <div className="text-2xl mb-2">💻</div>
                  <div className="font-semibold text-gray-900">Technical</div>
                  <div className="text-xs text-gray-600">IT, Development, Design</div>
                </button>

                <button
                  onClick={() => setProviderType('Non-Technical')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    providerType === 'Non-Technical'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                >
                  <div className="text-2xl mb-2">🔧</div>
                  <div className="font-semibold text-gray-900">Non-Technical</div>
                  <div className="text-xs text-gray-600">Plumbing, Cleaning, etc.</div>
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowEnableModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={switching}
              >
                Cancel
              </button>
              <button
                onClick={handleEnableProvider}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={switching}
              >
                {switching ? 'Enabling...' : 'Enable Provider Mode'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RoleToggle;
