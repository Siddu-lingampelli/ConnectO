import { useState, useEffect } from 'react';
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
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <p className="text-gray-600">Please login to view profile.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Back Button - Only show on public profiles */}
        {!isOwnProfile && (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            ← Back
          </button>
        )}

        {isOwnProfile ? (
          <ProfileView user={currentUser} />
        ) : loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading profile...</p>
            </div>
          </div>
        ) : viewingUser ? (
          <PublicProfile user={viewingUser} currentUser={currentUser} />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">User not found</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
