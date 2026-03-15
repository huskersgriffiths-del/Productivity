/* ═══════════════════════════════════════════════════════════════
   app.js — Shared utilities & data layer for Momentum
═══════════════════════════════════════════════════════════════ */

// ── Storage helpers ──────────────────────────────────────────────
const store = {
  get(key, fallback = null) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
};

// ── Date helpers ─────────────────────────────────────────────────
function today() {
  return new Date().toISOString().slice(0, 10);
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

// ── Greeting ─────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// ── Daily quote ──────────────────────────────────────────────────
const QUOTES = [
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: 'Focus on being productive instead of busy.', author: 'Tim Ferriss' },
  { text: 'Small daily improvements lead to stunning results.', author: 'Robin Sharma' },
  { text: "You don't have to be great to start, but you have to start to be great.", author: 'Zig Ziglar' },
  { text: 'The way to get started is to quit talking and begin doing.', author: 'Walt Disney' },
  { text: 'Done is better than perfect.', author: 'Sheryl Sandberg' },
  { text: 'Either you run the day or the day runs you.', author: 'Jim Rohn' },
  { text: "It's not about having time, it's about making time.", author: 'Unknown' },
  { text: 'Discipline is choosing between what you want now and what you want most.', author: 'Abraham Lincoln' },
  { text: 'Success is the sum of small efforts, repeated day in and day out.', author: 'Robert Collier' },
  { text: 'Action is the foundational key to all success.', author: 'Pablo Picasso' },
  { text: 'You are what you repeatedly do.', author: 'Aristotle' },
  { text: "The key is not to prioritize what's on your schedule, but to schedule your priorities.", author: 'Stephen Covey' },
  { text: 'Excellence is not a destination but a continuous journey.', author: 'Brian Tracy' },
  { text: 'What you do today can improve all your tomorrows.', author: 'Ralph Marston' },
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { text: "Believe you can and you're halfway there.", author: 'Theodore Roosevelt' },
  { text: "Hard work beats talent when talent doesn't work hard.", author: 'Tim Notke' },
  { text: 'Energy and persistence conquer all things.', author: 'Benjamin Franklin' },
  { text: 'The difference between ordinary and extraordinary is that little extra.', author: 'Jimmy Johnson' },
  { text: 'Motivation is what gets you started. Habit is what keeps you going.', author: 'Jim Ryun' },
  { text: "Don't watch the clock; do what it does — keep going.", author: 'Sam Levenson' },
  { text: 'The future depends on what you do today.', author: 'Mahatma Gandhi' },
  { text: "You miss 100% of the shots you don't take.", author: 'Wayne Gretzky' },
  { text: "It always seems impossible until it's done.", author: 'Nelson Mandela' },
  { text: 'Our greatest glory is not in never falling, but in rising every time we fall.', author: 'Confucius' },
  { text: 'One day or day one. You decide.', author: 'Unknown' },
  { text: 'Push yourself, because no one else is going to do it for you.', author: 'Unknown' },
  { text: 'Little by little, a little becomes a lot.', author: 'Tanzanian Proverb' },
  { text: 'Start where you are. Use what you have. Do what you can.', author: 'Arthur Ashe' },
  { text: 'We are what we repeatedly do. Excellence, then, is not an act but a habit.', author: 'Aristotle' },
];

function getDailyQuote() {
  const start = new Date(new Date().getFullYear(), 0, 1);
  const day = Math.floor((Date.now() - start.getTime()) / 86400000);
  return QUOTES[day % QUOTES.length];
}

// ── Active nav link ──────────────────────────────────────────────
function setActiveNav() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === page);
  });
}

// ── Habit streak helpers ─────────────────────────────────────────
function getHabitStreak(habits, completions) {
  if (!habits.length) return 0;
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 366; i++) {
    const key = dateKey(d);
    const dayComp = completions[key] || {};
    if (!habits.every(h => dayComp[h.id])) break;
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function getHabitIndividualStreak(habitId, completions) {
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 366; i++) {
    const key = dateKey(d);
    if (!(completions[key] || {})[habitId]) break;
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function getBestStreak(habitId, completions) {
  const dates = Object.keys(completions)
    .filter(key => (completions[key] || {})[habitId])
    .sort();
  if (!dates.length) return 0;
  let best = 1, current = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = Math.round((curr - prev) / 86400000);
    if (diff === 1) { current++; if (current > best) best = current; }
    else { current = 1; }
  }
  return best;
}

function getHabitMonthStats(habitId, completions, year, month) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const now = new Date();
  const todayStr = today();
  let done = 0, pastDays = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    if (key > todayStr) break;
    pastDays++;
    if ((completions[key] || {})[habitId]) done++;
  }
  return { done, pastDays, rate: pastDays > 0 ? Math.round((done / pastDays) * 100) : 0 };
}

