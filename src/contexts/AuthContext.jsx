import { createContext, useContext, useState, useEffect } from 'react';
import { auth, getUserProfile } from '../config/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log('Auth state changed:', user?.email);
      
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          console.log('User profile loaded:', profile);
          
          if (!profile) {
            console.warn('No profile found for authenticated user:', user.email);
          }
          
          setCurrentUser({
            ...user,
            profile
          });
        } catch (error) {
          console.error('Error loading user profile:', error);
          // Still set the user even if profile loading fails
          setCurrentUser(user);
        }
      } else {
        console.log('User logged out or no user found');
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    isAdmin: currentUser?.profile?.role === 'admin',
    isCompany: currentUser?.profile?.profileType === 'company',
    loading
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
