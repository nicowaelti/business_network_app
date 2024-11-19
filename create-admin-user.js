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

// Admin user credentials
const adminUser = {
  email: 'admin@example.com',
  password: 'Admin123!',
  profileData: {
    name: 'Admin User',
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
    
    console.log('Firestore profile created successfully');
    console.log('Admin user created with credentials:');
    console.log('Email:', adminUser.email);
    console.log('Password:', adminUser.password);
    
    // Exit the process after successful creation
    process.exit(0);
  } catch (error) {
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('\nAdmin user already exists. You can use these credentials to log in:');
      console.log('Email:', adminUser.email);
      console.log('Password:', adminUser.password);
      process.exit(0);
    } else {
      console.error('\nFailed to create admin user');
      process.exit(1);
    }
  }
})();
