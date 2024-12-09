import { config } from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Load environment variables
config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Validate environment variables
if (!process.env.VITE_ADMIN_USER_EMAIL || !process.env.VITE_ADMIN_USER_PASSWORD) {
  console.error('Error: Admin credentials not found in environment variables.');
  console.log('Please ensure VITE_ADMIN_USER_EMAIL and VITE_ADMIN_USER_PASSWORD are set in your .env file');
  process.exit(1);
}

// Admin user configuration from environment variables
const adminUser = {
  email: process.env.VITE_ADMIN_USER_EMAIL,
  password: process.env.VITE_ADMIN_USER_PASSWORD,
  profileData: {
    name: 'Admin Account',
    profileType: 'admin',
    role: 'admin',
    createdAt: new Date().toISOString()
  }
};

// Wrap the execution in an async IIFE
(async () => {
  try {
    console.log('Creating admin user...');
    
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      adminUser.email,
      adminUser.password
    );
    
    console.log('Auth user created successfully');
    
    // Add user profile to Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      ...adminUser.profileData,
      email: adminUser.email,
      uid: userCredential.user.uid
    });
    
    console.log('Admin user created successfully');
    console.log('Email:', adminUser.email);
    
    // Exit the process after successful creation
    process.exit(0);
  } catch (error) {
    console.error('Error details:', {
      code: error.code,
      message: error.message
    });
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('\nAdmin user already exists with the provided email.');
      process.exit(0);
    } else {
      console.error('\nFailed to create admin user');
      process.exit(1);
    }
  }
})();
