import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Timeline24h from './components/Timeline24h';
import LoginScreen from './components/LoginScreen';
import SettingsModal from './components/SettingsModal';
import ScheduleModal from './components/ScheduleModal';
import PomodoroQuickAddModal from './components/PomodoroQuickAddModal';
import CopyScheduleModal from './components/CopyScheduleModal';
import HistoryCalendarModal from './components/HistoryCalendarModal';

import {
  loadCurrentUser,
  saveCurrentUser,
  getUserSchedule,
  getEffectiveScheduleForDate,
  saveUserSchedule,
  getYesterdayDateStr,
  formatDateStr,
  getTomorrowDateStr,
  isTomorrowUnlocked,
  loadTheme,
  saveTheme
} from './utils/storage';

import {
  Plus,
  Zap,
  Copy,
  Calendar,
  Lock,
  Sun,
  Moon,
  Sparkles,
  Settings
} from 'lucide-react';

export default function App() {
  // Theme state ('dark' | 'light')
  const [theme, setTheme] = useState(() => loadTheme());

  // Apply theme data attribute to root <html> element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    saveTheme(theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Auth state
  const [currentUser, setCurrentUser] = useState(() => {
    const user = loadCurrentUser();
    return user || null;
  });

  const handleLogout = () => {
    localStorage.removeItem('chrono_current_user_v1');
    setCurrentUser(null);
  };

  const handleUpdateUser = (updatedUser) => {
    setCurrentUser(updatedUser);
  };

  // Real-time clock ticker
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const realHour = now.getHours();
  const realTimeStr = `${String(realHour).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // Time simulation (optional)
  const [isSimulatingTime, setIsSimulatingTime] = useState(false);
  const [simulatedHour, setSimulatedHour] = useState(20);
  const currentHour = isSimulatingTime ? simulatedHour : realHour;

  // Dates
  const todayDateStr = formatDateStr(now);
  const tomorrowDateStr = getTomorrowDateStr(todayDateStr);

  // Active Tab: 'today' or 'tomorrow'
  const [activeTab, setActiveTab] = useState('today');
  const activeDateStr = activeTab === 'today' ? todayDateStr : tomorrowDateStr;

  // Schedule tasks state for active date
  const [tasks, setTasks] = useState([]);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [defaultSlotTime, setDefaultSlotTime] = useState('09:00');

  const [isPomodoroModalOpen, setIsPomodoroModalOpen] = useState(false);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // 19:00 unlock status for tomorrow
  const canEditTomorrow = isTomorrowUnlocked(currentHour);

  // Load effective tasks (including overnight tasks from yesterday)
  const refreshTasks = () => {
    if (!currentUser) return;
    const loaded = getEffectiveScheduleForDate(currentUser.id, activeDateStr);
    setTasks(loaded);
  };

  useEffect(() => {
    refreshTasks();
  }, [currentUser?.id, activeDateStr]);

  // Multi-tab real-time storage event listener
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key && e.key.startsWith('chrono_')) {
        refreshTasks();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentUser?.id, activeDateStr]);

  // If user is not logged in, render LoginScreen
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  // Save tasks helper
  const updateAndSaveTasks = (newTasks) => {
    setTasks(newTasks);
    saveUserSchedule(currentUser.id, activeDateStr, newTasks);
  };

  // Add / Edit Task
  const handleSaveTask = (taskData) => {
    if (editingTask) {
      if (editingTask.isCrossover) {
        // Remove original from yesterday
        const yesterdayStr = getYesterdayDateStr(activeDateStr);
        const yesterdayTasks = getUserSchedule(currentUser.id, yesterdayStr);
        const newYesterdayTasks = yesterdayTasks.filter(t => t.id !== editingTask.originalId);
        saveUserSchedule(currentUser.id, yesterdayStr, newYesterdayTasks);
        
        // Add updated task to today
        const cleanedTask = { ...taskData };
        delete cleanedTask.isCrossover;
        delete cleanedTask.originalId;
        cleanedTask.id = editingTask.originalId; // keep original ID
        if (cleanedTask.title.includes('(前日')) {
          cleanedTask.title = cleanedTask.title.replace(/\s*\(前日.*\)$/, '');
        }
        const updated = [...tasks.filter(t => t.id !== editingTask.id), cleanedTask];
        updateAndSaveTasks(updated);
      } else {
        const updated = tasks.map(t => t.id === taskData.id ? taskData : t);
        updateAndSaveTasks(updated);
      }
    } else {
      const updated = [...tasks, taskData];
      updateAndSaveTasks(updated);
    }
  };

  // Move Task (Drag & Drop)
  const handleMoveTask = (task, newStartM, newEndM) => {
    const updatedTask = {
      ...task,
      startTime: `${String(Math.floor(newStartM / 60) % 24).padStart(2, '0')}:${String(newStartM % 60).padStart(2, '0')}`,
      endTime: `${String(Math.floor(newEndM / 60) % 24).padStart(2, '0')}:${String(newEndM % 60).padStart(2, '0')}`
    };

    if (task.isCrossover) {
      // Remove original from yesterday
      const yesterdayStr = getYesterdayDateStr(activeDateStr);
      const yesterdayTasks = getUserSchedule(currentUser.id, yesterdayStr);
      const newYesterdayTasks = yesterdayTasks.filter(t => t.id !== task.originalId);
      saveUserSchedule(currentUser.id, yesterdayStr, newYesterdayTasks);

      // Add to today
      delete updatedTask.isCrossover;
      delete updatedTask.originalId;
      updatedTask.id = task.originalId;
      if (updatedTask.title.includes('(前日')) {
        updatedTask.title = updatedTask.title.replace(/\s*\(前日.*\)$/, '');
      }

      const updated = [...tasks.filter(t => t.id !== task.id), updatedTask];
      updateAndSaveTasks(updated);
    } else {
      const updated = tasks.map(t => t.id === task.id ? updatedTask : t);
      updateAndSaveTasks(updated);
    }
  };

  // Delete Task
  const handleDeleteTask = (taskId) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (!taskToDelete) return;

    if (taskToDelete.isCrossover) {
      // Delete from yesterday
      const yesterdayStr = getYesterdayDateStr(activeDateStr);
      const yesterdayTasks = getUserSchedule(currentUser.id, yesterdayStr);
      const newYesterdayTasks = yesterdayTasks.filter(t => t.id !== taskToDelete.originalId);
      saveUserSchedule(currentUser.id, yesterdayStr, newYesterdayTasks);
      
      const updated = tasks.filter(t => t.id !== taskId);
      setTasks(updated); // Update local state directly
    } else {
      const updated = tasks.filter(t => t.id !== taskId);
      updateAndSaveTasks(updated);
    }
  };

  // Quick Slot Add
  const handleAddSlot = (timeLabel) => {
    if (activeTab === 'tomorrow' && !canEditTomorrow) return;
    setEditingTask(null);
    setDefaultSlotTime(timeLabel);
    setIsScheduleModalOpen(true);
  };

  // Add Pomodoro Batch
  const handleAddPomodoroTasks = (newPomoTasks) => {
    const updated = [...tasks, ...newPomoTasks];
    updateAndSaveTasks(updated);
  };

  // Apply Copy Schedule
  const handleApplyCopy = (copiedTasks) => {
    updateAndSaveTasks(copiedTasks);
  };

  // Copy schedule from history calendar
  const handleCopyFromHistory = (sourceDateStr) => {
    const sourceTasks = getUserSchedule(currentUser.id, sourceDateStr);
    if (sourceTasks.length === 0) {
      alert(`${sourceDateStr} には予定がありません。`);
      return;
    }
    const cloned = sourceTasks.map((t, i) => ({
      ...t,
      id: `hist_copy_${Date.now()}_${i}`
    }));
    updateAndSaveTasks(cloned);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <Header
        currentUser={currentUser}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        realTimeStr={realTimeStr}
        simulatedHour={simulatedHour}
        isSimulatingTime={isSimulatingTime}
      />

      {/* Simplified Home Layout */}
      <main style={{ maxWidth: '960px', margin: '0 auto' }}>
        {/* Tab Switcher: Today vs Tomorrow */}
        <div className="tab-switcher" style={{ marginBottom: '20px' }}>
          <button
            className={`tab-btn ${activeTab === 'today' ? 'active' : ''}`}
            onClick={() => setActiveTab('today')}
          >
            <Sun size={18} />
            <span>本日の予定 ({todayDateStr})</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'tomorrow' ? 'active' : ''} ${!canEditTomorrow ? 'disabled' : ''}`}
            onClick={() => setActiveTab('tomorrow')}
          >
            {canEditTomorrow ? <Moon size={18} /> : <Lock size={18} className="text-red-400" />}
            <span>翌日の予定 ({tomorrowDateStr})</span>
            {!canEditTomorrow && (
              <span style={{ fontSize: '0.75rem', background: 'rgba(239,68,68,0.2)', color: 'var(--status-red)', padding: '2px 6px', borderRadius: '4px' }}>
                19:00〜解放
              </span>
            )}
          </button>
        </div>

        {/* Tomorrow Lock Banner if active & before 19:00 */}
        {activeTab === 'tomorrow' && !canEditTomorrow && (
          <div className="lock-banner">
            <div className="lock-banner-icon">
              <Lock size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--status-red)' }}>
                翌日の予定作成は 19:00 以降に解放されます
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                19時以降に翌日の24時間を設計しましょう。
              </div>
            </div>
          </div>
        )}

        {/* Toolbar Actions */}
        <div className="toolbar-panel">
          <div className="toolbar-left">
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditingTask(null);
                setDefaultSlotTime('09:00');
                setIsScheduleModalOpen(true);
              }}
              disabled={activeTab === 'tomorrow' && !canEditTomorrow}
            >
              <Plus size={18} />
              <span>通常予定の追加</span>
            </button>

            <button
              className="btn btn-pomo"
              onClick={() => setIsPomodoroModalOpen(true)}
              disabled={activeTab === 'tomorrow' && !canEditTomorrow}
              title="25分活動+5分休憩をワンタップ挿入"
            >
              <Zap size={18} />
              <span>⚡ ポモドーロ (25分+5分) 追加</span>
            </button>
          </div>

          <div className="toolbar-right">
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setIsCopyModalOpen(true)}
              disabled={activeTab === 'tomorrow' && !canEditTomorrow}
            >
              <Copy size={16} />
              <span>予定のコピー・複製</span>
            </button>
          </div>
        </div>

        {/* 24h Timeline Display */}
        <Timeline24h
          tasks={tasks}
          onAddSlot={handleAddSlot}
          onSaveTask={handleSaveTask}
          onMoveTask={handleMoveTask}
          onEditTask={(task) => {
            setEditingTask(task);
            setIsScheduleModalOpen(true);
          }}
          onDeleteTask={handleDeleteTask}
          isToday={activeTab === 'today'}
        />
      </main>

      {/* Settings Modal (Friends Status, Theme, Account) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentUser={currentUser}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onLogout={handleLogout}
        onUpdateUser={handleUpdateUser}
        currentHour={currentHour}
        tomorrowDateStr={tomorrowDateStr}
      />

      {/* Other Modals */}
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSave={handleSaveTask}
        editingTask={editingTask}
        defaultStartTime={defaultSlotTime}
      />

      <PomodoroQuickAddModal
        isOpen={isPomodoroModalOpen}
        onClose={() => setIsPomodoroModalOpen(false)}
        onAddTasks={handleAddPomodoroTasks}
        initialStartTime="10:00"
      />

      <CopyScheduleModal
        isOpen={isCopyModalOpen}
        onClose={() => setIsCopyModalOpen(false)}
        currentUserId={currentUser.id}
        targetDateStr={activeDateStr}
        onApplyCopy={handleApplyCopy}
      />

      <HistoryCalendarModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        currentUserId={currentUser.id}
        onCopyFromHistory={handleCopyFromHistory}
      />
    </div>
  );
}
