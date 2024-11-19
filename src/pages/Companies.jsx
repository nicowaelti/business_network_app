import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Link } from 'react-router-dom';

export default function Companies() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);
        const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(usersList);
      } catch (error) {
        console.error('Error fetching users:', error);
        alert('Benutzer konnten nicht geladen werden');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Unternehmen</h1>
      <div className="space-y-6">
        {users.map(user => (
          <div key={user.id} className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">{user.profileType === 'company' ? user.companyName : user.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{user.profileType === 'company' ? user.industry : user.title}</p>
            <p className="text-sm text-gray-600 mb-2">{user.location}</p>
            <Link to={`/profile/${user.id}`} className="text-indigo-600 hover:text-indigo-800 text-sm">
              Profil anzeigen
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
