import { Question } from './types';

export const AVATARS = [
  'https://picsum.photos/seed/felix/150',
  'https://picsum.photos/seed/ane/150',
  'https://picsum.photos/seed/yo/150',
  'https://picsum.photos/seed/ma/150',
  'https://picsum.photos/seed/so/150',
  'https://picsum.photos/seed/li/150',
];

export const DEMO_DATA: { math: Question[]; general: Question[] } = {
  math: [
    { id: 'm1', question: '5 + 7 = ?', options: ['10', '11', '12', '13'], correctAnswer: 2, subject: 'math' },
    { id: 'm2', question: '15 x 3 = ?', options: ['35', '40', '45', '50'], correctAnswer: 2, subject: 'math' },
    { id: 'm3', question: 'Square root of 81?', options: ['7', '8', '9', '6'], correctAnswer: 2, subject: 'math' },
    { id: 'm4', question: '20 / 4 = ?', options: ['5', '4', '6', '10'], correctAnswer: 0, subject: 'math' },
    { id: 'm5', question: '100 - 37 = ?', options: ['53', '63', '73', '67'], correctAnswer: 1, subject: 'math' },
  ],
  general: [
    { id: 'g1', question: 'Capital of Somalia?', options: ['Hargeisa', 'Mogadishu', 'Kismayo', 'Bosaso'], correctAnswer: 1, subject: 'general' },
    { id: 'g2', question: 'Number of continents?', options: ['5', '6', '7', '8'], correctAnswer: 2, subject: 'general' },
    { id: 'g3', question: 'Largest ocean?', options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], correctAnswer: 3, subject: 'general' },
    { id: 'g4', question: 'H2O is?', options: ['Salt', 'Water', 'Air', 'Gold'], correctAnswer: 1, subject: 'general' },
    { id: 'g5', question: 'Fastest land animal?', options: ['Lion', 'Cheetah', 'Horse', 'Leopard'], correctAnswer: 1, subject: 'general' },
  ]
};

export const POINTS_PER_CORRECT = 10;
export const MATCH_TIMEOUT_MS = 30000;
