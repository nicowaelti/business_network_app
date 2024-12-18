import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  deleteUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  deleteDoc,
  collection
} from 'firebase/firestore';

// Force clear any existing Firebase apps
if (getApps().length) {
  console.log('Existing Firebase app found, removing...');
  getApps().forEach(app => app.delete());
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate configuration
console.log('Environment variables:', {
  VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  hasApiKey: !!import.meta.env.VITE_FIREBASE_API_KEY
});

// Log Firebase configuration (without sensitive data)
console.log('Firebase initialization with config:', {
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  hasApiKey: !!firebaseConfig.apiKey,
  storageBucket: firebaseConfig.storageBucket
});

// Validate bernernetzwercher configuration
if (firebaseConfig.projectId !== 'bernernetzwercher' || 
    !firebaseConfig.authDomain.includes('bernernetzwercher')) {
  console.error('Invalid Firebase project configuration. Expected bernernetzwercher project.');
  throw new Error('Invalid Firebase project configuration');
}

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully with project:', app.options.projectId);
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

const auth = getAuth(app);
const db = getFirestore(app);

// Authentication functions
export const loginUser = async (email, password) => {
  console.log('Attempting login with config:', {
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    email: email // don't log passwords
  });

  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log('Login successful for:', result.user.email);
    
    // Get user profile
    const profile = await getUserProfile(result.user.uid);
    console.log('Profile loaded:', profile ? 'success' : 'not found');

    if (!profile) {
      console.warn('No profile found for user:', result.user.email);
    }

    return result;
  } catch (error) {
    console.error('Login error:', {
      code: error.code,
      message: error.message,
      email: email,
      authConfig: {
        hasAuth: !!auth,
        authDomain: firebaseConfig.authDomain,
        projectId: firebaseConfig.projectId
      }
    });

    // Remap certain Firebase errors for better handling
    if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
      const newError = new Error('Invalid email or password');
      newError.code = 'auth/invalid-credential';
      throw newError;
    }

    throw error;
  }
};

export const registerUser = async (email, password, userType, isAdminCreating = false) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const userId = userCredential.user.uid;
    
    const initialProfile = {
      email,
      createdAt: new Date().toISOString(),
      profileType: userType === 'company' ? 'company' : 'freelancer',
      role: 'user',
      ...(userType === 'company' ? {
        companyName: '',
        industry: '',
        companySize: '',
        yearEstablished: '',
        website: '',
        services: '',
        products: ''
      } : {
        name: '',
        title: '',
        location: '',
        skills: [],
        experience: '',
        education: '',
        portfolio: ''
      })
    };

    await setDoc(doc(db, 'users', userId), initialProfile);
    return userCredential;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const logoutUser = () => {
  return signOut(auth);
};

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// User profile management
export const getUserProfile = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return null;
    }
    return userDoc.data();
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

export const updateUserProfile = async (userId, profileData) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      ...profileData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Admin functions
export const getAllUsers = async () => {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    return usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const updateUserRole = async (userId, newRole) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      role: newRole,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

export const deleteUserData = async (userId) => {
  try {
    await deleteDoc(doc(db, 'users', userId));
    return true;
  } catch (error) {
    console.error('Error deleting user data:', error);
    throw error;
  }
};

export const resetUserPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

// Export instances
export { auth, db };
