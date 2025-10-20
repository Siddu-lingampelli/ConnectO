import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { selectCurrentUser, updateUser } from '../../store/authSlice';
import { userService } from '../../services/userService';
import type { User } from '../../types';
import BasicInfoStep from './steps/BasicInfoStep';
import ServicesStep from './steps/ServicesStep';
import SkillsStep from './steps/SkillsStep';
import DocumentsStep from './steps/DocumentsStep';
import PreferencesStep from './steps/PreferencesStep';
import LocationStep from './steps/LocationStep';

interface ProfileData {
  // Basic Info
  phone?: string;
  city?: string;
  area?: string;
  bio?: string;
  profilePicture?: string;
  
  // Provider specific
  services?: string[];
  skills?: string[];
  experience?: number;
  hourlyRate?: number;
  availability?: string[];
  
  // Documents (Provider)
  documents?: {
    idProof?: string;
    addressProof?: string;
    certifications?: string[];
  };
  
  // Client specific
  preferences?: {
    categories?: string[];
    budget?: string;
    communicationPreference?: string;
  };
  
  // Location
  address?: string;
  landmark?: string;
  pincode?: string;
}

interface ProfileCompletionProps {
  initialData?: Partial<User>;
  onComplete?: () => void;
  isEditing?: boolean;
}

const ProfileCompletion = ({ initialData, onComplete, isEditing = false }: ProfileCompletionProps) => {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const isProvider = user?.role === 'provider';
  
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState<ProfileData>({});
  const [loading, setLoading] = useState(false);

  // Initialize with existing data when editing
  useEffect(() => {
    if (initialData) {
      setProfileData({
        phone: initialData.phone,
        city: initialData.city,
        area: initialData.area,
        bio: initialData.bio,
        profilePicture: initialData.profilePicture,
        services: initialData.services,
        skills: initialData.skills,
        experience: initialData.experience ? parseInt(initialData.experience) : undefined,
        hourlyRate: initialData.hourlyRate,
        availability: initialData.availability ? [initialData.availability] : [],
        documents: initialData.documents,
        preferences: initialData.preferences,
        address: initialData.address,
        landmark: initialData.landmark,
        pincode: initialData.pincode,
      });
    }
  }, [initialData]);

  // Provider: 4 steps, Client: 3 steps
  const totalSteps = isProvider ? 4 : 3;

  const steps = isProvider
    ? [
        { id: 1, title: 'Basic Info', icon: '👤' },
        { id: 2, title: 'Services', icon: '💼' },
        { id: 3, title: 'Skills & Rate', icon: '⭐' },
        { id: 4, title: 'Documents', icon: '📄' },
      ]
    : [
        { id: 1, title: 'Basic Info', icon: '👤' },
        { id: 2, title: 'Preferences', icon: '⚙️' },
        { id: 3, title: 'Location', icon: '📍' },
      ];

  const handleNext = (stepData: Partial<ProfileData>) => {
    setProfileData({ ...profileData, ...stepData });
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async (finalData: Partial<ProfileData>) => {
    setLoading(true);
    try {
      const mergedData = { ...profileData, ...finalData };
      
      // Prepare data for API (convert types if needed)
      const completeData: any = {
        ...mergedData,
        profileCompleted: true,
      };
      
      // Convert experience to string if it's a number
      if (typeof completeData.experience === 'number') {
        completeData.experience = completeData.experience.toString();
      }
      
      console.log('📤 Sending profile data to MongoDB via backend:', completeData);
      
      // ✅ PRODUCTION: Save to MongoDB via API
      // API calls backend → Backend saves to MongoDB
      const updatedUser = await userService.updateProfile(completeData);
      console.log('✅ Profile saved to MongoDB:', updatedUser);
      
      // ✅ Update Redux store (auto-saves to localStorage as cache)
      dispatch(updateUser(updatedUser));
      
      toast.success(isEditing ? 'Profile updated successfully! 🎉' : 'Profile saved to MongoDB successfully! 🎉');
      
      // Call onComplete callback if provided (for editing mode)
      if (onComplete) {
        onComplete();
      } else {
        // Small delay to show success message before redirect (for new completion)
        setTimeout(() => {
          window.location.href = '/profile';
        }, 1000);
      }
    } catch (error: any) {
      console.error('❌ MongoDB save error:', error);
      toast.error(error.response?.data?.message || 'Failed to save profile to MongoDB');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    if (isProvider) {
      switch (currentStep) {
        case 1:
          return (
            <BasicInfoStep
              data={profileData}
              onNext={handleNext}
              onBack={handleBack}
              isFirstStep
            />
          );
        case 2:
          return (
            <ServicesStep
              data={profileData}
              onNext={handleNext}
              onBack={handleBack}
            />
          );
        case 3:
          return (
            <SkillsStep
              data={profileData}
              onNext={handleNext}
              onBack={handleBack}
            />
          );
        case 4:
          return (
            <DocumentsStep
              data={profileData}
              onComplete={handleComplete}
              onBack={handleBack}
              loading={loading}
            />
          );
        default:
          return null;
      }
    } else {
      // Client steps
      switch (currentStep) {
        case 1:
          return (
            <BasicInfoStep
              data={profileData}
              onNext={handleNext}
              onBack={handleBack}
              isFirstStep
            />
          );
        case 2:
          return (
            <PreferencesStep
              data={profileData}
              onNext={handleNext}
              onBack={handleBack}
            />
          );
        case 3:
          return (
            <LocationStep
              data={profileData}
              onComplete={handleComplete}
              onBack={handleBack}
              loading={loading}
            />
          );
        default:
          return null;
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Complete Your Profile
        </h1>
        <p className="text-gray-600">
          {isProvider
            ? 'Set up your professional profile to start offering services'
            : 'Complete your profile to start finding service providers'}
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-xl mb-2 transition-all ${
                    currentStep === step.id
                      ? 'bg-blue-600 text-white scale-110'
                      : currentStep > step.id
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {currentStep > step.id ? '✓' : step.icon}
                </div>
                <div
                  className={`text-sm font-medium ${
                    currentStep === step.id
                      ? 'text-blue-600'
                      : currentStep > step.id
                      ? 'text-green-600'
                      : 'text-gray-500'
                  }`}
                >
                  {step.title}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-2 rounded ${
                    currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Step {currentStep} of {totalSteps}</span>
          <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        {renderStep()}
      </div>

      {/* Help Text */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>
          Need help? Contact support at{' '}
          <a href="mailto:support@vsconnecto.com" className="text-blue-600 hover:underline">
            support@vsconnecto.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default ProfileCompletion;
