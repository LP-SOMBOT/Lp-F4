import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { ref, query, orderByChild, limitToLast, get } from 'firebase/database';
import { UserProfile } from '../types';

const Leaderboard: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const q = query(ref(db, 'users'), orderByChild('points'), limitToLast(10));
      const snapshot = await get(q);
      if (snapshot.exists()) {
        const data: UserProfile[] = [];
        snapshot.forEach((child) => {
          data.push(child.val());
        });
        setUsers(data.reverse()); // Descending order
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="p-4 animate__animated animate__fadeIn">
      <h2 className="text-2xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
        <i className="fas fa-crown mr-2"></i>Top Students
      </h2>
      
      <div className="space-y-3 pb-20">
        {users.map((u, index) => {
           let rankStyle = "bg-surface border border-white/5";
           let icon = null;
           
           if (index === 0) {
               rankStyle = "bg-yellow-500/10 border border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.2)]";
               icon = <i className="fas fa-crown text-yellow-400"></i>;
           } else if (index === 1) {
               rankStyle = "bg-gray-400/10 border border-gray-400/50";
               icon = <i className="fas fa-medal text-gray-300"></i>;
           } else if (index === 2) {
               rankStyle = "bg-orange-700/10 border border-orange-700/50";
               icon = <i className="fas fa-medal text-orange-600"></i>;
           }

           return (
            <div key={u.uid} className={`flex items-center p-4 rounded-xl ${rankStyle}`}>
                <div className="w-8 font-bold text-gray-500 flex justify-center">{icon || index + 1}</div>
                <img src={u.avatar} alt="av" className="w-10 h-10 rounded-full mx-3 border border-white/10" />
                <div className="flex-1">
                    <h3 className="font-bold text-sm text-white">{u.name}</h3>
                    <p className="text-xs text-secondary">Level {Math.floor(u.points/100) + 1}</p>
                </div>
                <div className="font-mono font-bold text-primary">{u.points}</div>
            </div>
           );
        })}
      </div>
    </div>
  );
};

export default Leaderboard;