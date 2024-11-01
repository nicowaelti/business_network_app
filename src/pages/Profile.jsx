import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useParams, Navigate, useNavigate } from 'react-router-dom';

export default function Profile() {
  const { currentUser } = useAuth();
  const { userId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        setError('User ID is required');
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProfileData(docSnap.data());
        } else {
          // If it's the current user's profile and it doesn't exist, redirect to edit
          if (currentUser && userId === currentUser.uid) {
            navigate('/profile/edit');
            return;
          }
          setError('Profile not found. Please ensure you have completed your profile setup.');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, currentUser, navigate]);

  // Redirect to dashboard if userId is not available
  if (!userId) {
    return <Navigate to="/dashboard" replace />;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
          <p className="text-yellow-700">No profile data available. Please complete your profile setup.</p>
          {currentUser && userId === currentUser.uid && (
            <button
              onClick={() => navigate('/profile/edit')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create Profile
            </button>
          )}
        </div>
      </div>
    );
  }

  const FreelancerProfile = () => (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Full Name</label>
            <p className="mt-1">{profileData.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Title</label>
            <p className="mt-1">{profileData.title || 'Not specified'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Location</label>
            <p className="mt-1">{profileData.location || 'Not specified'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Email</label>
            <p className="mt-1">{profileData.email}</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Professional Details</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Skills</label>
            <div className="mt-1 flex flex-wrap gap-2">
              {profileData.skills?.map((skill, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {skill}
                </span>
              )) || 'No skills listed'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Experience</label>
            <p className="mt-1 whitespace-pre-line">{profileData.experience || 'No experience listed'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Education</label>
            <p className="mt-1">{profileData.education || 'No education listed'}</p>
          </div>
        </div>
      </div>

      {profileData.portfolio && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Portfolio</h2>
          <a href={profileData.portfolio} target="_blank" rel="noopener noreferrer" 
             className="text-blue-600 hover:text-blue-800">
            View Portfolio →
          </a>
        </div>
      )}
    </div>
  );

  const CompanyProfile = () => (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Company Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Company Name</label>
            <p className="mt-1">{profileData.companyName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Industry</label>
            <p className="mt-1">{profileData.industry || 'Not specified'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Company Size</label>
            <p className="mt-1">{profileData.companySize || 'Not specified'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Year Established</label>
            <p className="mt-1">{profileData.yearEstablished || 'Not specified'}</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Business Details</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Services</label>
            <p className="mt-1 whitespace-pre-line">{profileData.services || 'No services listed'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Products</label>
            <p className="mt-1 whitespace-pre-line">{profileData.products || 'No products listed'}</p>
          </div>
        </div>
      </div>

      {profileData.website && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Website</h2>
          <a href={profileData.website} target="_blank" rel="noopener noreferrer" 
             className="text-blue-600 hover:text-blue-800">
            Visit Website →
          </a>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          {profileData.profileType === 'company' ? profileData.companyName : profileData.name}
        </h1>
        {currentUser && userId === currentUser.uid && (
          <button
            onClick={() => navigate('/profile/edit')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Edit Profile
          </button>
        )}
      </div>
      <p className="text-gray-600 mt-2 mb-6">
        {profileData.profileType === 'company' ? 'Company Profile' : 'Freelancer Profile'}
      </p>

      {profileData.profileType === 'freelancer' ? <FreelancerProfile /> : <CompanyProfile />}
    </div>
  );
}
