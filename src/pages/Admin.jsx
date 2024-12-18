import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  getAllUsers, 
  updateUserRole, 
  deleteUserData, 
  resetUserPassword 
} from '../config/firebase';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    loadUsers();
  }, [isAdmin, navigate]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const fetchedUsers = await getAllUsers();
      setUsers(fetchedUsers);
    } catch (err) {
      setError('Benutzer konnten nicht geladen werden');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Sind Sie sicher, dass Sie diesen Benutzer löschen möchten?')) return;
    
    try {
      await deleteUserData(userId);
      setUsers(users.filter(user => user.id !== userId));
    } catch (err) {
      setError('Benutzer konnte nicht gelöscht werden');
      console.error(err);
    }
  };

  const handleResetPassword = async (email) => {
    try {
      await resetUserPassword(email);
      alert('E-Mail zum Zurücksetzen des Passworts wurde erfolgreich gesendet');
    } catch (err) {
      setError('E-Mail zum Zurücksetzen des Passworts konnte nicht gesendet werden');
      console.error(err);
    }
  };

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
    } catch (err) {
      setError('Benutzerrolle konnte nicht aktualisiert werden');
      console.error(err);
    }
  };

  const handleAddUser = () => {
    console.log('Navigating to create user page');
    navigate('/admin/create-user');
  };

  if (!isAdmin) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
        <div className="relative py-3 sm:max-w-xl sm:mx-auto">
          <div className="text-center">Wird geladen...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold">Benutzerverwaltung</h1>
              {error && (
                <div className="mt-2 text-sm text-red-600">
                  {error}
                </div>
              )}
            </div>
            <button
              onClick={handleAddUser}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Neuer Benutzer hinzufügen
            </button>
          </div>
          
          <div className="border-t border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    E-Mail
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rolle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profiltyp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        className="text-sm text-gray-900 border rounded p-1 pr-8"
                        value={user.role || 'user'}
                        onChange={(e) => handleRoleUpdate(user.id, e.target.value)}
                        style={{ minWidth: '120px' }}
                      >
                        <option value="user">Benutzer</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.profileType === 'company' ? 'Unternehmen' : 'Freiberufler'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleResetPassword(user.email)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Passwort zurücksetzen
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Löschen
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
