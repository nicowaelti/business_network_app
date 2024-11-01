import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

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

// Function to create dummy users
async function createDummyUsers() {
  const users = [
    {
      name: 'John Doe',
      profileType: 'freelancer',
      title: 'Web Developer',
      location: 'New York, USA',
      skills: 'JavaScript, React, Node.js',
      experience: '5 years in web development',
      education: 'B.Sc. in Computer Science',
      portfolio: 'https://johndoe.dev',
    },
    {
      companyName: 'Tech Solutions Inc.',
      profileType: 'company',
      industry: 'Software Development',
      companySize: '50-200 employees',
      yearEstablished: '2010',
      website: 'https://techsolutions.com',
      services: 'Web Development, Mobile Apps',
      products: 'Project Management Software',
    },
  ];

  for (const user of users) {
    await addDoc(collection(db, 'users'), user);
  }
}

// Function to create dummy jobs
async function createDummyJobs() {
  const jobs = [
    {
      title: 'Frontend Developer',
      companyId: 'companyId1', // Replace with actual company ID
      type: 'Full-time',
      location: 'Remote',
      remoteType: 'remote_only',
      description: 'Develop and maintain web applications.',
      requirements: '3+ years of experience with React.',
      salary: 'USD 70,000 - 90,000 per year',
      createdAt: new Date(),
    },
    {
      title: 'Backend Developer',
      companyId: 'companyId2', // Replace with actual company ID
      type: 'Contract',
      location: 'San Francisco, USA',
      remoteType: 'hybrid',
      description: 'Build and maintain server-side applications.',
      requirements: 'Experience with Node.js and Express.',
      salary: 'USD 80,000 - 100,000 per year',
      createdAt: new Date(),
    },
  ];

  for (const job of jobs) {
    await addDoc(collection(db, 'jobs'), job);
  }
}

// Function to create dummy availability posts
async function createDummyAvailabilityPosts() {
  const availabilityPosts = [
    {
      description: 'Available for freelance web development projects.',
      availableFrom: new Date(),
      availableUntil: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      location: 'Remote',
      contactInfo: 'john.doe@example.com',
      createdBy: 'userId1', // Replace with actual user ID
      createdAt: new Date(),
    },
    {
      description: 'Looking for part-time opportunities in data analysis.',
      availableFrom: new Date(),
      availableUntil: new Date(new Date().setMonth(new Date().getMonth() + 2)),
      location: 'New York, USA',
      contactInfo: 'jane.doe@example.com',
      createdBy: 'userId2', // Replace with actual user ID
      createdAt: new Date(),
    },
  ];

  for (const post of availabilityPosts) {
    await addDoc(collection(db, 'availabilityPosts'), post);
  }
}

// Run the functions to create dummy data
async function run() {
  try {
    await createDummyUsers();
    console.log('Dummy users created successfully.');
    await createDummyJobs();
    console.log('Dummy jobs created successfully.');
    await createDummyAvailabilityPosts();
    console.log('Dummy availability posts created successfully.');
  } catch (error) {
    console.error('Error creating dummy data:', error);
  }
}

run(); 