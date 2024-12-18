// @ts-check
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { config } from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the correct path
config({ path: '.env' });

// Log all environment variables to debug
console.log('Environment variables:', {
  VITE_FIREBASE_API_KEY: process.env.VITE_FIREBASE_API_KEY ? 'present' : 'missing',
  VITE_FIREBASE_AUTH_DOMAIN: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID: process.env.VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID ? 'present' : 'missing',
  VITE_FIREBASE_APP_ID: process.env.VITE_FIREBASE_APP_ID ? 'present' : 'missing'
});

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Log configuration (without sensitive data)
console.log('Firebase configuration:', {
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  hasApiKey: !!firebaseConfig.apiKey
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Generate a unique email for testing
const timestamp = new Date().getTime();
const testUser = {
  email: `test${timestamp}@example.com`,
  password: 'Test123!',
  profileData: {
    name: 'Test Account',
    profileType: 'freelancer',
    title: 'Test User',
    location: 'Test Location',
    skills: ['Testing'],
    experience: 'Test experience',
    education: 'Test education',
    portfolio: 'https://example.com',
    createdAt: new Date().toISOString(),
    role: 'user'
  }
};

console.log('Using test email:', testUser.email);

// Test both creation and login
(async () => {
  try {
    console.log('Step 1: Creating test user...');
    
    // Create user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      testUser.email,
      testUser.password
    );
    console.log('User created successfully:', userCredential.user.uid);
    
    // Add user profile
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      ...testUser.profileData,
      email: testUser.email,
      uid: userCredential.user.uid
    });
    console.log('User profile created successfully');

    console.log('\nStep 2: Testing login...');
    
    // Test login
    const loginResult = await signInWithEmailAndPassword(
      auth,
      testUser.email,
      testUser.password
    );
    console.log('Login successful:', loginResult.user.email);
    
    console.log('\nAll tests completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('\nError details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
})();
