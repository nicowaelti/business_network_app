import { config } from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

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
const db = getFirestore(app);

// Function to create dummy availability posts
async function createDummyAvailabilityPosts() {
  // Get current date and create dates for testing
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  const tenDaysAgo = new Date(now.getTime() - (10 * 24 * 60 * 60 * 1000));
  const fiveDaysAgo = new Date(now.getTime() - (5 * 24 * 60 * 60 * 1000));

  const availabilityPosts = [
    {
      title: 'Sample Availability Post 1',
      description: 'Available for web development projects',
      startDate: now.toISOString().split('T')[0],
      endDate: new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      location: 'Remote',
      contactEmail: process.env.VITE_TEST_USER_EMAIL || 'contact1@example.com',
      createdBy: 'dummyUser1',
      createdAt: Timestamp.fromDate(fiveDaysAgo),
    },
    {
      title: 'Sample Availability Post 2',
      description: 'Looking for part-time opportunities',
      startDate: now.toISOString().split('T')[0],
      endDate: new Date(now.getTime() + (60 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      location: 'Bern',
      contactEmail: process.env.VITE_TEST_USER_EMAIL || 'contact2@example.com',
      createdBy: 'dummyUser2',
      createdAt: Timestamp.fromDate(tenDaysAgo),
    },
    {
      title: 'Sample Availability Post 3',
      description: 'Available for consulting work',
      startDate: thirtyDaysAgo.toISOString().split('T')[0],
      endDate: new Date(now.getTime() + (90 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      location: 'Zürich',
      contactEmail: process.env.VITE_TEST_USER_EMAIL || 'contact3@example.com',
      createdBy: 'dummyUser3',
      createdAt: Timestamp.fromDate(thirtyDaysAgo),
    },
  ];

  console.log('Creating dummy availability posts...');
  
  for (const post of availabilityPosts) {
    try {
      await addDoc(collection(db, 'availabilityPosts'), post);
      console.log(`Created post: ${post.title}`);
    } catch (error) {
      console.error(`Failed to create post ${post.title}:`, error.message);
    }
  }
}

// Run the functions to create dummy data
async function run() {
  try {
    await createDummyAvailabilityPosts();
    console.log('Dummy data creation completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error creating dummy data:', error.message);
    process.exit(1);
  }
}

run();
