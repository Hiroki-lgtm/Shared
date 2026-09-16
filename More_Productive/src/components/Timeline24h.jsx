import React from 'react';
import { Plus, Edit2, Trash2, Zap, Clock } from 'lucide-react';
import { CATEGORIES, timeToMinutes } from '../utils/storage';

export default function Timeline24h({ tasks, onAddSlot, onEditTask, onDeleteTask }) {
  // Sort tasks by startTime
  const sortedTasks = [...tasks].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  // Calculate total planned minutes
  const totalMinutes = sortedTasks.reduce((acc, t) => {
    const start = timeToMinutes(t.startTime);
    let end = timeToMinutes(t.endTime);
    if (end < start) end += 24 * 60; // Handle overnight
    return acc + Math.max(0, end - start);
  }, 0);

  const totalHoursFormatted = (totalMinutes / 60).toFixed(1);
  const percentage = Math.min(100, Math.round((totalMinutes / (24 * 60)) * 100));

  // Map tasks to hour slots (0 to 23)
  const hourMap = Array.from({ length: 24 }).map(() => []);
  sortedTasks.forEach(task => {
    const startHour = Math.floor(timeToMinutes(task.startTime) / 60) % 24;
    hourMap[startHour].push(task);
  });

  return (
    <div className="timeline-container">
      {/* Coverage Progress Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '8px' }}>
        <div className="timeline-meta">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontWeight: 700 }}>
            <Clock size={18} className="text-indigo-400" />
            <span>24時間 スケジュール充填状況</span>
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
            <span style={{ color: 'var(--accent-primary)', fontSize: '1.1rem' }}>{totalHoursFormatted}</span> / 24.0 時間 ({percentage}%)
          </div>
        </div>

        <div className="timeline-progress-bg">
          <div
            className="timeline-progress-segment"
            style={{
              width: `${percentage}%`,
              background: 'linear-gradient(90deg, #6366f1 0%, #10b981 100%)'
            }}
          />
        </div>
      </div>

      {/* 24 Hours Slots List */}
      <div className="hours-list">
        {Array.from({ length: 24 }).map((_, hour) => {
          const hourTasks = hourMap[hour];
          const timeLabel = `${String(hour).padStart(2, '0')}:00`;

          return (
            <div key={hour} className="hour-row">
              <div className="hour-label">{timeLabel}</div>

              <div className="hour-content-slot">
                {hourTasks.length > 0 ? (
                  hourTasks.map(task => {
                    const cat = CATEGORIES.find(c => c.id === task.category) || CATEGORIES[6];
                    return (
                      <div key={task.id} className={`task-item ${cat.color}`}>
                        <div className="task-time">
                          {task.startTime} - {task.endTime}
                        </div>

                        <div className="task-title-group">
                          {task.isPomodoro && (
                            <Zap size={14} className="text-emerald-400" title="ポモドーロタスク" />
                          )}
                          <span className="task-title">{task.title}</span>
                          <span className="task-badge">{cat.name}</span>
                        </div>

                        <div className="task-actions">
                          <button
                            className="icon-btn"
                            onClick={() => onEditTask(task)}
                            title="予定の編集"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="icon-btn danger"
                            onClick={() => onDeleteTask(task.id)}
                            title="予定の削除"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ height: '100%', minHeight: '34px' }} />
                )}

                {/* Quick Add Button on hover */}
                <button
                  className="slot-add-btn"
                  onClick={() => onAddSlot(timeLabel)}
                >
                  <Plus size={12} style={{ display: 'inline', marginRight: '2px' }} />
                  追加
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
