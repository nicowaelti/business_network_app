import { useState } from 'react';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setMessage('');
      setError('');
      setLoading(true);
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      setMessage('E-Mail zum Zurücksetzen des Passworts wurde gesendet! Überprüfen Sie Ihren Posteingang.');
    } catch (error) {
      console.error(error);
      switch (error.code) {
        case 'auth/user-not-found':
          setError('Kein Konto mit dieser E-Mail-Adresse gefunden.');
          break;
        case 'auth/invalid-email':
          setError('Ungültiges E-Mail-Format.');
          break;
        default:
          setError('E-Mail zum Zurücksetzen des Passworts konnte nicht gesendet werden. Bitte versuchen Sie es erneut.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full mx-auto p-8 bg-white shadow-md rounded-lg">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Passwort zurücksetzen</h2>
        {error && (
          <div 
            role="alert" 
            className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-center"
          >
            {error}
          </div>
        )}
        {message && (
          <div 
            role="alert" 
            className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-center"
          >
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              E-Mail-Adresse
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Wird gesendet...' : 'Passwort zurücksetzen'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link 
            to="/login" 
            className="text-indigo-600 hover:text-indigo-800 text-sm"
          >
            Zurück zur Anmeldung
          </Link>
        </div>
      </div>
    </div>
  );
}
