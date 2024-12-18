import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { AdminRoute } from './routes/AdminRoute';
import { PublicRoute } from './routes/PublicRoute';
import { Dashboard } from './components/dashboard/Dashboard';

// Import pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Jobs from './pages/Jobs';
import Companies from './pages/Companies';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import AvailabilityPosts from './pages/AvailabilityPosts';
import CreateAvailabilityPost from './pages/CreateAvailabilityPost';
import Events from './pages/Events';
import JobDetail from './pages/JobDetail';
import AvailabilityPostDetail from './pages/AvailabilityPostDetail';
import Admin from './pages/Admin';
import Impressum from './pages/Impressum';

function App() {
  // Get the base URL from the environment or default to '/'
  const baseUrl = import.meta.env.BASE_URL || '/';

  return (
    <Router basename={baseUrl}>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route 
            path="/forgot-password" 
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />
          <Route 
            path="/impressum" 
            element={
              <PublicRoute>
                <Impressum />
              </PublicRoute>
            }
          />
          
          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/create-user"
            element={
              <AdminRoute>
                <Register isAdminCreating={true} />
              </AdminRoute>
            }
          />

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
            path="/jobs/:jobId"
            element={
              <ProtectedRoute>
                <JobDetail />
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
            path="/profile/edit"
            element={
              <ProtectedRoute>
                <EditProfile />
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
            path="/availability-posts"
            element={
              <ProtectedRoute>
                <AvailabilityPosts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/availability-posts/new"
            element={
              <ProtectedRoute>
                <CreateAvailabilityPost />
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
          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <Events />
              </ProtectedRoute>
            }
          />
          
          {/* Root Route */}
          <Route
            path="/"
            element={<Navigate to="/login" replace />}
          />
          
          {/* Catch all route - redirect to login */}
          <Route
            path="*"
            element={<Navigate to="/login" replace />}
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
