import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, getUserProfile } from '../config/firebase';
import { Link } from 'react-router-dom';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { MdEmail } from 'react-icons/md';

export default function Jobs() {
  const { currentUser, isAdmin } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    location: '',
    remoteType: 'no_preference',
    description: '',
    requirements: '',
    salary: '',
    contactInfo: ''
  });
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    fetchData();
    fetchUserProfile();
  }, []);

  const fetchData = async () => {
    try {
      const jobsRef = collection(db, 'jobs');
      const jobsSnapshot = await getDocs(query(jobsRef, orderBy('createdAt', 'desc')));
      const jobsList = jobsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setJobs(jobsList);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      alert('Jobs konnten nicht geladen werden');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    if (currentUser) {
      try {
        const profile = await getUserProfile(currentUser.uid);
        setUserProfile(profile);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      type: job.type,
      location: job.location,
      remoteType: job.remoteType,
      description: job.description,
      requirements: job.requirements,
      salary: job.salary || '',
      contactInfo: job.contactInfo || ''
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingJob) {
        const jobRef = doc(db, 'jobs', editingJob.id);
        await updateDoc(jobRef, {
          ...formData,
          updatedAt: serverTimestamp(),
        });
        alert('Job erfolgreich aktualisiert!');
      } else {
        const jobsRef = collection(db, 'jobs');
        await addDoc(jobsRef, {
          ...formData,
          createdBy: currentUser.uid,
          companyName: userProfile?.profileType === 'company' ? userProfile.companyName : userProfile.name,
          createdAt: serverTimestamp(),
        });
        alert('Job erfolgreich erstellt!');
      }

      setFormData({
        title: '',
        type: '',
        location: '',
        remoteType: 'no_preference',
        description: '',
        requirements: '',
        salary: '',
        contactInfo: ''
      });
      setShowForm(false);
      setEditingJob(null);
      await fetchData();
    } catch (error) {
      console.error('Fehler beim Speichern des Jobs:', error);
      alert('Job konnte nicht gespeichert werden. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId, createdBy) => {
    if (createdBy !== currentUser.uid && !isAdmin) {
      alert('Sie können nur Ihre eigenen Projekte löschen.');
      return;
    }

    if (window.confirm('Sind Sie sicher, dass Sie dieses Projekt löschen möchten?')) {
      try {
        setLoading(true);
        await deleteDoc(doc(db, 'jobs', jobId));
        await fetchData();
        alert('Projekt erfolgreich gelöscht!');
      } catch (error) {
        console.error('Error deleting job:', error);
        alert('Projekt konnte nicht gelöscht werden. Bitte versuchen Sie es erneut.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      title: '',
      type: '',
      location: '',
      remoteType: 'no_preference',
      description: '',
      requirements: '',
      salary: '',
      contactInfo: ''
    });
    setShowForm(false);
    setEditingJob(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projekte</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Projekt ausschreiben
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingJob ? 'Projekt bearbeiten' : 'Neues Projekt erstellen'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Projekttitel</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Beschäftigungsart</label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Art auswählen</option>
                <option value="Vollzeit">Vollzeit</option>
                <option value="Teilzeit">Teilzeit</option>
                <option value="Befristet">Befristet</option>
                <option value="Freiberuflich">Freiberuflich</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Standort</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Arbeitsort</label>
              <select
                value={formData.remoteType}
                onChange={(e) => setFormData(prev => ({ ...prev, remoteType: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="no_preference">Keine Präferenz</option>
                <option value="remote_only">Nur Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="on_site">Vor Ort</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Beschreibung</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Anforderungen</label>
              <textarea
                required
                value={formData.requirements}
                onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Listen Sie die wichtigsten Anforderungen für diese Position auf..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Gehaltsrahmen</label>
              <input
                type="text"
                value={formData.salary}
                onChange={(e) => setFormData(prev => ({ ...prev, salary: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="z.B. CHF 80.000 - 100.000 pro Jahr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Kontaktinformationen</label>
              <input
                type="text"
                value={formData.contactInfo}
                onChange={(e) => setFormData(prev => ({ ...prev, contactInfo: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="E-Mail oder Telefonnummer für Bewerbungen"
              />
              <p className="mt-1 text-sm text-gray-500">
                Wie sollen Kandidaten Sie bezüglich dieser Position kontaktieren?
              </p>
            </div>

            <div className="pt-4 flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                onClick={handleSubmit}
                className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
              >
                {loading ? 'Wird gespeichert...' : (editingJob ? 'Projekt aktualisieren' : 'Projekt veröffentlichen')}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-6">
        {jobs.map((job) => (
          <div key={job.id} className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold mb-2">{job.title}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {job.companyName} • {job.location}
                </p>
                <div className="flex space-x-2 mb-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {job.type}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {job.remoteType === 'no_preference' ? 'Keine Präferenz' :
                     job.remoteType === 'remote_only' ? 'Nur Remote' :
                     job.remoteType === 'hybrid' ? 'Hybrid' : 'Vor Ort'}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {job.salary && (
                  <span className="text-sm text-gray-600">{job.salary}</span>
                )}
                {(job.createdBy === currentUser.uid || isAdmin) && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(job)}
                      className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50"
                      title="Projekt bearbeiten"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(job.id, job.createdBy)}
                      className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50"
                      title="Projekt löschen"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link to={`/profile/${job.createdBy}`} className="text-indigo-600 hover:text-indigo-800 text-sm">
                  Profil des Erstellers anzeigen
                </Link>
                {job.contactInfo && (
                  <a 
                    href={`mailto:${job.contactInfo}`} 
                    className="flex items-center text-green-600 hover:text-green-800 text-sm"
                  >
                    <MdEmail className="mr-1" /> Kontaktieren
                  </a>
                )}
              </div>
              <Link 
                to={`/jobs/${job.id}`}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Details anzeigen →
              </Link>
            </div>
          </div>
        ))}

        {jobs.length === 0 && !showForm && (
          <div className="text-center py-12">
            <p className="text-gray-500">Es sind noch keine Projekte vorhanden. Seien Sie der Erste, der ein Projekt ausschreibt!</p>
          </div>
        )}
      </div>
    </div>
  );
}
