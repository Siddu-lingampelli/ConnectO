import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { setCredentials } from '../../store/authSlice';
import { authService } from '../../services/authService';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
  initialRole?: 'client' | 'provider';
}

const RegisterForm = ({ onSuccess, onSwitchToLogin, initialRole = 'client' }: RegisterFormProps) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: initialRole as 'client' | 'provider',
    referralCode: '',
  });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      console.log('Registering with data:', {
        fullName: formData.fullName,
        email: formData.email,
        role: formData.role,
      });

      const response = await authService.register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        referralCode: formData.referralCode || undefined,
      });

      console.log('Registration response:', response);

      const { user, token } = response;
      dispatch(setCredentials({ user, token }));
      toast.success(`Welcome, ${user.fullName}!`);
      
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Registration error:', error);
      console.error('Error response:', error.response?.data);
      const message = error.response?.data?.message || error.message || 'Registration failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-[#0D2B1D] mb-2">
          Full Name
        </label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          required
          className="w-full px-4 py-2.5 border-2 border-[#AEC3B0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B8F71] focus:border-[#6B8F71] transition-all duration-300 bg-white hover:border-[#6B8F71]"
          placeholder="John Doe"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#0D2B1D] mb-2">
          Email Address
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-2.5 border-2 border-[#AEC3B0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B8F71] focus:border-[#6B8F71] transition-all duration-300 bg-white hover:border-[#6B8F71]"
          placeholder="your.email@example.com"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#0D2B1D] mb-2">
          I want to
        </label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full px-4 py-2.5 border-2 border-[#AEC3B0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B8F71] focus:border-[#6B8F71] transition-all duration-300 bg-white hover:border-[#6B8F71] font-medium text-[#345635]"
        >
          <option value="client">🔍 Find Services (I'm a Client)</option>
          <option value="provider">💼 Offer Services (I'm a Provider)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#0D2B1D] mb-2">
          Password
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full px-4 py-2.5 border-2 border-[#AEC3B0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B8F71] focus:border-[#6B8F71] transition-all duration-300 bg-white hover:border-[#6B8F71]"
          placeholder="••••••••"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#0D2B1D] mb-2">
          Confirm Password
        </label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          className="w-full px-4 py-2.5 border-2 border-[#AEC3B0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B8F71] focus:border-[#6B8F71] transition-all duration-300 bg-white hover:border-[#6B8F71]"
          placeholder="••••••••"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#0D2B1D] mb-2 flex items-center gap-2">
          Referral Code 
          <span className="text-xs text-[#6B8F71] font-normal">(Optional)</span>
          <span className="text-[#345635]">🎁</span>
        </label>
        <input
          type="text"
          name="referralCode"
          value={formData.referralCode}
          onChange={handleChange}
          className="w-full px-4 py-2.5 border-2 border-[#AEC3B0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B8F71] focus:border-[#6B8F71] transition-all duration-300 bg-white hover:border-[#6B8F71]"
          placeholder="Enter referral code (e.g., ABC123)"
          maxLength={8}
        />
        <p className="text-xs text-[#6B8F71] mt-1.5">
          Have a referral code? Enter it to earn bonus rewards! 🎉
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-[#0D2B1D] to-[#345635] text-white py-3 rounded-xl hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg hover:scale-[1.02] active:scale-[0.98] mt-6"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating account...
          </span>
        ) : (
          'Create Account'
        )}
      </button>

      {onSwitchToLogin && (
        <p className="text-center text-sm text-[#345635] pt-2">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-[#0D2B1D] hover:text-[#345635] font-semibold hover:underline transition-colors"
          >
            Login here
          </button>
        </p>
      )}
    </form>
  );
};

export default RegisterForm;
