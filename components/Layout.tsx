import React from 'react';
import { UserProfile } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  userProfile: UserProfile | null;
}

const Layout: React.FC<LayoutProps> = ({ children, userProfile }) => {
  const currentHash = window.location.hash || '#home';

  const NavItem = ({ hash, icon, label }: { hash: string; icon: string; label: string }) => {
    const isActive = currentHash === hash;
    return (
      <button
        onClick={() => window.location.hash = hash}
        className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
          isActive ? 'text-primary' : 'text-gray-500'
        }`}
      >
        <i className={`fas ${icon} text-xl mb-1 ${isActive ? 'animate-bounce' : ''}`}></i>
        <span className="text-[10px] uppercase font-bold tracking-wider">{label}</span>
      </button>
    );
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-background overflow-hidden relative">
      {/* Header */}
      {userProfile && (
        <header className="h-[65px] absolute top-0 left-0 right-0 z-50 glass flex items-center justify-between px-4 shadow-lg shadow-black/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary">
              <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-white leading-tight">{userProfile.name}</h1>
              <span className="text-xs text-secondary font-mono">LVL {Math.floor(userProfile.points / 100) + 1}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-surface px-3 py-1 rounded-full border border-white/5">
            <i className="fas fa-star text-yellow-400 text-xs"></i>
            <span className="font-bold text-sm">{userProfile.points}</span>
          </div>
        </header>
      )}

      {/* Main Content Area - Scrollable */}
      <main className={`absolute top-[65px] bottom-[70px] left-0 right-0 overflow-y-auto overflow-x-hidden w-full ${!userProfile ? 'top-0' : ''}`}>
        {children}
      </main>

      {/* Footer Nav */}
      {userProfile && (
        <footer className="h-[70px] absolute bottom-0 left-0 right-0 z-50 glass flex items-center justify-around border-t border-white/5 pb-2">
          <NavItem hash="#home" icon="fa-home" label="Home" />
          <NavItem hash="#lobby" icon="fa-gamepad" label="Lobby" />
          <NavItem hash="#leaderboard" icon="fa-trophy" label="Rank" />
          <NavItem hash="#profile" icon="fa-user" label="Profile" />
        </footer>
      )}
    </div>
  );
};

export default Layout;