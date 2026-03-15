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
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function formatDate(isoStr) {
  const [y, m, d] = isoStr.split('-');
  const date = new Date(+y, +m - 1, +d);
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
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
  { text: 'The key is not to prioritize what\'s on your schedule, but to schedule your priorities.', author: 'Stephen Covey' },
  { text: 'Excellence is not a destination but a continuous journey.', author: 'Brian Tracy' },
  { text: 'What you do today can improve all your tomorrows.', author: 'Ralph Marston' },
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { text: 'Believe you can and you\'re halfway there.', author: 'Theodore Roosevelt' },
  { text: 'Hard work beats talent when talent doesn\'t work hard.', author: 'Tim Notke' },
  { text: 'Energy and persistence conquer all things.', author: 'Benjamin Franklin' },
  { text: 'The difference between ordinary and extraordinary is that little extra.', author: 'Jimmy Johnson' },
  { text: 'Motivation is what gets you started. Habit is what keeps you going.', author: 'Jim Ryun' },
  { text: 'Don\'t watch the clock; do what it does — keep going.', author: 'Sam Levenson' },
  { text: 'The future depends on what you do today.', author: 'Mahatma Gandhi' },
  { text: 'You miss 100% of the shots you don\'t take.', author: 'Wayne Gretzky' },
  { text: 'It always seems impossible until it\'s done.', author: 'Nelson Mandela' },
  { text: 'Our greatest glory is not in never falling, but in rising every time we fall.', author: 'Confucius' },
  { text: 'The more I want to get something done, the less I call it work.', author: 'Richard Bach' },
  { text: 'One day or day one. You decide.', author: 'Unknown' },
  { text: 'Push yourself, because no one else is going to do it for you.', author: 'Unknown' },
  { text: 'Little by little, a little becomes a lot.', author: 'Tanzanian Proverb' },
  { text: 'Start where you are. Use what you have. Do what you can.', author: 'Arthur Ashe' },
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
    const key = d.toISOString().slice(0, 10);
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
    const key = d.toISOString().slice(0, 10);
    if (!(completions[key] || {})[habitId]) break;
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

// ── Summary stats (used by home page) ───────────────────────────
function getStats() {
  const t = today();
  const habits = store.get('habits', []);
  const completions = store.get('habit_completions', {});
  const tasks = store.get('tasks', []);
  const focusSessions = store.get('focus_sessions', []);

  return {
    habitStreak: getHabitStreak(habits, completions),
    tasksToday: tasks.filter(tk => tk.done && tk.doneDate === t).length,
    focusToday: focusSessions
      .filter(s => s.date === t)
      .reduce((acc, s) => acc + s.minutes, 0),
  };
}

// ── Focus timer sound (Web Audio API) ───────────────────────────
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
  } catch (_) { /* Audio not supported */ }
}

// ── Init ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', setActiveNav);
