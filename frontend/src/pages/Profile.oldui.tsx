import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../store/authSlice';
import { userService } from '../services/userService';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ProfileView from '../components/profile/ProfileView';
import PublicProfile from '../components/profile/PublicProfile';
import type { User } from '../types';

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // If viewing own profile
  const isOwnProfile = !userId || userId === currentUser?.id;

  // Fetch other user's profile
  useEffect(() => {
    if (!isOwnProfile && userId) {
      const fetchUser = async () => {
        try {
          setLoading(true);
          const user = await userService.getUserById(userId);
          setViewingUser(user);
        } catch (error) {
          console.error('Error fetching user:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    }
  }, [userId, isOwnProfile]);

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#E3EFD3] via-white to-[#F8FBF9]">
        <Header />
        <main className="flex-1 w-full">\n        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
          <div className="text-center animate-fade-in-up">
            <div className="w-20 h-20 bg-gradient-to-br from-[#6B8F71] to-[#AEC3B0] rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse-soft">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <p className="text-[#345635] text-lg font-medium">Please login to view profile.</p>
          </div>
        </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#E3EFD3] via-white to-[#F8FBF9]">
      <Header />
      <main className="flex-1 w-full">\n        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button - Only show on public profiles */}
        {!isOwnProfile && (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-[#345635] hover:text-[#0D2B1D] mb-6 transition-all hover:scale-105 font-medium group"
          >
            <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            ? Back
          </button>
        )}

        {isOwnProfile ? (
          <ProfileView user={currentUser} />
        ) : loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center animate-fade-in-up">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#E3EFD3] border-t-[#345635] mx-auto mb-4"></div>
              <p className="text-[#345635] font-medium">Loading profile...</p>
            </div>
          </div>
        ) : viewingUser ? (
          <PublicProfile user={viewingUser} currentUser={currentUser} />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">User not found</p>
          </div>
        )}
      </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;

