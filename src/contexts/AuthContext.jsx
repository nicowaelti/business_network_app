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
          setCurrentUser({
            ...user,
            profile
          });
        } catch (error) {
          console.error('Error loading user profile:', error);
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    isAdmin: currentUser?.profile?.role === 'admin', // Changed from hardcoded email to role check
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
