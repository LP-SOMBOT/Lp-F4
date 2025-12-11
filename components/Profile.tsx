import React from 'react';
import firebase from 'firebase/compat/app';
import { UserProfile } from '../types';
import { auth } from '../firebase';

interface ProfileProps {
  user: firebase.User;
  profile: UserProfile;
}

const Profile: React.FC<ProfileProps> = ({ profile }) => {
  const level = Math.floor(profile.points / 100) + 1;
  const progress = profile.points % 100;

  return (
    <div className="p-6 flex flex-col items-center animate__animated animate__fadeIn">
      <div className="relative mb-6 group">
        <div className="absolute inset-0 bg-primary rounded-full blur-xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
        <img 
            src={profile.avatar} 
            alt="Profile" 
            className="w-32 h-32 rounded-full border-4 border-surface relative z-10 object-cover" 
        />
        <div className="absolute bottom-0 right-0 bg-surface border border-white/10 p-2 rounded-full z-20">
             <i className="fas fa-camera text-gray-400 text-xs"></i>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-1">{profile.name}</h2>
      <p className="text-gray-400 text-sm mb-8">{profile.email}</p>

      {/* Stats Card */}
      <div className="w-full bg-surface rounded-2xl p-6 mb-6 border border-white/5">
         <div className="flex justify-between items-end mb-2">
             <span className="text-sm font-bold text-gray-400">Level {level}</span>
             <span className="text-xs text-primary">{progress}/100 XP</span>
         </div>
         <div className="w-full bg-black/50 h-3 rounded-full overflow-hidden">
             <div 
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000" 
                style={{ width: `${progress}%` }}
             ></div>
         </div>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full mb-8">
          <div className="glass p-4 rounded-xl text-center">
              <i className="fas fa-bolt text-yellow-400 text-2xl mb-2"></i>
              <div className="text-xl font-bold">{profile.points}</div>
              <div className="text-xs text-gray-500">Total Points</div>
          </div>
          <div className="glass p-4 rounded-xl text-center">
               <i className="fas fa-gamepad text-secondary text-2xl mb-2"></i>
              <div className="text-xl font-bold">--</div>
              <div className="text-xs text-gray-500">Matches Won</div>
          </div>
      </div>

      <button 
        onClick={() => auth.signOut()}
        className="w-full bg-red-500/10 border border-red-500/50 text-red-400 py-3 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-colors"
      >
        Sign Out
      </button>
    </div>
  );
};

export default Profile;