import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

function Register({ isAdminCreating = false }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState('freelancer'); // Default to freelancer
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return setError('Passwörter stimmen nicht überein');
    }

    if (password.length < 6) {
      return setError('Das Passwort muss mindestens 6 Zeichen lang sein');
    }

    try {
      setError('');
      setLoading(true);
      console.log('Starting registration process:', { email, userType, isAdminCreating });
      await registerUser(email, password, userType, isAdminCreating);
      console.log('Registration completed successfully');
      
      // If admin is creating a user, redirect back to admin page
      if (isAdminCreating) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Registration error caught in component:', err);
      setError(err.userMessage || 'Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  // Only redirect if user is logged in and this is not admin creating a new user
  if (currentUser && !isAdminCreating) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isAdminCreating ? 'Neuen Benutzer erstellen' : 'Registrieren Sie sich'}
          </h2>
          {error && (
            <div className="mt-2 text-center text-sm text-red-600 bg-red-100 p-2 rounded">
              {error}
            </div>
          )}
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">E-Mail</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="E-Mail"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Passwort</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Passwort (mindestens 6 Zeichen)"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">Passwort bestätigen</label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Passwort bestätigen"
              />
            </div>
          </div>

          <div>
            <label htmlFor="userType" className="block text-sm font-medium text-gray-700">
              Profiltyp
            </label>
            <select
              id="userType"
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="freelancer">Freiberufler</option>
              <option value="company">Unternehmen</option>
            </select>
          </div>

          {!isAdminCreating && (
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link 
                  to="/login" 
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Bereits ein Konto? Anmelden
                </Link>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Registrieren...' : 'Registrieren'}
            </button>
          </div>

          {isAdminCreating && (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Zurück zur Benutzerverwaltung
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default Register;
