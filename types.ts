export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  avatar: string;
  points: number;
  activeMatch?: string | null;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // Index 0-3
  subject: 'math' | 'general';
}

export interface MatchState {
  matchId: string;
  status: 'active' | 'finished' | 'waiting';
  players: {
    [uid: string]: {
      name: string;
      avatar: string;
      score: number;
      connected: boolean;
    }
  };
  turn: string; // uid of current turn
  currentQuestionIndex: number;
  questions: Question[]; // Subset of questions for this match
  winner?: string | 'draw';
  lastActivity: number;
}

export interface QueueItem {
  uid: string;
  timestamp: number;
}
