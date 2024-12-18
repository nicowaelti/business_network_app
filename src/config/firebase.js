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
  collection
} from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD8S5f73kP_yetXxV2giOe6d1Uc_i8Fcnw",
  authDomain: "bernernetzwercher.firebaseapp.com",
  projectId: "bernernetzwercher",
  storageBucket: "bernernetzwercher.appspot.com",
  messagingSenderId: "13747122879",
  appId: "1:13747122879:web:5e53600eed814d3cba0c0a",
  measurementId: "G-SWEGYQ24MB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Authentication functions
export const loginUser = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const profile = await getUserProfile(result.user.uid);
    return result;
  } catch (error) {
    console.error('Login error:', error);
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
