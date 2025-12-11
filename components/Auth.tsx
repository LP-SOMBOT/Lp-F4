import React, { useState } from 'react';
import { auth, db } from '../firebase';
import * as firebaseAuth from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { AVATARS } from '../constants';

const { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } = firebaseAuth;

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCred.user;
        
        // Create DB Entry
        await set(ref(db, `users/${user.uid}`), {
          uid: user.uid,
          name: name || 'Student',
          email,
          points: 0,
          avatar: selectedAvatar,
          activeMatch: null
        });

        await updateProfile(user, { displayName: name, photoURL: selectedAvatar });
      }
    } catch (err: any) {
      setError(err.message.replace('Firebase:', ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 relative z-10">
        {/* Background elements */}
        <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-primary/20 rounded-full blur-[80px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-secondary/20 rounded-full blur-[80px]"></div>

      <div className="w-full max-w-md glass p-8 rounded-3xl animate__animated animate__fadeInUp">
        <h2 className="text-3xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-300">
          {isLogin ? 'Welcome Back' : 'Join the Battle'}
        </h2>
        <p className="text-center text-gray-400 mb-8 text-sm">
          {isLogin ? 'Login to continue your streak' : 'Create an account to compete'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
                <div>
                    <label className="block text-xs text-gray-400 mb-1 ml-1">Nickname</label>
                    <input
                        type="text"
                        placeholder="Your Name"
                        className="w-full bg-surface/50 border border-white/10 rounded-xl p-4 focus:border-primary focus:outline-none transition-colors text-white"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs text-gray-400 mb-2 ml-1">Choose Avatar</label>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {AVATARS.map((av) => (
                            <img 
                                key={av} 
                                src={av} 
                                alt="avatar" 
                                className={`w-12 h-12 rounded-full border-2 cursor-pointer transition-all ${selectedAvatar === av ? 'border-primary scale-110' : 'border-transparent opacity-50'}`}
                                onClick={() => setSelectedAvatar(av)}
                            />
                        ))}
                    </div>
                </div>
            </>
          )}

          <div>
             <label className="block text-xs text-gray-400 mb-1 ml-1">Email</label>
            <input
                type="email"
                placeholder="student@example.com"
                className="w-full bg-surface/50 border border-white/10 rounded-xl p-4 focus:border-primary focus:outline-none transition-colors text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
          </div>

          <div>
             <label className="block text-xs text-gray-400 mb-1 ml-1">Password</label>
            <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-surface/50 border border-white/10 rounded-xl p-4 focus:border-primary focus:outline-none transition-colors text-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
          </div>

          {error && <p className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded-lg">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-purple-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/30 transition-all active:scale-95 mt-4"
          >
            {loading ? <i className="fas fa-spinner fa-spin"></i> : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-400">
          {isLogin ? "New here?" : "Already have an account?"}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary font-bold hover:underline"
          >
            {isLogin ? 'Create Account' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;