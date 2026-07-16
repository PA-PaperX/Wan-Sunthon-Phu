'use server';

import { cookies } from 'next/headers';
import { SessionData, Question } from '../types/quiz';
import accData from '../assets/acc.json';

const COOKIE_NAME = 'quiz_session';
const SEEN_COOKIE_NAME = 'seen_questions';
const MAX_AGE = 300; // 5 minutes

interface CookieSession {
  questionIds: number[];
  currentIndex: number;
  score: number;
  expiresAt: number;
  completed?: boolean;
  userAnswers: string[];
}

export async function startSession() {
  const allWords: Question[] = [
    ...accData.daily_life_words.map(w => ({...w, category: 'daily_life_words'})), 
    ...accData.transliterated_words.map(w => ({...w, category: 'transliterated_words'})),
    ...(accData.controversial_words || []).map(w => ({...w, category: 'controversial_words'}))
  ] as Question[];

  const cookieStore = await cookies();
  const seenCookie = cookieStore.get(SEEN_COOKIE_NAME);
  let seenIds: number[] = [];
  try {
    if (seenCookie) seenIds = JSON.parse(seenCookie.value);
  } catch (e) {
    seenIds = [];
  }

  let availableWords = allWords.filter(w => !seenIds.includes(w.id));
  if (availableWords.length < 10) {
    // Reset if almost all words have been played
    availableWords = allWords;
    seenIds = [];
  }

  for (let i = availableWords.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [availableWords[i], availableWords[j]] = [availableWords[j], availableWords[i]];
  }
  const shuffled = availableWords.slice(0, 10);
  
  seenIds = [...seenIds, ...shuffled.map(q => q.id)];

  const cookieSession: CookieSession = {
    questionIds: shuffled.map(q => q.id),
    currentIndex: 0,
    score: 0,
    expiresAt: Date.now() + MAX_AGE * 1000,
    userAnswers: []
  };

  cookieStore.set(COOKIE_NAME, JSON.stringify(cookieSession), {
    maxAge: MAX_AGE,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax',
  });

  cookieStore.set(SEEN_COOKIE_NAME, JSON.stringify(seenIds), {
    maxAge: 60 * 60 * 24 * 365, // Remember for 1 year
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax',
  });
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);
  if (!sessionCookie) return null;

  try {
    const cookieSession: CookieSession = JSON.parse(sessionCookie.value);
    if (Date.now() > cookieSession.expiresAt) {
      await clearSession();
      return null;
    }
    
    // Inflate
    const allWords: Question[] = [
      ...accData.daily_life_words.map(w => ({...w, category: 'daily_life_words'})), 
      ...accData.transliterated_words.map(w => ({...w, category: 'transliterated_words'})),
      ...(accData.controversial_words || []).map(w => ({...w, category: 'controversial_words'}))
    ] as Question[];
    const questions = cookieSession.questionIds.map(id => allWords.find(w => w.id === id)).filter(Boolean) as Question[];

    const session: SessionData = {
      questions,
      currentIndex: cookieSession.currentIndex,
      score: cookieSession.score,
      expiresAt: cookieSession.expiresAt,
      completed: cookieSession.completed,
      userAnswers: cookieSession.userAnswers
    };
    return session;
  } catch {
    return null;
  }
}

export async function updateSession(session: SessionData) {
  const cookieSession: CookieSession = {
    questionIds: session.questions.map(q => q.id),
    currentIndex: session.currentIndex,
    score: session.score,
    expiresAt: session.expiresAt,
    completed: session.completed,
    userAnswers: session.userAnswers
  };

  const cookieStore = await cookies();
  const remainingMs = cookieSession.expiresAt - Date.now();
  cookieStore.set(COOKIE_NAME, JSON.stringify(cookieSession), {
    maxAge: Math.max(0, Math.floor(remainingMs / 1000)),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax',
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
