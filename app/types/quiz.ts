export interface Question {
  id: number;
  correct: string;
  wrong: string;
  explanation: string;
}

export interface SessionData {
  questions: Question[];
  currentIndex: number;
  score: number;
  expiresAt: number;
  completed?: boolean;
  userAnswers: string[];
}
