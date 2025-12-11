import { db } from '../firebase';
import { ref, set, push, get, remove, update, onDisconnect, runTransaction, serverTimestamp } from 'firebase/database';
import { DEMO_DATA, POINTS_PER_CORRECT } from '../constants';
import { Question } from '../types';

// Helper to get random questions
export const getRandomQuestions = (subject: 'math' | 'general', count: number = 5): Question[] => {
  const pool = DEMO_DATA[subject];
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// AUTO MATCHMAKING
export const joinQueue = async (uid: string, subject: 'math' | 'general') => {
  const queueRef = ref(db, `queue/${subject}`);
  const snapshot = await get(queueRef);

  if (snapshot.exists()) {
    // Check for opponent
    let opponentUid: string | null = null;
    let opponentKey: string | null = null;

    snapshot.forEach((child) => {
      if (child.val().uid !== uid) {
        opponentUid = child.val().uid;
        opponentKey = child.key;
        return true; // Break
      }
    });

    if (opponentUid && opponentKey) {
      // Found opponent, create match
      await remove(ref(db, `queue/${subject}/${opponentKey}`)); // Remove opponent from queue
      return createMatch([uid, opponentUid!], subject);
    }
  }

  // No opponent, add self to queue
  const newQueueRef = push(queueRef);
  const queueData = { uid, timestamp: serverTimestamp() };
  await set(newQueueRef, queueData);
  
  // Remove self on disconnect if still in queue
  onDisconnect(newQueueRef).remove();
  
  return null; // Waiting
};

// CREATE MATCH
const createMatch = async (uids: string[], subject: 'math' | 'general') => {
  const matchId = `match_${Date.now()}`;
  const questions = getRandomQuestions(subject);
  
  // Fetch user details for initial state
  const playersData: any = {};
  for (const uid of uids) {
    const userSnap = await get(ref(db, `users/${uid}`));
    const userVal = userSnap.val();
    playersData[uid] = {
      name: userVal.name,
      avatar: userVal.avatar,
      score: 0,
      connected: true
    };
  }

  const matchData = {
    matchId,
    status: 'active',
    players: playersData,
    turn: uids[0], // First player starts
    currentQuestionIndex: 0,
    questions,
    lastActivity: serverTimestamp()
  };

  await set(ref(db, `matches/${matchId}`), matchData);

  // Set active match for players
  const updates: any = {};
  uids.forEach(uid => {
    updates[`users/${uid}/activeMatch`] = matchId;
  });
  await update(ref(db), updates);

  return matchId;
};

// CUSTOM ROOMS
export const createRoom = async (hostUid: string, subject: 'math' | 'general') => {
  const code = Math.floor(1000 + Math.random() * 9000).toString(); // 4 digit
  await set(ref(db, `rooms/${code}`), {
    host: hostUid,
    subject,
    created: serverTimestamp()
  });
  
  // Clean up room on disconnect
  onDisconnect(ref(db, `rooms/${code}`)).remove();
  
  return code;
};

export const joinRoom = async (code: string, joinerUid: string) => {
  const roomRef = ref(db, `rooms/${code}`);
  const snap = await get(roomRef);
  
  if (!snap.exists()) throw new Error("Room not found");
  
  const { host, subject } = snap.val();
  if (host === joinerUid) throw new Error("Cannot join your own room");

  // Create match
  await remove(roomRef); // Delete room
  return createMatch([host, joinerUid], subject);
};

// GAMEPLAY
export const submitAnswer = async (matchId: string, uid: string, isCorrect: boolean, nextTurnUid: string, isMatchOver: boolean) => {
  const matchRef = ref(db, `matches/${matchId}`);
  
  await runTransaction(matchRef, (match) => {
    if (match) {
      // Update Score
      if (isCorrect) {
        match.players[uid].score = (match.players[uid].score || 0) + POINTS_PER_CORRECT;
      }

      if (isMatchOver) {
        match.status = 'finished';
        // Determine winner
        const p1 = Object.keys(match.players)[0];
        const p2 = Object.keys(match.players)[1];
        const s1 = match.players[p1].score;
        const s2 = match.players[p2].score;
        
        if (s1 > s2) match.winner = p1;
        else if (s2 > s1) match.winner = p2;
        else match.winner = 'draw';

      } else {
        // Next Turn & Question
        match.turn = nextTurnUid;
        // Only advance question index if the SECOND player just finished their turn on this question
        // Or simplified: Advance question index every 2 turns? 
        // Logic: Turn based. P1 answers Q1 -> P2 answers Q1 -> P1 answers Q2.
        
        // Let's check who just played. If it was the second player in the list, increment Q index.
        const playerIds = Object.keys(match.players);
        if (uid === playerIds[1]) {
           match.currentQuestionIndex = (match.currentQuestionIndex || 0) + 1;
        }
      }
      match.lastActivity = serverTimestamp();
    }
    return match;
  });

  // If match over, update global user points
  if (isMatchOver && isCorrect) {
    const userRef = ref(db, `users/${uid}/points`);
    await runTransaction(userRef, (points) => (points || 0) + POINTS_PER_CORRECT);
  }
};

export const leaveMatch = async (uid: string, matchId: string) => {
    // Remove active match reference
    await set(ref(db, `users/${uid}/activeMatch`), null);
    
    // If last player, maybe cleanup match? Kept simple for now.
}