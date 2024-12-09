import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { resetUserPassword } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setMessage('');
      setError('');
      setLoading(true);
      await resetUserPassword(email);
      setMessage('Passwort-Zurücksetzungs-E-Mail wurde gesendet');
    } catch (err) {
      setError('Fehler beim Zurücksetzen des Passworts. Bitte überprüfen Sie Ihre E-Mail-Adresse.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // If already logged in, redirect to dashboard
  if (currentUser) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Passwort zurücksetzen
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              {error}
            </div>
          )}
          {message && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
              {message}
            </div>
          )}
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
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="E-Mail"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link 
                to="/login" 
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Zurück zur Anmeldung
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Senden...' : 'Passwort zurücksetzen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;
