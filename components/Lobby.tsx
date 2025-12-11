import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { ref, remove } from 'firebase/database';
import { db } from '../firebase';
import { joinQueue, createRoom, joinRoom } from '../services/gameService';

interface LobbyProps {
  user: User;
}

const Lobby: React.FC<LobbyProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'auto' | 'custom'>('auto');
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  // Cleanup queue if unmounting while searching
  useEffect(() => {
    return () => {
      if (status === 'searching') {
        const queueRef = ref(db, `queue/general`); // Assuming general for cleanup simplicity
        // In a real app, track the specific ref pushed
      }
    };
  }, [status]);

  const handleAutoMatch = async () => {
    setLoading(true);
    setStatus('searching');
    try {
      await joinQueue(user.uid, 'general');
      // Listener in App.tsx will redirect when activeMatch is set
    } catch (e) {
      console.error(e);
      setStatus('error');
      setLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    setLoading(true);
    try {
      const code = await createRoom(user.uid, 'general');
      setGeneratedCode(code);
      setStatus('waiting_host');
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (roomCode.length !== 4) return;
    setLoading(true);
    try {
      await joinRoom(roomCode, user.uid);
    } catch (e) {
      console.error(e);
      setStatus('invalid_code');
      setLoading(false);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col items-center animate__animated animate__fadeIn">
      {/* Tabs */}
      <div className="flex w-full bg-surface rounded-xl p-1 mb-8">
        <button
          onClick={() => { setActiveTab('auto'); setStatus(''); setGeneratedCode(''); }}
          className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'auto' ? 'bg-primary text-white shadow-lg' : 'text-gray-400'
          }`}
        >
          Auto Match
        </button>
        <button
          onClick={() => { setActiveTab('custom'); setStatus(''); }}
          className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'custom' ? 'bg-primary text-white shadow-lg' : 'text-gray-400'
          }`}
        >
          Custom Room
        </button>
      </div>

      {activeTab === 'auto' ? (
        <div className="flex flex-col items-center justify-center flex-1 w-full text-center">
            {status === 'searching' ? (
                 <div className="relative">
                    <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-ping"></div>
                    <div className="w-32 h-32 rounded-full border-4 border-primary flex items-center justify-center bg-surface relative z-10">
                        <i className="fas fa-search text-4xl text-primary animate-pulse"></i>
                    </div>
                    <p className="mt-8 text-lg font-bold animate-pulse">Searching for opponent...</p>
                    <p className="text-sm text-gray-500">Subject: General Knowledge</p>
                 </div>
            ) : (
                <div className="space-y-6 w-full max-w-sm">
                    <div className="p-6 glass rounded-2xl border-l-4 border-secondary">
                        <h3 className="font-bold text-lg mb-1">Quick Match</h3>
                        <p className="text-sm text-gray-400">Match with a random student instantly.</p>
                    </div>
                    <button
                        onClick={handleAutoMatch}
                        className="w-full bg-gradient-to-r from-primary to-indigo-600 py-4 rounded-2xl font-bold text-xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                    >
                        FIND MATCH
                    </button>
                </div>
            )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center flex-1 w-full text-center space-y-8">
            {generatedCode ? (
                <div className="glass p-8 rounded-2xl w-full max-w-sm">
                    <p className="text-gray-400 text-sm uppercase tracking-widest mb-2">Room Code</p>
                    <h1 className="text-6xl font-mono font-bold text-primary tracking-widest mb-4">{generatedCode}</h1>
                    <div className="flex items-center justify-center gap-2 text-yellow-400 animate-pulse">
                         <i className="fas fa-spinner fa-spin"></i>
                         <span>Waiting for friend to join...</span>
                    </div>
                </div>
            ) : (
                <>
                    <div className="w-full max-w-sm">
                        <label className="block text-left text-xs text-gray-400 mb-2 ml-1">Enter Friend's Code</label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                placeholder="0000"
                                className="flex-1 bg-surface border-2 border-white/10 rounded-xl p-4 text-center text-2xl font-mono tracking-widest focus:border-primary outline-none"
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value.slice(0, 4))}
                            />
                            <button 
                                onClick={handleJoinRoom}
                                disabled={roomCode.length !== 4 || loading}
                                className="bg-surface border-2 border-white/10 rounded-xl px-6 hover:border-green-500 hover:text-green-500 disabled:opacity-50"
                            >
                                <i className="fas fa-arrow-right"></i>
                            </button>
                        </div>
                         {status === 'invalid_code' && <p className="text-red-400 text-sm mt-2">Invalid code or room not found.</p>}
                    </div>

                    <div className="relative flex py-2 items-center w-full max-w-sm">
                        <div className="flex-grow border-t border-gray-700"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-600 text-xs">OR</span>
                        <div className="flex-grow border-t border-gray-700"></div>
                    </div>

                    <button
                        onClick={handleCreateRoom}
                        disabled={loading}
                        className="w-full max-w-sm bg-surface border border-primary/50 text-primary py-4 rounded-2xl font-bold hover:bg-primary hover:text-white transition-colors"
                    >
                        CREATE ROOM
                    </button>
                </>
            )}
        </div>
      )}
    </div>
  );
};

export default Lobby;