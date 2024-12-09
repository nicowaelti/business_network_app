import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

// Firebase configuration
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
      title: 'Recent Post - 5 days ago',
      description: 'Available for freelance web development projects.',
      startDate: now.toISOString().split('T')[0],
      endDate: new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      location: 'Remote',
      contactEmail: 'john.doe@example.com',
      createdBy: 'userId1',
      createdAt: Timestamp.fromDate(fiveDaysAgo),
    },
    {
      title: 'Recent Post - 10 days ago',
      description: 'Looking for part-time opportunities in data analysis.',
      startDate: now.toISOString().split('T')[0],
      endDate: new Date(now.getTime() + (60 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      location: 'Bern',
      contactEmail: 'jane.doe@example.com',
      createdBy: 'userId2',
      createdAt: Timestamp.fromDate(tenDaysAgo),
    },
    {
      title: 'Old Post - 30 days ago',
      description: 'Available for consulting work.',
      startDate: thirtyDaysAgo.toISOString().split('T')[0],
      endDate: new Date(now.getTime() + (90 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      location: 'Zürich',
      contactEmail: 'consultant@example.com',
      createdBy: 'userId3',
      createdAt: Timestamp.fromDate(thirtyDaysAgo),
    },
  ];

  for (const post of availabilityPosts) {
    await addDoc(collection(db, 'availabilityPosts'), post);
  }
}

// Run the functions to create dummy data
async function run() {
  try {
    await createDummyAvailabilityPosts();
    console.log('Dummy availability posts created successfully.');
  } catch (error) {
    console.error('Error creating dummy data:', error);
  }
}

run();
