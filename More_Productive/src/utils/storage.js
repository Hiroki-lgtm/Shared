// Storage & Helper utilities for ChronoCraft Daily Planner

const STORAGE_KEYS = {
  USERS: 'chrono_users_v1',
  CURRENT_USER: 'chrono_current_user_v1',
  SCHEDULES: 'chrono_schedules_v1',
  THEME: 'chrono_theme_v1'
};

export function loadTheme() {
  return localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
}

export function saveTheme(theme) {
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
}

// Default Users (Customizable display names)
export const DEFAULT_USERS = [
  { id: 'u1', username: 'alice', name: 'Alice', password: '123' },
  { id: 'u2', username: 'bob', name: 'Bob', password: '123' }
];

// Helper to sanitize legacy default names from older storage
function sanitizeUser(u) {
  if (!u) return u;
  let name = u.name;
  if (name === 'あなた (Alice)') name = 'Alice';
  else if (name === 'パートナー (Bob)') name = 'Bob';
  else if (name && /^あなた\s*\(/.test(name)) name = name.replace(/^あなた\s*\((.*)\)$/, '$1');
  else if (name && /^パートナー\s*\(/.test(name)) name = name.replace(/^パートナー\s*\((.*)\)$/, '$1');
  return { ...u, name: name || u.username };
}

// Helper: Format date string YYYY-MM-DD
export function formatDateStr(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Get tomorrow date string
export function getTomorrowDateStr(baseDateStr = formatDateStr()) {
  const parts = baseDateStr.split('-').map(Number);
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  date.setDate(date.getDate() + 1);
  return formatDateStr(date);
}

// Get yesterday date string
export function getYesterdayDateStr(baseDateStr = formatDateStr()) {
  const parts = baseDateStr.split('-').map(Number);
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  date.setDate(date.getDate() - 1);
  return formatDateStr(date);
}

// Category Definition
export const CATEGORIES = [
  { id: 'work', name: '仕事・作業', color: 'cat-work', hex: '#3b82f6' },
  { id: 'study', name: '勉強・自己研鑽', color: 'cat-study', hex: '#8b5cf6' },
  { id: 'break', name: '休憩・自由時間', color: 'cat-break', hex: '#10b981' },
  { id: 'exercise', name: '運動・健康', color: 'cat-exercise', hex: '#f59e0b' },
  { id: 'sleep', name: '睡眠', color: 'cat-sleep', hex: '#6366f1' },
  { id: 'life', name: '食事・生活', color: 'cat-life', hex: '#ec4899' },
  { id: 'other', name: 'その他', color: 'cat-other', hex: '#64748b' },
];

// Initial Demo Seed Data
function getSeedSchedules() {
  const today = formatDateStr();
  const tomorrow = getTomorrowDateStr();

  return {
    // Alice's Schedules
    [`u1_${today}`]: [
      { id: '101', startTime: '07:00', endTime: '08:00', title: '朝の準備・朝食', category: 'life' },
      { id: '102', startTime: '08:30', endTime: '09:00', title: '通勤・ニュースチェック', category: 'life' },
      { id: '103', startTime: '09:00', endTime: '12:00', title: 'プロジェクト集中作業', category: 'work' },
      { id: '104', startTime: '12:00', endTime: '13:00', title: 'ランチ＆散歩', category: 'break' },
      { id: '105', startTime: '13:00', endTime: '13:25', title: 'ポモドーロ#1 午後タスク', category: 'work' },
      { id: '106', startTime: '13:25', endTime: '13:30', title: 'ポモドーロ休憩', category: 'break' },
      { id: '107', startTime: '14:00', endTime: '16:00', title: 'チームミーティング & レビュー', category: 'work' },
      { id: '108', startTime: '18:00', endTime: '19:00', title: 'ジムトレーニング', category: 'exercise' },
      { id: '109', startTime: '23:00', endTime: '07:00', title: '睡眠', category: 'sleep' }
    ],
    // Bob's Schedules (Tomorrow schedule created to demonstrate partner status)
    [`u2_${tomorrow}`]: [
      { id: '201', startTime: '08:00', endTime: '09:00', title: '朝読書', category: 'study' },
      { id: '202', startTime: '09:00', endTime: '12:30', title: '開発タスク実装', category: 'work' },
      { id: '203', startTime: '14:00', endTime: '17:00', title: 'デザインシステム作成', category: 'work' },
      { id: '204', startTime: '22:30', endTime: '06:30', title: '睡眠', category: 'sleep' }
    ]
  };
}

// Storage functions
export function loadUsers() {
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }
  try {
    const rawUsers = JSON.parse(data);
    const sanitized = rawUsers.map(sanitizeUser);
    // If any user was updated by sanitization, persist back
    if (JSON.stringify(rawUsers) !== JSON.stringify(sanitized)) {
      saveUsers(sanitized);
    }
    return sanitized;
  } catch (err) {
    return DEFAULT_USERS;
  }
}

export function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

export function loadCurrentUser() {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (!data) return DEFAULT_USERS[0];
  try {
    const raw = JSON.parse(data);
    const sanitized = sanitizeUser(raw);
    if (JSON.stringify(raw) !== JSON.stringify(sanitized)) {
      saveCurrentUser(sanitized);
    }
    return sanitized;
  } catch (err) {
    return DEFAULT_USERS[0];
  }
}

export function saveCurrentUser(user) {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
}

// Update single user (e.g. name, password) in storage
export function updateUser(updatedUser) {
  const users = loadUsers();
  const nextUsers = users.map(u => u.id === updatedUser.id ? { ...u, ...updatedUser } : u);
  saveUsers(nextUsers);
  const current = loadCurrentUser();
  if (current && current.id === updatedUser.id) {
    saveCurrentUser({ ...current, ...updatedUser });
  }
  return updatedUser;
}

export function loadSchedules() {
  const data = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
  if (!data) {
    const seed = getSeedSchedules();
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(seed));
    return seed;
  }
  return JSON.parse(data);
}

export function saveSchedules(schedules) {
  localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));
}

// Get user schedule for specific date
export function getUserSchedule(userId, dateStr) {
  const schedules = loadSchedules();
  const key = `${userId}_${dateStr}`;
  return schedules[key] || [];
}

// Save user schedule for specific date
export function saveUserSchedule(userId, dateStr, taskList) {
  const schedules = loadSchedules();
  const key = `${userId}_${dateStr}`;
  schedules[key] = taskList;
  saveSchedules(schedules);
}

// Helper: Check status color based on current hour
// 19:00 - 22:00 -> GREEN ('green')
// 22:00 - 24:00 -> YELLOW ('yellow')
// Otherwise -> RED ('red')
export function getStatusColorByHour(currentHour) {
  if (currentHour >= 19 && currentHour < 22) {
    return { color: 'green', text: '標準入力時間帯 (19:00〜22:00)', label: '緑色 (正常)' };
  } else if (currentHour >= 22 && currentHour < 24) {
    return { color: 'yellow', text: '締め切り間近 (22:00〜24:00)', label: '黄色 (注意)' };
  } else {
    return { color: 'red', text: '入力時間外 (19時前 / 深夜過剰)', label: '赤色 (制限/締切外)' };
  }
}

// Check if tomorrow schedule input is unlocked (>= 19:00)
export function isTomorrowUnlocked(currentHour) {
  return currentHour >= 19;
}

// Minutes to HH:MM helper
export function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToTime(totalMinutes) {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
