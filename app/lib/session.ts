import { SessionData, Question } from '../types/quiz';
import accData from '../assets/acc.json';

const STORAGE_KEY = 'quiz_session';
const SEEN_STORAGE_KEY = 'seen_questions';
const MAX_AGE = 300; // 5 minutes

interface LocalStorageSession {
  questionIds: number[];
  currentIndex: number;
  score: number;
  expiresAt: number;
  completed?: boolean;
  userAnswers: string[];
}

export function startSession() {
  const allWords: Question[] = [
    ...accData.daily_life_words.map(w => ({...w, category: 'daily_life_words'})), 
    ...accData.transliterated_words.map(w => ({...w, category: 'transliterated_words'})),
    ...(accData.controversial_words || []).map(w => ({...w, category: 'controversial_words'}))
  ] as Question[];

  let seenIds: number[] = [];
  try {
    const seenStr = localStorage.getItem(SEEN_STORAGE_KEY);
    if (seenStr) seenIds = JSON.parse(seenStr);
  } catch (e) {
    seenIds = [];
  }

  let availableWords = allWords.filter(w => !seenIds.includes(w.id));
  if (availableWords.length < 10) {
    availableWords = allWords;
    seenIds = [];
  }

  for (let i = availableWords.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [availableWords[i], availableWords[j]] = [availableWords[j], availableWords[i]];
  }
  const shuffled = availableWords.slice(0, 10);
  
  seenIds = [...seenIds, ...shuffled.map(q => q.id)];

  const storageSession: LocalStorageSession = {
    questionIds: shuffled.map(q => q.id),
    currentIndex: 0,
    score: 0,
    expiresAt: Date.now() + MAX_AGE * 1000,
    userAnswers: []
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(storageSession));
  localStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify(seenIds));
}

export function getSession(): SessionData | null {
  if (typeof window === 'undefined') return null;
  const sessionStr = localStorage.getItem(STORAGE_KEY);
  if (!sessionStr) return null;

  try {
    const storageSession: LocalStorageSession = JSON.parse(sessionStr);
    if (Date.now() > storageSession.expiresAt) {
      clearSession();
      return null;
    }
    
    const allWords: Question[] = [
      ...accData.daily_life_words.map(w => ({...w, category: 'daily_life_words'})), 
      ...accData.transliterated_words.map(w => ({...w, category: 'transliterated_words'})),
      ...(accData.controversial_words || []).map(w => ({...w, category: 'controversial_words'}))
    ] as Question[];
    const questions = storageSession.questionIds.map(id => allWords.find(w => w.id === id)).filter(Boolean) as Question[];

    return {
      questions,
      currentIndex: storageSession.currentIndex,
      score: storageSession.score,
      expiresAt: storageSession.expiresAt,
      completed: storageSession.completed,
      userAnswers: storageSession.userAnswers
    };
  } catch {
    return null;
  }
}

export function updateSession(session: SessionData) {
  const storageSession: LocalStorageSession = {
    questionIds: session.questions.map(q => q.id),
    currentIndex: session.currentIndex,
    score: session.score,
    expiresAt: session.expiresAt,
    completed: session.completed,
    userAnswers: session.userAnswers
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(storageSession));
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}
