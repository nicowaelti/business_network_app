import { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { loginUser } from '../config/firebase';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await loginUser(email, password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error.code, error.message);
      switch (error.code) {
        case 'auth/user-not-found':
          setMessage('Kein Benutzer mit dieser E-Mail-Adresse gefunden.');
          break;
        case 'auth/wrong-password':
          setMessage('Falsches Passwort. Bitte versuchen Sie es erneut.');
          break;
        case 'auth/invalid-email':
          setMessage('Ungültiges E-Mail-Format.');
          break;
        case 'auth/too-many-requests':
          setMessage('Zu viele Anmeldeversuche. Bitte versuchen Sie es später erneut.');
          break;
        case 'auth/invalid-credential':
          setMessage('Ungültige E-Mail oder Passwort. Bitte überprüfen Sie Ihre Anmeldedaten.');
          break;
        default:
          setMessage(`Anmeldung fehlgeschlagen: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-lg w-full mx-auto p-8 bg-white shadow-md rounded-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Anmelden</h1>
        {message && (
          <div 
            role="alert" 
            className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-center"
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
              aria-describedby="email-error"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="relative">
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Passwort
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-describedby="password-error"
                className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Passwort eingeben"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Anmeldung läuft...' : 'Anmelden'}
          </button>
        </form>
        <div className="mt-6 flex justify-end text-sm">
          <Link 
            to="/forgot-password" 
            className="text-gray-600 hover:text-gray-800"
          >
            Passwort vergessen?
          </Link>
        </div>
      </div>
    </div>
  );
}
