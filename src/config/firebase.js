import { initializeApp } from 'firebase/app';
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
  collection,
  query,
  where,
  enableIndexedDbPersistence 
} from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Hardcode the correct configuration for now to ensure it's using the right project
const firebaseConfig = {
  apiKey: "AIzaSyD8S5f73kP_yetXxV2giOe6d1Uc_i8Fcnw",
  authDomain: "bernernetzwercher.firebaseapp.com",
  projectId: "bernernetzwercher",
  storageBucket: "bernernetzwercher.firebasestorage.app",
  messagingSenderId: "13747122879",
  appId: "1:13747122879:web:5e53600eed814d3cba0c0a",
  measurementId: "G-SWEGYQ24MB"
};

console.log('Firebase initialization with config:', {
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Authentication functions
export const loginUser = async (email, password) => {
  try {
    console.log('Attempting login with Firebase config:', {
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId
    });
    
    // Attempt login
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log('Login successful, user:', result?.user?.email);

    // Get user profile
    const profile = await getUserProfile(result.user.uid);
    console.log('Profile loaded:', profile ? 'success' : 'not found');

    return result;
  } catch (error) {
    console.error('Login error details:', {
      code: error.code,
      message: error.message,
      config: {
        authDomain: firebaseConfig.authDomain,
        projectId: firebaseConfig.projectId
      }
    });
    throw error;
  }
};

export const registerUser = async (email, password, userType) => {
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
    console.error('Registration error:', error.message);
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
    console.error('Error getting user profile:', error.message);
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
    console.error('Error updating user profile:', error.message);
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
    console.error('Error fetching users:', error.message);
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
    console.error('Error updating user role:', error.message);
    throw error;
  }
};

export const deleteUserData = async (userId) => {
  try {
    await deleteDoc(doc(db, 'users', userId));
    return true;
  } catch (error) {
    console.error('Error deleting user data:', error.message);
    throw error;
  }
};

export const resetUserPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error.message);
    throw error;
  }
};

// Export instances
export { auth, db };
