import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  deleteUser,
  browserLocalPersistence,
  setPersistence
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

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

console.log('Firebase initialization with config:', {
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  apiKey: firebaseConfig.apiKey ? 'present' : 'missing',
  storageBucket: firebaseConfig.storageBucket
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Set persistence to local to help with Safari
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('Firebase persistence set to local');
  })
  .catch((error) => {
    console.error('Error setting persistence:', error);
  });

const db = getFirestore(app);

// Enable offline persistence for Firestore
enableIndexedDbPersistence(db)
  .then(() => {
    console.log('Firestore persistence enabled');
  })
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support persistence.');
    }
  });

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

export const registerUser = async (email, password, userType, isAdminCreating = false) => {
  console.log('Starting user registration:', { 
    email, 
    userType, 
    isAdminCreating,
    authConfig: {
      apiKey: firebaseConfig.apiKey ? 'present' : 'missing',
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId
    }
  });
  
  try {
    // Create the user in Firebase Auth
    console.log('Attempting to create user in Firebase Auth...');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('User created successfully in Auth:', userCredential.user.uid);
    
    const userId = userCredential.user.uid;
    
    // Prepare the initial profile
    const initialProfile = {
      email,
      createdAt: new Date().toISOString(),
      profileType: userType === 'company' ? 'company' : 'freelancer',
      role: 'user', // Default role is user
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

    console.log('Creating user profile in Firestore...');

    try {
      // Create the user profile in Firestore
      await setDoc(doc(db, 'users', userId), initialProfile);
      console.log('User profile created successfully in Firestore');
    } catch (firestoreError) {
      console.error('Firestore profile creation error:', {
        code: firestoreError.code,
        message: firestoreError.message,
        details: firestoreError
      });
      
      // If Firestore fails, we should delete the auth user to maintain consistency
      try {
        console.log('Rolling back auth user creation...');
        await deleteUser(userCredential.user);
        console.log('Auth user deleted successfully during rollback');
      } catch (rollbackError) {
        console.error('Error during auth user rollback:', rollbackError);
      }
      
      throw firestoreError;
    }

    return userCredential;
  } catch (error) {
    console.error('Registration error details:', {
      code: error.code,
      message: error.message,
      name: error.name,
      stack: error.stack,
      additionalInfo: error
    });
    
    // Translate Firebase error codes to user-friendly messages
    let errorMessage = 'Registrierung fehlgeschlagen. ';
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage += 'Diese E-Mail-Adresse wird bereits verwendet.';
        break;
      case 'auth/invalid-email':
        errorMessage += 'Ungültige E-Mail-Adresse.';
        break;
      case 'auth/operation-not-allowed':
        errorMessage += 'E-Mail/Passwort-Anmeldung ist nicht aktiviert.';
        break;
      case 'auth/weak-password':
        errorMessage += 'Das Passwort ist zu schwach.';
        break;
      default:
        errorMessage += 'Bitte versuchen Sie es erneut.';
    }
    
    error.userMessage = errorMessage;
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

// Initialize analytics
try {
  const analytics = getAnalytics(app);
  console.log('Firebase Analytics initialized');
} catch (error) {
  console.warn('Firebase Analytics initialization failed:', error);
}

// Export instances
export { auth, db };
