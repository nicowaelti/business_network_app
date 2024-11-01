import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function AvailabilityPostDetail() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postDoc = await getDoc(doc(db, 'availabilityPosts', postId));
        if (postDoc.exists()) {
          setPost({ id: postDoc.id, ...postDoc.data() });
        }
      } catch (error) {
        console.error('Error fetching availability post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="text-center py-12">
          <p className="text-gray-500">Availability post not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Availability Post</h1>
          <div className="flex items-center space-x-4 text-gray-600">
            <span>Posted on {new Date(post.createdAt?.seconds * 1000).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-600 whitespace-pre-line">{post.description}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Availability Period</h2>
            <p className="text-gray-600">
              From: {post.availableFrom ? new Date(post.availableFrom).toLocaleDateString() : 'N/A'}
              <br />
              To: {post.availableUntil ? new Date(post.availableUntil).toLocaleDateString() : 'N/A'}
            </p>
          </div>

          {post.location && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Location</h2>
              <p className="text-gray-600">{post.location}</p>
            </div>
          )}

          {post.contactInfo && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Contact Information</h2>
              <p className="text-gray-600">{post.contactInfo}</p>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200">
            <Link 
              to={`/profile/${post.createdBy}`}
              className="text-indigo-600 hover:text-indigo-800"
            >
              View Creator's Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 