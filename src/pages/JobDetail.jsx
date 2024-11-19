import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function JobDetail() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const jobDoc = await getDoc(doc(db, 'jobs', jobId));
        if (jobDoc.exists()) {
          setJob({ id: jobDoc.id, ...jobDoc.data() });
        }
      } catch (error) {
        console.error('Error fetching job:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="text-center py-12">
          <p className="text-gray-500">Stelle nicht gefunden.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
          <div className="flex items-center space-x-4 text-gray-600">
            <span>{job.companyName}</span>
            <span>•</span>
            <span>{job.location}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {job.type}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            {job.remoteType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
          {job.salary && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
              {job.salary}
            </span>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Beschreibung</h2>
            <p className="text-gray-600 whitespace-pre-line">{job.description}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Anforderungen</h2>
            <p className="text-gray-600 whitespace-pre-line">{job.requirements}</p>
          </div>

          {job.contactInfo && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Kontaktinformationen</h2>
              <p className="text-gray-600">{job.contactInfo}</p>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200">
            <Link 
              to={`/profile/${job.createdBy}`}
              className="text-indigo-600 hover:text-indigo-800"
            >
              Profil des Erstellers anzeigen
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
