'use server';

import { cookies } from 'next/headers';
import { SessionData, Question } from '../types/quiz';
import accData from '../assets/acc.json';

const COOKIE_NAME = 'quiz_session';
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
  const allWords: Question[] = [...accData.daily_life_words, ...accData.transliterated_words] as Question[];
  for (let i = allWords.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allWords[i], allWords[j]] = [allWords[j], allWords[i]];
  }
  const shuffled = allWords.slice(0, 5);

  const cookieSession: CookieSession = {
    questionIds: shuffled.map(q => q.id),
    currentIndex: 0,
    score: 0,
    expiresAt: Date.now() + MAX_AGE * 1000,
    userAnswers: []
  };

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, JSON.stringify(cookieSession), {
    maxAge: MAX_AGE,
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
    const allWords: Question[] = [...accData.daily_life_words, ...accData.transliterated_words] as Question[];
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
