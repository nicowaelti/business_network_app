import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD8S5f73kP_yetXxV2giOe6d1Uc_i8Fcnw",
  authDomain: "bernernetzwercher.firebaseapp.com",
  projectId: "bernernetzwercher",
  storageBucket: "bernernetzwercher.firebasestorage.app",
  messagingSenderId: "13747122879",
  appId: "1:13747122879:web:5e53600eed814d3cba0c0a",
  measurementId: "G-SWEGYQ24MB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Test user credentials
const testUser = {
  email: 'test@example.com',
  password: 'Test123!',
  profileData: {
    name: 'Test User',
    profileType: 'freelancer',
    title: 'Software Developer',
    location: 'Bern, Switzerland',
    skills: ['JavaScript', 'React', 'Node.js'],
    experience: '3 years in web development',
    education: 'B.Sc. in Computer Science',
    portfolio: 'https://test-portfolio.com',
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
      uid: userCredential.user.uid
    });
    
    console.log('Firestore profile created successfully');
    console.log('Test user created with credentials:');
    console.log('Email:', testUser.email);
    console.log('Password:', testUser.password);
    
    // Exit the process after successful creation
    process.exit(0);
  } catch (error) {
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('\nTest user already exists. You can use these credentials to log in:');
      console.log('Email:', testUser.email);
      console.log('Password:', testUser.password);
      process.exit(0);
    } else {
      console.error('\nFailed to create test user');
      process.exit(1);
    }
  }
})();
