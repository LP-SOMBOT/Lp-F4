import React, { useEffect, useState, useRef } from 'react';
import firebase from 'firebase/compat/app';
import { ref, onValue, off } from 'firebase/database';
import { db } from '../firebase';
import { MatchState, Question } from '../types';
import { submitAnswer, leaveMatch, getRandomQuestions } from '../services/gameService';
import { Howl } from 'howler';
import confetti from 'canvas-confetti';

interface GameProps {
  user: firebase.User;
  mode: 'multiplayer' | 'solo';
}

const correctSound = new Howl({ src: ['https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.mp3'] });
const wrongSound = new Howl({ src: ['https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-946.mp3'] });
const winSound = new Howl({ src: ['https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3'] });

const Game: React.FC<GameProps> = ({ user, mode }) => {
  const [matchState, setMatchState] = useState<MatchState | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);
  
  // Solo Mode State
  const [soloQuestions, setSoloQuestions] = useState<Question[]>([]);
  const [soloIndex, setSoloIndex] = useState(0);
  const [soloScore, setSoloScore] = useState(0);

  useEffect(() => {
    if (mode === 'multiplayer') {
      // Get active match ID from user profile first (handled in App, but double check)
      const userRef = ref(db, `users/${user.uid}/activeMatch`);
      
      const unsubscribeUser = onValue(userRef, (snap) => {
        const matchId = snap.val();
        if (matchId) {
          const matchRef = ref(db, `matches/${matchId}`);
          const unsubscribeMatch = onValue(matchRef, (matchSnap) => {
            if (matchSnap.exists()) {
                const val = matchSnap.val();
                setMatchState(val);

                // Check winner
                if (val.status === 'finished' && !showFeedback) {
                     if (val.winner === user.uid) {
                         winSound.play();
                         confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                     }
                }
            } else {
                // Match deleted or finished
                window.location.hash = '#lobby';
            }
          });
          return () => unsubscribeMatch();
        } else {
             window.location.hash = '#lobby';
        }
      });
      return () => unsubscribeUser();
    } else {
        // Init Solo
        setSoloQuestions(getRandomQuestions('math', 5));
        setSoloIndex(0);
        setSoloScore(0);
    }
  }, [mode, user.uid]);

  // Reset local turn state when question changes
  useEffect(() => {
      setSelectedOption(null);
      setShowFeedback(null);
      setIsProcessing(false);
  }, [matchState?.currentQuestionIndex, soloIndex]);

  const handleOptionClick = async (index: number) => {
    if (selectedOption !== null || isProcessing) return;
    
    // Logic Gate
    if (mode === 'multiplayer') {
        if (!matchState || matchState.turn !== user.uid) return;
    }

    setSelectedOption(index);
    setIsProcessing(true); // Lock input immediately

    const currentQ = mode === 'multiplayer' 
        ? matchState!.questions[matchState!.currentQuestionIndex]
        : soloQuestions[soloIndex];

    const isCorrect = index === currentQ.correctAnswer;
    
    // Slight delay for feedback to build tension ("Blind Answering")
    setTimeout(async () => {
        setShowFeedback(isCorrect ? 'correct' : 'wrong');
        if (isCorrect) correctSound.play();
        else wrongSound.play();

        // Wait another second to show result color, then process logic
        setTimeout(async () => {
            if (mode === 'multiplayer' && matchState) {
                const opponentUid = Object.keys(matchState.players).find(id => id !== user.uid);
                const isMatchOver = matchState.currentQuestionIndex === matchState.questions.length - 1 && user.uid === Object.keys(matchState.players)[1]; 
                
                const playerIds = Object.keys(matchState.players);
                const nextTurn = opponentUid!;
                
                await submitAnswer(matchState.matchId, user.uid, isCorrect, nextTurn, isMatchOver);
            } else {
                // Solo Logic
                if (isCorrect) setSoloScore(s => s + 1);
                if (soloIndex < soloQuestions.length - 1) {
                    setSoloIndex(i => i + 1);
                } else {
                    // End Solo
                }
            }
        }, 1000);
    }, 500);
  };

  const quitGame = async () => {
      if (mode === 'multiplayer' && matchState) {
          await leaveMatch(user.uid, matchState.matchId);
      }
      window.location.hash = '#home';
  };

  // --- RENDER HELPERS ---

  if (mode === 'multiplayer' && !matchState) return <div className="p-10 text-center">Loading Battle...</div>;

  const currentQ = mode === 'multiplayer' 
    ? matchState!.questions[matchState!.currentQuestionIndex]
    : soloQuestions[soloIndex];

  // If game finished
  if ((mode === 'multiplayer' && matchState?.status === 'finished') || (mode === 'solo' && soloIndex >= soloQuestions.length && showFeedback)) {
      const isWinner = mode === 'multiplayer' ? matchState?.winner === user.uid : soloScore > 2;
      return (
          <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate__animated animate__fadeIn">
             <i className={`fas ${isWinner ? 'fa-trophy text-yellow-400' : 'fa-skull-crossbones text-gray-500'} text-6xl mb-6 animate__animated animate__bounceIn`}></i>
             <h1 className="text-4xl font-bold mb-2">{isWinner ? 'VICTORY!' : (matchState?.winner === 'draw' ? 'DRAW' : 'DEFEAT')}</h1>
             <p className="text-gray-400 mb-8">
                 {mode === 'multiplayer' 
                    ? `Score: ${matchState?.players[user.uid].score}` 
                    : `You got ${soloScore} out of ${soloQuestions.length} correct!`}
             </p>
             <button onClick={quitGame} className="bg-primary px-8 py-3 rounded-xl font-bold">Continue</button>
          </div>
      )
  }

  // Determine Players (for top bar)
  let me, opp;
  if (mode === 'multiplayer' && matchState) {
      me = matchState.players[user.uid];
      const oppId = Object.keys(matchState.players).find(id => id !== user.uid);
      opp = oppId ? matchState.players[oppId] : null;
  }

  return (
    <div className="h-full flex flex-col p-4 relative">
      {/* VS Header with Detailed Player Banners */}
      {mode === 'multiplayer' && me && opp && (
          <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Me Banner */}
              <div className={`relative p-3 rounded-2xl border transition-all duration-300 flex flex-col items-center overflow-hidden ${matchState?.turn === user.uid ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(139,92,246,0.2)]' : 'bg-surface border-white/5 opacity-70'}`}>
                  {/* Indicator Label */}
                  <div className="absolute top-2 left-2 z-10">
                       <span className="text-[10px] font-bold text-gray-400">YOU</span>
                  </div>
                  
                  {/* Avatar & Level */}
                  <div className="relative mt-2 mb-2">
                      <img src={me.avatar} className={`w-14 h-14 rounded-full object-cover border-2 transition-colors ${matchState?.turn === user.uid ? 'border-primary' : 'border-gray-500'}`} />
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-surface px-2 py-0.5 rounded-md border border-white/10 shadow-sm z-20">
                          <span className="text-[10px] font-bold whitespace-nowrap text-white">LVL {me.level || 1}</span>
                      </div>
                  </div>
                  
                  {/* Name */}
                  <div className="text-sm font-bold mt-2 truncate max-w-full px-1 w-full text-center">{me.name}</div>
                  
                  {/* Score */}
                  <div className={`text-2xl font-black mt-1 ${matchState?.turn === user.uid ? 'text-primary' : 'text-gray-400'}`}>
                      {me.score}
                  </div>
              </div>

              {/* Opponent Banner */}
              <div className={`relative p-3 rounded-2xl border transition-all duration-300 flex flex-col items-center overflow-hidden ${matchState?.turn !== user.uid ? 'bg-secondary/10 border-secondary shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-surface border-white/5 opacity-70'}`}>
                   <div className="absolute top-2 right-2 z-10">
                       <span className="text-[10px] font-bold text-gray-400">OPP</span>
                  </div>
                  
                  <div className="relative mt-2 mb-2">
                      <img src={opp.avatar} className={`w-14 h-14 rounded-full object-cover border-2 transition-colors ${matchState?.turn !== user.uid ? 'border-secondary' : 'border-gray-500'}`} />
                       <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-surface px-2 py-0.5 rounded-md border border-white/10 shadow-sm z-20">
                          <span className="text-[10px] font-bold whitespace-nowrap text-white">LVL {opp.level || 1}</span>
                      </div>
                  </div>
                  
                  <div className="text-sm font-bold mt-2 truncate max-w-full px-1 w-full text-center">{opp.name}</div>
                  
                  <div className={`text-2xl font-black mt-1 ${matchState?.turn !== user.uid ? 'text-secondary' : 'text-gray-400'}`}>
                      {opp.score}
                  </div>
              </div>
          </div>
      )}

      {/* Solo Header */}
      {mode === 'solo' && (
          <div className="flex justify-between items-center mb-6 px-2">
              <button onClick={quitGame} className="text-gray-400 hover:text-white"><i className="fas fa-arrow-left"></i> Quit</button>
              <span className="font-mono text-primary">Q: {soloIndex + 1}/{soloQuestions.length}</span>
          </div>
      )}

      {/* Question Card */}
      <div className="flex-1 flex flex-col justify-center">
         {currentQ ? (
             <>
                <div className="glass-high p-8 rounded-2xl mb-8 min-h-[160px] flex items-center justify-center text-center shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                    <h2 className="text-2xl font-bold leading-relaxed">{currentQ.question}</h2>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    {currentQ.options.map((opt, idx) => {
                        let btnClass = "bg-surface border-2 border-white/5";
                        
                        if (selectedOption === idx) {
                            if (showFeedback === 'correct') btnClass = "bg-green-500/20 border-green-500 text-green-100";
                            else if (showFeedback === 'wrong') btnClass = "bg-red-500/20 border-red-500 text-red-100";
                            else btnClass = "bg-blue-500/20 border-blue-500 text-blue-100 animate-pulse";
                        } else if (matchState?.turn !== user.uid && mode === 'multiplayer') {
                             btnClass = "opacity-50 cursor-not-allowed bg-surface border-transparent";
                        }

                        return (
                            <button
                                key={idx}
                                disabled={(mode === 'multiplayer' && matchState?.turn !== user.uid) || isProcessing}
                                onClick={() => handleOptionClick(idx)}
                                className={`p-4 rounded-xl font-medium text-lg transition-all active:scale-95 ${btnClass} shadow-md`}
                            >
                                {opt}
                            </button>
                        )
                    })}
                </div>
                
                {mode === 'multiplayer' && matchState?.turn !== user.uid && (
                    <div className="mt-6 text-center text-gray-500 text-sm animate-pulse">
                        Waiting for opponent...
                    </div>
                )}
             </>
         ) : (
             <div className="text-center">Loading Question...</div>
         )}
      </div>
    </div>
  );
};

export default Game;