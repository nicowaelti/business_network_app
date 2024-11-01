import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Link } from 'react-router-dom';

export default function AvailabilityPosts() {
  const { currentUser } = useAuth();
  const [availabilityPosts, setAvailabilityPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
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
      const availabilitySnapshot = await getDocs(
        query(
          availabilityRef, 
          orderBy('createdAt', 'desc'),
          limit(5)
        )
      );
      const availabilityList = availabilitySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAvailabilityPosts(availabilityList);
    } catch (error) {
      console.error('Error fetching availability posts:', error);
      alert('Failed to load availability posts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const availabilityRef = collection(db, 'availabilityPosts');
      await addDoc(availabilityRef, {
        ...formData,
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
      });

      setFormData({
        description: '',
        availableFrom: '',
        availableUntil: '',
        location: '',
        contactInfo: ''
      });
      setShowForm(false);
      await fetchAvailabilityPosts();
      alert('Availability post created successfully!');
    } catch (error) {
      console.error('Error creating availability post:', error);
      alert('Failed to create availability post. Please try again.');
    } finally {
      setLoading(false);
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
        <h1 className="text-2xl font-bold">Latest Availability Posts</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          {showForm ? 'Cancel' : 'Create Availability Post'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create New Availability Post</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Available From</label>
              <input
                type="date"
                value={formData.availableFrom}
                onChange={(e) => setFormData(prev => ({ ...prev, availableFrom: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Available Until</label>
              <input
                type="date"
                value={formData.availableUntil}
                onChange={(e) => setFormData(prev => ({ ...prev, availableUntil: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Information</label>
              <input
                type="text"
                value={formData.contactInfo}
                onChange={(e) => setFormData(prev => ({ ...prev, contactInfo: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
              >
                {loading ? 'Posting...' : 'Post Availability'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-6">
        {availabilityPosts.map((post) => (
          <div key={post.id} className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">{post.description}</h3>
            <p className="text-sm text-gray-600 mb-2">
              Available from {post.availableFrom ? new Date(post.availableFrom).toLocaleDateString() : 'N/A'} to {post.availableUntil ? new Date(post.availableUntil).toLocaleDateString() : 'N/A'}
            </p>
            <p className="text-sm text-gray-600 mb-2">Location: {post.location || 'N/A'}</p>
            <p className="text-sm text-gray-600">Contact: {post.contactInfo || 'N/A'}</p>
            <Link to={`/profile/${post.createdBy}`} className="text-indigo-600 hover:text-indigo-800 text-sm">
              View Creator's Profile
            </Link>
          </div>
        ))}

        {availabilityPosts.length === 0 && !showForm && (
          <div className="text-center py-12">
            <p className="text-gray-500">No availability posts yet. Be the first to post your availability!</p>
          </div>
        )}
      </div>
    </div>
  );
}
