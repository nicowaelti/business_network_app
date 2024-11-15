import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyD8S5f73kP_yetXxV2giOe6d1Uc_i8Fcnw",
  authDomain: "bernernetzwercher.firebaseapp.com",
  projectId: "bernernetzwercher",
  storageBucket: "bernernetzwercher.firebasestorage.app",
  messagingSenderId: "13747122879",
  appId: "1:13747122879:web:5e53600eed814d3cba0c0a",
  measurementId: "G-SWEGYQ24MB"
};

console.log('Initializing Firebase with config:', firebaseConfig);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Enable offline persistence for Firestore
if (import.meta.env.PROD) {
  enableIndexedDbPersistence(db)
    .catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
      } else if (err.code === 'unimplemented') {
        console.warn('The current browser does not support persistence.');
      }
    });
}

// Initialize Analytics only in production
let analytics = null;
if (import.meta.env.PROD) {
  analytics = getAnalytics(app);
}

// Authentication functions
export const loginUser = async (email, password) => {
  console.log('Attempting to log in user:', email);
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log('Login successful:', result.user.uid);
    return result;
  } catch (error) {
    console.error('Login error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
};

export const registerUser = async (email, password, userType) => {
  console.log('Attempting to register user:', { email, userType });
  try {
    // Create the user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('User created successfully:', userCredential.user.uid);
    
    // Create initial profile data
    const userId = userCredential.user.uid;
    const initialProfile = {
      email,
      createdAt: new Date().toISOString(),
      profileType: userType === 'company' ? 'company' : 'freelancer',
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

    // Save profile to Firestore
    await setDoc(doc(db, 'users', userId), initialProfile);
    console.log('User profile created in Firestore');

    return userCredential;
  } catch (error) {
    console.error('Registration error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
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
    return userDoc.exists() ? userDoc.data() : null;
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

// Export instances
export { auth, db };
