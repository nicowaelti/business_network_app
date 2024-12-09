import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';

export const Dashboard = () => {
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentAvailability, setRecentAvailability] = useState([]);
  const [futureEvents, setFutureEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentData = async () => {
      try {
        // Calculate date from 14 days ago (at midnight)
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
        fourteenDaysAgo.setHours(0, 0, 0, 0);
        const fourteenDaysAgoTimestamp = Timestamp.fromDate(fourteenDaysAgo);

        console.log('Filtering posts from:', fourteenDaysAgo.toISOString());
        console.log('Timestamp for query:', fourteenDaysAgoTimestamp.toDate().toISOString());

        // Fetch future events
        const eventsRef = collection(db, 'events');
        const eventsQuery = query(
          eventsRef,
          where('date', '>=', new Date().toISOString().split('T')[0]),
          orderBy('date', 'asc')
        );
        const eventsSnapshot = await getDocs(eventsQuery);
        const eventsList = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFutureEvents(eventsList);

        // Fetch recent jobs
        const jobsRef = collection(db, 'jobs');
        const jobsQuery = query(jobsRef, orderBy('createdAt', 'desc'));
        const jobsSnapshot = await getDocs(jobsQuery);
        const jobsList = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRecentJobs(jobsList);

        // Fetch availability posts
        const availabilityRef = collection(db, 'availabilityPosts');
        const availabilityQuery = query(
          availabilityRef,
          orderBy('createdAt', 'desc')
        );

        const availabilitySnapshot = await getDocs(availabilityQuery);
        const availabilityList = availabilitySnapshot.docs.map(doc => {
          const data = doc.data();
          const createdAt = data.createdAt?.toDate();
          
          console.log('Post:', {
            id: doc.id,
            title: data.title,
            createdAt: createdAt ? createdAt.toISOString() : 'N/A'
          });

          return {
            id: doc.id,
            ...data,
            createdAt: createdAt,
            formattedCreatedAt: createdAt ? createdAt.toLocaleDateString('de-CH') : 'N/A'
          };
        });

        // Filter posts in memory to ensure we only show posts from the last 14 days
        const recentPosts = availabilityList.filter(post => {
          if (!post.createdAt) return false;
          return post.createdAt >= fourteenDaysAgo;
        });
        
        console.log(`Found ${availabilityList.length} total posts`);
        console.log(`Filtered to ${recentPosts.length} posts from the last 14 days`);
        setRecentAvailability(recentPosts);

      } catch (error) {
        console.error('Error fetching recent data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-6">
      <h2 className="text-2xl font-bold mb-4">Aktuelle Aktivitäten</h2>

      {/* Future Events Section */}
      <div className="mb-8 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold mb-2 text-blue-800">Kommende Veranstaltungen</h3>
        {futureEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {futureEvents.map(event => (
              <div key={event.id} className="bg-white shadow-md rounded-lg p-4">
                <h4 className="text-lg font-semibold">{event.title}</h4>
                <p className="text-sm text-gray-600">{new Date(event.date).toLocaleDateString('de-CH')} • {event.location}</p>
                <p className="text-sm text-gray-600">{event.description}</p>
                <div className="mt-2">
                  <Link to={`/profile/${event.createdBy}`} className="text-indigo-600 hover:text-indigo-800 text-sm">
                    Profil des Erstellers anzeigen
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>Keine kommenden Veranstaltungen.</p>
        )}
      </div>

      {/* Recent Jobs Section */}
      <div className="mb-8 p-4 bg-green-50 border-l-4 border-green-400 rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold mb-2 text-green-800">Neue Projekte</h3>
        {recentJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentJobs.map(job => (
              <div key={job.id} className="bg-white shadow-md rounded-lg p-4">
                <h4 className="text-lg font-semibold">{job.title}</h4>
                <p className="text-sm text-gray-600">{job.companyName} • {job.location}</p>
                <p className="text-sm text-gray-600">
                  {job.createdAt?.toDate ? new Date(job.createdAt.toDate()).toLocaleDateString('de-CH') : 'N/A'}
                </p>
                <div className="mt-2">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {job.type}
                  </span>
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full ml-2">
                    {job.remoteType === 'no_preference' ? 'Keine Präferenz' :
                     job.remoteType === 'remote_only' ? 'Nur Remote' :
                     job.remoteType === 'hybrid' ? 'Hybrid' : 'Vor Ort'}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600 line-clamp-3">{job.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <Link to={`/profile/${job.createdBy}`} className="text-indigo-600 hover:text-indigo-800 text-sm">
                    Profil des Erstellers anzeigen
                  </Link>
                  <Link 
                    to={`/jobs/${job.id}`}
                    className="inline-flex items-center px-3 py-1.5 border border-blue-200 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Details anzeigen →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>Keine neuen Projekte.</p>
        )}
      </div>

      {/* Recent Availability Posts Section */}
      <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold mb-2 text-yellow-800">Aktuelle Verfügbarkeiten</h3>
        {recentAvailability.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentAvailability.map(post => (
              <div key={post.id} className="bg-white shadow-md rounded-lg p-4">
                <h4 className="text-lg font-semibold mb-2">{post.title}</h4>
                <p className="text-sm text-gray-600">
                  Verfügbar von {post.startDate} bis {post.endDate || 'N/A'}
                </p>
                <p className="text-sm text-gray-600">Standort: {post.location || 'N/A'}</p>
                <p className="text-sm text-gray-600">Kontakt: {post.contactEmail || post.contactPhone || 'N/A'}</p>
                <p className="text-sm text-gray-600">Erstellt am: {post.formattedCreatedAt}</p>
                <div className="mt-4 flex items-center justify-between">
                  <Link to={`/profile/${post.createdBy}`} className="text-indigo-600 hover:text-indigo-800 text-sm">
                    Profil des Erstellers anzeigen
                  </Link>
                  <Link 
                    to={`/availability-posts/${post.id}`}
                    className="inline-flex items-center px-3 py-1.5 border border-blue-200 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Details anzeigen →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>Keine Verfügbarkeiten in den letzten 14 Tagen.</p>
        )}
      </div>
    </div>
  );
};
