import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Link } from 'react-router-dom';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

export default function AvailabilityPosts() {
  const { currentUser, isAdmin } = useAuth();
  const [availabilityPosts, setAvailabilityPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    availableFrom: '',
    availableUntil: '',
    location: '',
    contactInfo: ''
  });

  useEffect(() => {
    fetchAvailabilityPosts();
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
      alert('Verfügbarkeitsbeiträge konnten nicht geladen werden');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setFormData({
      description: post.description,
      availableFrom: post.availableFrom,
      availableUntil: post.availableUntil,
      location: post.location || '',
      contactInfo: post.contactInfo || ''
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (postId, createdBy) => {
    // Allow deletion if user is creator or admin
    if (createdBy !== currentUser.uid && !isAdmin) {
      alert('Sie können nur Ihre eigenen Beiträge löschen.');
      return;
    }

    if (window.confirm('Sind Sie sicher, dass Sie diesen Verfügbarkeitsbeitrag löschen möchten?')) {
      try {
        setLoading(true);
        await deleteDoc(doc(db, 'availabilityPosts', postId));
        await fetchAvailabilityPosts();
        alert('Beitrag erfolgreich gelöscht!');
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Beitrag konnte nicht gelöscht werden. Bitte versuchen Sie es erneut.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingPost) {
        // Update existing post
        const postRef = doc(db, 'availabilityPosts', editingPost.id);
        await updateDoc(postRef, {
          ...formData,
          updatedAt: serverTimestamp(),
        });
        alert('Beitrag erfolgreich aktualisiert!');
      } else {
        // Create new post
        const availabilityRef = collection(db, 'availabilityPosts');
        await addDoc(availabilityRef, {
          ...formData,
          createdBy: currentUser.uid,
          createdAt: serverTimestamp(),
        });
        alert('Beitrag erfolgreich erstellt!');
      }

      setFormData({
        description: '',
        availableFrom: '',
        availableUntil: '',
        location: '',
        contactInfo: ''
      });
      setShowForm(false);
      setEditingPost(null);
      await fetchAvailabilityPosts();
    } catch (error) {
      console.error('Fehler beim Speichern des Beitrags:', error);
      alert('Beitrag konnte nicht gespeichert werden. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      description: '',
      availableFrom: '',
      availableUntil: '',
      location: '',
      contactInfo: ''
    });
    setShowForm(false);
    setEditingPost(null);
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
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Beitrag erstellen
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingPost ? 'Beitrag zur Verfügbarkeit bearbeiten' : 'Neuen Beitrag zur Verfügbarkeit erstellen'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Beschreibung</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Verfügbar von</label>
              <input
                type="date"
                value={formData.availableFrom}
                onChange={(e) => setFormData(prev => ({ ...prev, availableFrom: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Verfügbar bis</label>
              <input
                type="date"
                value={formData.availableUntil}
                onChange={(e) => setFormData(prev => ({ ...prev, availableUntil: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Standort</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Kontaktinformationen</label>
              <input
                type="text"
                value={formData.contactInfo}
                onChange={(e) => setFormData(prev => ({ ...prev, contactInfo: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div className="pt-4 flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
              >
                {loading ? 'Wird gespeichert...' : (editingPost ? 'Beitrag aktualisieren' : 'Beitrag erstellen')}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-6">
        {availabilityPosts.map((post) => (
          <div key={post.id} className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold mb-2">{post.description}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Verfügbar von {post.availableFrom ? new Date(post.availableFrom).toLocaleDateString() : 'N/A'} 
                  bis {post.availableUntil ? new Date(post.availableUntil).toLocaleDateString() : 'N/A'}
                </p>
                <p className="text-sm text-gray-600 mb-2">Standort: {post.location || 'N/A'}</p>
                <p className="text-sm text-gray-600">Kontakt: {post.contactInfo || 'N/A'}</p>
              </div>
              {(post.createdBy === currentUser.uid || isAdmin) && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(post)}
                    className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50"
                    title="Beitrag bearbeiten"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(post.id, post.createdBy)}
                    className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50"
                    title="Beitrag löschen"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <Link to={`/profile/${post.createdBy}`} className="text-indigo-600 hover:text-indigo-800 text-sm">
                Profil des Erstellers anzeigen
              </Link>
              <Link 
                to={`/availability-posts/${post.id}`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Details anzeigen →
              </Link>
            </div>
          </div>
        ))}

        {availabilityPosts.length === 0 && !showForm && (
          <div className="text-center py-12">
            <p className="text-gray-500">Es sind noch keine Verfügbarkeitsbeiträge vorhanden. Seien Sie der Erste, der seine Verfügbarkeit postet!</p>
          </div>
        )}
      </div>
    </div>
  );
}