// ── Productivity Score ────────────────────────────────────────────
// Each day scores 0–100 across three pillars:
//   Habits  (0–40): % of habits completed × 40
//   Tasks   (0–30): min(completed / 5, 1) × 30  (5 tasks = full marks)
//   Focus   (0–30): min(minutes / 120, 1) × 30  (2 hrs = full marks)
//
// The overall score is an exponentially-weighted 14-day rolling average
// (decay = 0.78/day) so recent days dominate — 100 is achievable after
// ~7 consecutive high-scoring days and drops visibly after a bad stretch.

function getDayScore(dateStr) {
  const habits = store.get('habits', []);
  const completions = store.get('habit_completions', {});
  const tasks = store.get('tasks', []);
  const focusSessions = store.get('focus_sessions', []);

  // Habits (0–40)
  const dayComp = completions[dateStr] || {};
  const habitsDone = habits.filter(h => dayComp[h.id]).length;
  const habitRate = habits.length > 0 ? habitsDone / habits.length : 0;
  const habitScore = habitRate * 40;

  // Tasks (0–30)
  const tasksDone = tasks.filter(t => t.done && t.doneDate === dateStr).length;
  const taskScore = Math.min(tasksDone / 5, 1) * 30;

  // Focus (0–30)
  const focusMin = focusSessions
    .filter(s => s.date === dateStr && s.mode === 'focus')
    .reduce((a, s) => a + s.minutes, 0);
  const focusScore = Math.min(focusMin / 120, 1) * 30;

  return {
    total: Math.round(habitScore + taskScore + focusScore),
    habitRate,
    habitsDone,
    habitsTotal: habits.length,
    tasksDone,
    focusMin,
  };
}

function getProductivityScore() {
  let weightedSum = 0;
  let totalWeight = 0;
  const dailyScores = [];
  const DECAY = 0.78;

  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = dateKey(d);
    const { total } = getDayScore(key);
    const weight = Math.pow(DECAY, i);
    weightedSum += total * weight;
    totalWeight += weight;
    dailyScores.push({ key, score: total, dayLabel: d.toLocaleDateString('en-US', { weekday: 'short' }), isToday: i === 0 });
  }

  const score = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
  return { score, dailyScores: dailyScores.reverse() };
}

function getWeeklyScores() {
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = dateKey(d);
    const { total } = getDayScore(key);
    result.push({
      key,
      score: total,
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      isToday: i === 0,
    });
  }
  return result;
}

function getScoreColor(score) {
  if (score >= 80) return '#4ade80';   // green — high achiever
  if (score >= 55) return '#7c6af7';   // purple — solid momentum
  if (score >= 30) return '#fbbf24';   // yellow — building
  return '#f87171';                     // red — just starting
}

function getScoreLabel(score) {
  if (score >= 91) return 'Peak State 🔥';
  if (score >= 76) return 'High Achiever';
  if (score >= 61) return 'Strong Momentum';
  if (score >= 41) return 'Gaining Ground';
  if (score >= 21) return 'Building Habits';
  if (score >= 1)  return 'Just Starting';
  return 'No Data Yet';
}

// ── Summary stats (home page) ────────────────────────────────────
function getStats() {
  const t = today();
  const habits = store.get('habits', []);
  const completions = store.get('habit_completions', {});
  const tasks = store.get('tasks', []);
  const focusSessions = store.get('focus_sessions', []);
  return {
    habitStreak: getHabitStreak(habits, completions),
    tasksToday: tasks.filter(tk => tk.done && tk.doneDate === t).length,
    focusToday: focusSessions.filter(s => s.date === t).reduce((a, s) => a + s.minutes, 0),
  };
}

// ── Focus timer sound ────────────────────────────────────────────
function playBeep(freq = 880, duration = 0.4) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (_) { }
}

// ── Init ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', setActiveNav);
