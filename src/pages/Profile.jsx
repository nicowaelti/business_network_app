import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { MdEmail } from 'react-icons/md';

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
        setError('Benutzer-ID ist erforderlich');
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
          setError('Profil nicht gefunden. Bitte stellen Sie sicher, dass Sie Ihr Profil vollständig eingerichtet haben.');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Profildaten konnten nicht geladen werden');
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
          <p className="text-yellow-700">Keine Profildaten verfügbar. Bitte vervollständigen Sie Ihre Profileinrichtung.</p>
          {currentUser && userId === currentUser.uid && (
            <button
              onClick={() => navigate('/profile/edit')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Profil erstellen
            </button>
          )}
        </div>
      </div>
    );
  }

  const FreelancerProfile = () => (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Persönliche Informationen</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Vollständiger Name</label>
            <p className="mt-1">{profileData.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Titel</label>
            <p className="mt-1">{profileData.title || 'Nicht angegeben'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Standort</label>
            <p className="mt-1">{profileData.location || 'Nicht angegeben'}</p>
          </div>
          <div className="flex items-center">
            <label className="block text-sm font-medium text-gray-600 mr-2">E-Mail</label>
            <a 
              href={`mailto:${profileData.email}`} 
              className="flex items-center text-green-600 hover:text-green-800 text-sm"
            >
              <MdEmail className="mr-1" /> {profileData.email}
            </a>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Berufliche Details</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Fähigkeiten</label>
            <div className="mt-1 flex flex-wrap gap-2">
              {profileData.skills?.map((skill, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {skill}
                </span>
              )) || 'Keine Fähigkeiten aufgelistet'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Erfahrung</label>
            <p className="mt-1 whitespace-pre-line">{profileData.experience || 'Keine Erfahrung aufgelistet'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Ausbildung</label>
            <p className="mt-1">{profileData.education || 'Keine Ausbildung aufgelistet'}</p>
          </div>
        </div>
      </div>

      {profileData.portfolio && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Portfolio</h2>
          <a href={profileData.portfolio} target="_blank" rel="noopener noreferrer" 
             className="text-blue-600 hover:text-blue-800">
            Portfolio ansehen →
          </a>
        </div>
      )}
    </div>
  );

  const CompanyProfile = () => (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Unternehmensinformationen</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Firmenname</label>
            <p className="mt-1">{profileData.companyName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Branche</label>
            <p className="mt-1">{profileData.industry || 'Nicht angegeben'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Unternehmensgröße</label>
            <p className="mt-1">{profileData.companySize || 'Nicht angegeben'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Gründungsjahr</label>
            <p className="mt-1">{profileData.yearEstablished || 'Nicht angegeben'}</p>
          </div>
          <div className="col-span-full flex items-center">
            <label className="block text-sm font-medium text-gray-600 mr-2">E-Mail</label>
            <a 
              href={`mailto:${profileData.email}`} 
              className="flex items-center text-green-600 hover:text-green-800 text-sm"
            >
              <MdEmail className="mr-1" /> {profileData.email}
            </a>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Geschäftsdetails</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Dienstleistungen</label>
            <p className="mt-1 whitespace-pre-line">{profileData.services || 'Keine Dienstleistungen aufgelistet'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Produkte</label>
            <p className="mt-1 whitespace-pre-line">{profileData.products || 'Keine Produkte aufgelistet'}</p>
          </div>
        </div>
      </div>

      {profileData.website && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Webseite</h2>
          <a href={profileData.website} target="_blank" rel="noopener noreferrer" 
             className="text-blue-600 hover:text-blue-800">
            Webseite besuchen →
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
            Profil bearbeiten
          </button>
        )}
      </div>
      <p className="text-gray-600 mt-2 mb-6">
        {profileData.profileType === 'company' ? 'Unternehmensprofil' : 'Freiberuflerprofil'}
      </p>

      {profileData.profileType === 'freelancer' ? <FreelancerProfile /> : <CompanyProfile />}
    </div>
  );
}
