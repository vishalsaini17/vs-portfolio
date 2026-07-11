/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { TabType } from './types';
import { useProfile } from './profileContext';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

// Importing Custom Sub-components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import HomeTab from './components/HomeTab';
import ResumeTab from './components/ResumeTab';
import WorkTab from './components/WorkTab';
import ContactTab from './components/ContactTab';
import BlogTab from './components/BlogTab';
import AdminTab from './components/AdminTab';

export default function App() {
  const { profile, loading, error, saveProfile } = useProfile();
  const location = useLocation();
  const navigate = useNavigate();

  // Helper to match paths to TabType
  const getActiveTab = (pathname: string): TabType => {
    const cleanPath = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
    switch (cleanPath) {
      case '/resume':
        return 'resume';
      case '/work':
        return 'work';
      case '/contact':
        return 'contact';
      case '/blog':
        return 'blog';
      case '/admin':
        return 'admin';
      case '/':
      default:
        return 'home';
    }
  };

  const activeTab = getActiveTab(location.pathname);

  // Redirect if Blog is disabled but activeTab is 'blog'
  useEffect(() => {
    if (activeTab === 'blog' && !profile.blogEnabled) {
      setActiveTab('home');
    }
  }, [activeTab, profile.blogEnabled]);

  const setActiveTab = (tab: TabType) => {
    const path = tab === 'home' ? '/' : `/${tab}`;
    navigate(path);
  };

  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);

  // Sync Auth State to dynamically adjust Navigation Tabs list
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setIsAdminLoggedIn(!!currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Sync dark mode class onto document root
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f6f9] dark:bg-[#0b101d] text-slate-800 dark:text-slate-100 flex flex-col font-sans pb-16 animate-pulse">
        {/* Skeleton Header */}
        <header className="sticky top-0 z-40 w-full bg-[#f3f6f9]/80 dark:bg-[#0b101d]/80 backdrop-blur-md border-b border-slate-200/40 dark:border-slate-800/40 py-4 px-6 flex justify-between items-center max-w-7xl mx-auto">
          <div className="h-8 w-36 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
          <div className="flex gap-4">
            <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
            <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
            <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
          </div>
        </header>

        {/* Skeleton Layout Body */}
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 flex flex-col lg:flex-row gap-8 items-start mt-6 md:mt-8 flex-1">
          {/* Left Sidebar Skeleton */}
          <aside className="w-full lg:w-[360px] bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-[32px] p-6 lg:p-8 flex flex-col items-center">
            <div className="w-32 h-32 rounded-full bg-slate-200 dark:bg-slate-800 mb-6"></div>
            <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-md mb-3"></div>
            <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded-md mb-6"></div>
            <div className="flex gap-3 mb-8">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800"></div>
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800"></div>
            </div>
            <div className="w-full space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-5/6"></div>
            </div>
          </aside>

          {/* Right Content Block Skeleton */}
          <section className="w-full flex-1">
            <div className="w-full border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[32px] p-6 md:p-8 lg:p-10 min-h-[500px]">
              <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg mb-8"></div>
              <div className="space-y-4 mb-8">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-full"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-11/12"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-4/5"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-28 bg-slate-100 dark:bg-slate-800/50 rounded-2xl"></div>
                <div className="h-28 bg-slate-100 dark:bg-slate-800/50 rounded-2xl"></div>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (error) {
    const isDocMissing = error.includes('No profile details found');
    return (
      <div className="min-h-screen bg-[#f3f6f9] dark:bg-[#0b101d] text-slate-800 dark:text-slate-100 flex flex-col justify-center items-center font-sans p-6">
        <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/40 rounded-[32px] p-8 shadow-xl text-center animate-fade-in">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-950/40 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">Firestore Connection Sync</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
            {error}
          </p>

          {isDocMissing ? (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-500 max-w-md mx-auto">
                Your Firebase project is successfully connected! To get started, initialize the Firestore collection with a blank template document. You'll then be able to customize all data through the admin panel.
              </p>
              <button
                onClick={async () => {
                  const initTemplate = {
                    profileName: 'Your Name',
                    profileTitle: 'Your Title',
                    profileAvatar: '',
                    socialLinks: [
                      { platform: 'linkedin', url: '' },
                      { platform: 'github', url: '' }
                    ],
                    contactInfo: {
                      phone: [],
                      email: 'email@example.com',
                      location: 'Location'
                    },
                    services: [
                      { title: 'Frontend Development', description: 'Building scalable applications.', iconName: 'code', colorTheme: 'orange' }
                    ],
                    educationHistory: [],
                    experienceHistory: [],
                    workSkills: ['React.js', 'TypeScript', 'JavaScript'],
                    softSkills: ['Communication', 'Teamwork'],
                    projects: [],
                    aboutTitle: 'ABOUT ME',
                    aboutDescription: 'Write something about yourself...',
                    homeSections: [
                      {
                        id: 'services-section',
                        title: 'What I do',
                        type: 'grid',
                        cards: [
                          { id: 'srv-1', title: 'Frontend Development', description: 'Building scalable applications.', iconName: 'code', colorTheme: 'orange' }
                        ]
                      }
                    ],
                    resumeSections: [
                      { id: 'skills-sec', title: 'Skills', iconName: 'Code', width: '100%', type: 'skills' }
                    ],
                    contactTitle: 'Contact',
                    contactDescription: 'Get in touch.',
                    blogTitle: 'Tech Blog',
                    blogDescription: 'My writings and thoughts.',
                    blogEnabled: false
                  };
                  try {
                    await saveProfile(initTemplate);
                  } catch (err) {
                    console.error(err);
                  }
                }}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-full transition duration-200 shadow-md hover:shadow-lg focus:outline-none cursor-pointer"
              >
                Initialize Profile Template
              </button>
            </div>
          ) : (
            <div className="space-y-4 text-xs text-left bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 animate-fade-in">
              <div className="font-semibold text-slate-700 dark:text-slate-300">Troubleshooting Steps:</div>
              <ul className="list-disc list-inside space-y-1 text-slate-500">
                <li>Verify your <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">.env</code> configurations match your Firebase console.</li>
                <li>Ensure Firestore is enabled in your Firebase Project console.</li>
                <li>Check that security rules allow read/write access.</li>
              </ul>
              <button
                onClick={() => window.location.reload()}
                className="w-full mt-2 py-2 px-4 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 font-medium rounded-xl text-center transition cursor-pointer"
              >
                Retry Sync
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Helper to render the active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab />;
      case 'resume':
        return <ResumeTab />;
      case 'work':
        return <WorkTab />;
      case 'contact':
        return <ContactTab />;
      case 'blog':
        return <BlogTab />;
      case 'admin':
        return <AdminTab />;
      default:
        return <HomeTab />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f6f9] dark:bg-[#0b101d] text-slate-800 dark:text-slate-100 flex flex-col transition-all duration-500 overflow-x-clip font-sans pb-16">
      
      {/* Dynamic Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* Main Core Layout Grid */}
      <main className="w-full max-w-7xl mx-auto px-4 md:px-6 flex flex-col lg:flex-row gap-8 items-start mt-6 md:mt-8 flex-1">
        
        {/* Left Profile Sidebar */}
        <Sidebar />

        {/* Right Active Workspace Block */}
        <section className="w-full flex-1 min-w-0">
          <div className="w-full border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[32px] p-6 md:p-8 lg:p-10 shadow-xs relative mt-0 lg:mt-12 min-h-[500px]">
            
            {/* Smooth Animated Tab switcher */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="w-full"
              >
                {renderTabContent()}
              </motion.div>
            </AnimatePresence>

          </div>

          {/* Simple Subtle Footer inside layout boundaries to keep margins clean */}
          <footer className="mt-8 text-center text-xs text-slate-400 dark:text-slate-600 font-sans tracking-wide">
            &copy; 2026 {profile.profileName}. All Rights Reserved. FullStack Portfolio Engine.
          </footer>
        </section>

      </main>

    </div>
  );
}
