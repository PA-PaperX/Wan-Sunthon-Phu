'use server';

import { cookies } from 'next/headers';
import { SessionData, Question } from '../types/quiz';
import accData from '../assets/acc.json';

const COOKIE_NAME = 'quiz_session';
const MAX_AGE = 300; // 5 minutes

export async function startSession() {
  const allWords: Question[] = [...accData.daily_life_words, ...accData.transliterated_words];
  for (let i = allWords.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allWords[i], allWords[j]] = [allWords[j], allWords[i]];
  }
  const shuffled = allWords.slice(0, 5);

  const session: SessionData = {
    questions: shuffled,
    currentIndex: 0,
    score: 0,
    expiresAt: Date.now() + MAX_AGE * 1000,
    userAnswers: []
  };

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, JSON.stringify(session), {
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
    const session: SessionData = JSON.parse(sessionCookie.value);
    if (Date.now() > session.expiresAt) {
      await clearSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export async function updateSession(session: SessionData) {
  const cookieStore = await cookies();
  const remainingMs = session.expiresAt - Date.now();
  cookieStore.set(COOKIE_NAME, JSON.stringify(session), {
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
