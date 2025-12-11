import React, { useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { ref, onValue, off } from 'firebase/database';
import Auth from './components/Auth';
import Layout from './components/Layout';
import Lobby from './components/Lobby';
import Game from './components/Game';
import Leaderboard from './components/Leaderboard';
import Profile from './components/Profile';
import { UserProfile } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [view, setView] = useState<string>('home');
  const [loading, setLoading] = useState(true);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setUserProfile(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // User Profile Sync
  useEffect(() => {
    if (user) {
      const userRef = ref(db, `users/${user.uid}`);
      const listener = onValue(userRef, (snapshot) => {
        if (snapshot.exists()) {
          setUserProfile(snapshot.val());
          
          // Redirect to game if active match exists
          const val = snapshot.val();
          if (val.activeMatch && view !== 'game') {
             window.location.hash = '#game';
          }
        }
        setLoading(false);
      });
      return () => off(userRef);
    }
  }, [user]);

  // Hash Router
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      setView(hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Init

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-primary">
        <i className="fas fa-circle-notch fa-spin fa-3x"></i>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  if (!userProfile) {
     // Wait for profile creation in DB after registration
     return (
       <div className="flex items-center justify-center h-screen bg-background text-text">
         Setting up profile...
       </div>
     )
  }

  // Determine content based on hash
  const renderContent = () => {
    switch (view) {
      case 'home':
        return (
            <div className="p-6 text-center space-y-8 animate__animated animate__fadeIn">
                <h1 className="text-4xl font-bold text-primary mb-2">LP-F4</h1>
                <p className="text-gray-400">Battle Quiz for Somali Students</p>
                
                <div className="grid grid-cols-1 gap-4 mt-8">
                    <button 
                        onClick={() => window.location.hash = '#lobby'}
                        className="glass p-6 rounded-2xl hover:border-primary transition duration-300 group"
                    >
                        <i className="fas fa-bolt text-4xl text-primary mb-3 group-hover:animate-pulse"></i>
                        <h2 className="text-xl font-bold">Battle Mode</h2>
                        <p className="text-sm text-gray-400">PvP Multiplayer</p>
                    </button>

                    <button 
                        onClick={() => window.location.hash = '#solo'}
                        className="glass p-6 rounded-2xl hover:border-secondary transition duration-300 group"
                    >
                        <i className="fas fa-brain text-4xl text-secondary mb-3"></i>
                        <h2 className="text-xl font-bold">Solo Training</h2>
                        <p className="text-sm text-gray-400">Practice your skills</p>
                    </button>
                </div>
            </div>
        );
      case 'lobby':
        return <Lobby user={user} />;
      case 'game':
        return <Game user={user} mode="multiplayer" />;
      case 'solo':
        return <Game user={user} mode="solo" />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'profile':
        return <Profile user={user} profile={userProfile} />;
      default:
        return <div className="p-6">Page not found</div>;
    }
  };

  return (
    <Layout userProfile={userProfile}>
      {renderContent()}
    </Layout>
  );
};

export default App;