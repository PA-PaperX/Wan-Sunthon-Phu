# Thai Word Quiz App - Design Spec

## 1. Overview
Mobile-friendly web application for testing Thai word spelling (คำผิด-คำถูก).
Requirements based on `project.md`.

## 2. Architecture & State Management
- **Framework:** Next.js (App Router)
- **State Management:** Server-side Cookies (Session)
- **Session Duration:** 5 minutes (300 seconds). Preserves state across page refreshes.

## 3. Data Flow
1. **Questions Source:** `app/assets/acc.json`. Contains `daily_life_words` and `transliterated_words`.
2. **Session Initialization:** When user clicks "Start" on Home, a Server Action randomly selects 5 questions, creates a session object, and sets a cookie.
3. **Session Object Structure:**
   ```typescript
   {
     questions: Question[]; // 5 randomized questions
     currentIndex: number;  // 0 to 4
     score: number;         // 0 to 5
     expiresAt: number;     // timestamp (+5 mins)
   }
   ```

## 4. Pages Structure
### 4.1 Home Page (`/`)
- Mobile-first layout.
- Displays cover image (`/first.png`).
- "Start" button triggers session initialization and redirects to `/quiz`.

### 4.2 Quiz Page (`/quiz`)
- Reads session cookie on server.
- If no cookie or expired, redirects to `/`.
- Displays current question (correct vs wrong word as options).
- On answer selection:
  - Validates answer.
  - Updates score and `currentIndex` in cookie via Server Action.
  - Shows explanation/answer.
  - "Next" button goes to next question or `/result` if finished.

### 4.3 Result Page (`/result`)
- Displays final score (e.g., "4/5").
- Clears session cookie.
- "Play Again" button redirects to `/`.

## 5. UI/UX (Mobile-friendly)
- Follows `Design.md` theme (Gold/Cream/Brown).
- Large touch targets for buttons.
- Responsive container (max-width for mobile view on desktop).
