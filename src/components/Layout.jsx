import { Fragment, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import {
  HomeIcon,
  UserGroupIcon,
  BriefcaseIcon,
  UserIcon,
  XMarkIcon,
  Bars3Icon,
  CalendarIcon,
  Cog6ToothIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { logoutUser } from '../config/firebase';
import networkLogo from '../assets/network_logo.png';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, isAdmin, isCompany } = useAuth();
  const navigate = useNavigate();

  // Only include navigation items that should always be visible or are conditional based on auth
  const navigation = [
    { name: 'Übersicht', href: '/dashboard', icon: HomeIcon },
    { name: 'Projekte', href: '/jobs', icon: BriefcaseIcon },
    { name: 'Verfügbare Kapazitäten', href: '/availability-posts', icon: ClockIcon },
    { name: 'Veranstaltungen', href: '/events', icon: CalendarIcon },
    { name: 'Mitglieder', href: '/companies', icon: UserGroupIcon },
  ];

  // Only include the Profile link if the user is logged in
  if (currentUser?.uid) {
    navigation.push({ name: 'Mein Profil', href: `/profile/${currentUser.uid}`, icon: UserIcon });
  }

  // Add admin link if user is admin
  if (isAdmin) {
    navigation.push({ name: 'Administration', href: '/admin', icon: Cog6ToothIcon });
  }

  const getUserRole = () => {
    if (isAdmin) return 'Administrator';
    if (isCompany) return 'Unternehmen';
    return 'Mitglied';
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/login');
    } catch (error) {
      console.error('Abmeldung fehlgeschlagen:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 flex z-40 md:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                  <button
                    type="button"
                    className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="sr-only">Seitenleiste schließen</span>
                    <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>
              </Transition.Child>
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex-shrink-0 flex items-center px-4 space-x-3">
                  <img
                    className="h-10 w-auto"
                    src={networkLogo}
                    alt="Bärner Netzwärcher"
                  />
                  <h1 className="text-xl font-semibold text-gray-900">Bärner Netzwärcher</h1>
                </div>
                <nav className="mt-5 px-2 space-y-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    >
                      <item.icon
                        className="mr-4 h-6 w-6 text-gray-400 group-hover:text-gray-500"
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
              <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                <div className="flex items-center">
                  <div>
                    <img
                      className="inline-block h-10 w-10 rounded-full"
                      src={`https://ui-avatars.com/api/?name=${currentUser?.email || 'Benutzer'}`}
                      alt=""
                    />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-500">
                      {getUserRole()}
                    </p>
                    <p className="text-base font-medium text-gray-700 group-hover:text-gray-900">
                      {currentUser?.email}
                    </p>
                    <button
                      onClick={handleLogout}
                      className="text-sm font-medium text-gray-500 hover:text-gray-700"
                    >
                      Abmelden
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition.Child>
          <div className="flex-shrink-0 w-14">{/* Force sidebar to shrink to fit close icon */}</div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4 space-x-3">
              <img
                className="h-10 w-auto"
                src={networkLogo}
                alt="Bärner Netzwärcher"
              />
              <h1 className="text-xl font-semibold text-gray-900">Bärner Netzwärcher</h1>
            </div>
            <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  <item.icon
                    className="mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-500"
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div>
                <img
                  className="inline-block h-9 w-9 rounded-full"
                  src={`https://ui-avatars.com/api/?name=${currentUser?.email || 'Benutzer'}`}
                  alt=""
                />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500">
                  {getUserRole()}
                </p>
                <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                  {currentUser?.email}
                </p>
                <button
                  onClick={handleLogout}
                  className="text-xs font-medium text-gray-500 hover:text-gray-700"
                >
                  Abmelden
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-100">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Seitenleiste öffnen</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <main className="flex-1 flex flex-col">
          <div className="py-6 flex-grow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
          
          {/* Footer with Impressum link */}
          <footer className="bg-gray-200 py-4 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 text-center">
              <Link 
                to="/impressum" 
                className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
              >
                Impressum
              </Link>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
