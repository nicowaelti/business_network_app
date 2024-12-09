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
if (!process.env.VITE_TEST_USER_EMAIL || !process.env.VITE_TEST_USER_PASSWORD) {
  console.error('Error: Test user credentials not found in environment variables.');
  console.log('Please ensure VITE_TEST_USER_EMAIL and VITE_TEST_USER_PASSWORD are set in your .env file');
  process.exit(1);
}

// Test user configuration from environment variables
const testUser = {
  email: process.env.VITE_TEST_USER_EMAIL,
  password: process.env.VITE_TEST_USER_PASSWORD,
  profileData: {
    name: 'Test Account',
    profileType: 'freelancer',
    title: 'Test User',
    location: 'Test Location',
    skills: ['Testing'],
    experience: 'Test experience',
    education: 'Test education',
    portfolio: 'https://example.com',
    createdAt: new Date().toISOString()
  }
};

// Wrap the execution in an async IIFE
(async () => {
  try {
    console.log('Creating test user...');
    
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      testUser.email,
      testUser.password
    );
    
    console.log('Auth user created successfully');
    
    // Add user profile to Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      ...testUser.profileData,
      email: testUser.email,
      uid: userCredential.user.uid,
      role: 'user'
    });
    
    console.log('Test user created successfully');
    console.log('Email:', testUser.email);
    
    // Exit the process after successful creation
    process.exit(0);
  } catch (error) {
    console.error('Error details:', {
      code: error.code,
      message: error.message
    });
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('\nTest user already exists with the provided email.');
      process.exit(0);
    } else {
      console.error('\nFailed to create test user');
      process.exit(1);
    }
  }
})();
