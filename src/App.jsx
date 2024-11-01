import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Jobs from './pages/Jobs';
import Companies from './pages/Companies';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import AvailabilityPosts from './pages/AvailabilityPosts';
import Events from './pages/Events';
import JobDetail from './pages/JobDetail';
import AvailabilityPostDetail from './pages/AvailabilityPostDetail';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from './config/firebase';
import { useState, useEffect } from 'react';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return <Layout>{children}</Layout>;
};

// Dashboard Component
const Dashboard = () => {
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentAvailability, setRecentAvailability] = useState([]);
  const [futureEvents, setFutureEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentData = async () => {
      try {
        // Fetch future events
        const eventsRef = collection(db, 'events');
        const eventsQuery = query(
          eventsRef,
          where('date', '>=', new Date().toISOString().split('T')[0]), // Only future events
          orderBy('date', 'asc')
        );
        const eventsSnapshot = await getDocs(eventsQuery);
        const eventsList = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFutureEvents(eventsList);

        // Fetch recent jobs
        const jobsRef = collection(db, 'jobs');
        const jobsQuery = query(
          jobsRef,
          where('createdAt', '>=', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)),
          orderBy('createdAt', 'desc')
        );
        const jobsSnapshot = await getDocs(jobsQuery);
        const jobsList = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRecentJobs(jobsList);

        // Fetch recent availability posts
        const availabilityRef = collection(db, 'availabilityPosts');
        const availabilityQuery = query(
          availabilityRef,
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const availabilitySnapshot = await getDocs(availabilityQuery);
        const availabilityList = availabilitySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRecentAvailability(availabilityList);

      } catch (error) {
        console.error('Error fetching recent data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-6">
      <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>

      <div className="mb-8 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold mb-2 text-blue-800">Upcoming Events</h3>
        {futureEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {futureEvents.map(event => (
              <div key={event.id} className="bg-white shadow-md rounded-lg p-4">
                <h4 className="text-lg font-semibold">{event.title}</h4>
                <p className="text-sm text-gray-600">{new Date(event.date).toLocaleDateString()} • {event.location}</p>
                <p className="text-sm text-gray-600">{event.description}</p>
                <div className="mt-2">
                  <Link to={`/profile/${event.createdBy}`} className="text-indigo-600 hover:text-indigo-800 text-sm">
                    View Creator's Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No upcoming events.</p>
        )}
      </div>
      
      <div className="mb-8 p-4 bg-green-50 border-l-4 border-green-400 rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold mb-2 text-green-800">New Job Posts</h3>
        {recentJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentJobs.map(job => (
              <div key={job.id} className="bg-white shadow-md rounded-lg p-4">
                <h4 className="text-lg font-semibold">{job.title}</h4>
                <p className="text-sm text-gray-600">{job.companyName} • {job.location}</p>
                <p className="text-sm text-gray-600">{new Date(job.createdAt?.seconds * 1000).toLocaleDateString()}</p>
                <div className="mt-2">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {job.type}
                  </span>
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full ml-2">
                    {job.remoteType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600 line-clamp-3">{job.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <Link to={`/profile/${job.createdBy}`} className="text-indigo-600 hover:text-indigo-800 text-sm">
                    View Creator's Profile
                  </Link>
                  <Link 
                    to={`/jobs/${job.id}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No new job posts in the last 14 days.</p>
        )}
      </div>

      <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold mb-2 text-yellow-800">Recent Availability Posts</h3>
        {recentAvailability.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentAvailability.map(post => (
              <div key={post.id} className="bg-white shadow-md rounded-lg p-4">
                <h4 className="text-lg font-semibold mb-2">{post.description}</h4>
                <p className="text-sm text-gray-600">
                  Available from {post.availableFrom ? new Date(post.availableFrom).toLocaleDateString() : 'N/A'} to {post.availableUntil ? new Date(post.availableUntil).toLocaleDateString() : 'N/A'}
                </p>
                <p className="text-sm text-gray-600">Location: {post.location || 'N/A'}</p>
                <p className="text-sm text-gray-600">Contact: {post.contactInfo || 'N/A'}</p>
                <div className="mt-4 flex items-center justify-between">
                  <Link to={`/profile/${post.createdBy}`} className="text-indigo-600 hover:text-indigo-800 text-sm">
                    View Creator's Profile
                  </Link>
                  <Link 
                    to={`/availability-posts/${post.id}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No recent availability posts.</p>
        )}
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs"
            element={
              <ProtectedRoute>
                <Jobs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/companies"
            element={
              <ProtectedRoute>
                <Companies />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:userId"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/edit"
            element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/availability-posts"
            element={
              <ProtectedRoute>
                <AvailabilityPosts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <Events />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs/:jobId"
            element={
              <ProtectedRoute>
                <JobDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/availability-posts/:postId"
            element={
              <ProtectedRoute>
                <AvailabilityPostDetail />
              </ProtectedRoute>
            }
          />
          
          {/* Redirect root to dashboard if logged in, otherwise to login */}
          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />
          
          {/* Catch all route - redirect to dashboard */}
          <Route
            path="*"
            element={<Navigate to="/dashboard" replace />}
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
