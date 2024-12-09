import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db, getUserProfile } from '../config/firebase';
import { Link } from 'react-router-dom';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

export default function AvailabilityPosts() {
  const { currentUser, isAdmin } = useAuth();
  const [availabilityPosts, setAvailabilityPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    fetchAvailabilityPosts();
    fetchUserProfile();
  }, []);

  const fetchAvailabilityPosts = async () => {
    try {
      const availabilityRef = collection(db, 'availabilityPosts');
      const availabilitySnapshot = await getDocs(query(availabilityRef, orderBy('createdAt', 'desc')));
      const availabilityList = availabilitySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAvailabilityPosts(availabilityList);
    } catch (error) {
      console.error('Error fetching availability posts:', error);
      alert('Verfügbare Kapazitäten konnten nicht geladen werden');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    if (currentUser) {
      try {
        const profile = await getUserProfile(currentUser.uid);
        setUserProfile(profile);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    }
  };

  const handleDelete = async (postId, createdBy) => {
    if (createdBy !== currentUser.uid && !isAdmin) {
      alert('Sie können nur Ihre eigenen Beiträge löschen.');
      return;
    }

    if (window.confirm('Sind Sie sicher, dass Sie diesen Beitrag löschen möchten?')) {
      try {
        setLoading(true);
        await deleteDoc(doc(db, 'availabilityPosts', postId));
        await fetchAvailabilityPosts();
        alert('Beitrag erfolgreich gelöscht!');
      } catch (error) {
        console.error('Error deleting availability post:', error);
        alert('Beitrag konnte nicht gelöscht werden. Bitte versuchen Sie es erneut.');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Verfügbare Kapazitäten</h1>
        <Link
          to="/availability-posts/new"
          className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200 flex items-center"
        >
          Neue Kapazität erstellen
        </Link>
      </div>

      <div className="space-y-6">
        {availabilityPosts.map((post) => (
          <div key={post.id} className="bg-white shadow-lg rounded-lg p-6 relative">
            {/* Edit/Delete Icons */}
            {(post.createdBy === currentUser.uid || isAdmin) && (
              <div className="absolute top-6 right-6 flex space-x-2">
                <Link
                  to={`/availability-posts/edit/${post.id}`}
                  className="text-blue-600 hover:text-blue-800"
                  title="Beitrag bearbeiten"
                >
                  <PencilIcon className="h-5 w-5" />
                </Link>
                <button
                  onClick={() => handleDelete(post.id, post.createdBy)}
                  className="text-red-600 hover:text-red-800"
                  title="Beitrag löschen"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* Main Content */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">{post.title}</h2>
              
              <div className="space-y-2 text-gray-600">
                <p>Verfügbar von {post.startDate} bis {post.endDate}</p>
                <p>Standort: {post.location}</p>
                <p>Kontakt: {post.contactEmail || post.contactPhone}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between mt-6">
                <Link 
                  to={`/profile/${post.createdBy}`}
                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Profil des Erstellers anzeigen
                </Link>
                <Link 
                  to={`/availability-posts/${post.id}`}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200 flex items-center"
                >
                  Details anzeigen <span className="ml-2">→</span>
                </Link>
              </div>
            </div>
          </div>
        ))}

        {availabilityPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Es sind noch keine Verfügbaren Kapazitäten vorhanden.</p>
          </div>
        )}
      </div>
    </div>
  );
}
