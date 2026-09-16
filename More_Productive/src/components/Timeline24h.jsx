import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Zap, Clock, Calendar } from 'lucide-react';
import { CATEGORIES, timeToMinutes } from '../utils/storage';

const HOUR_HEIGHT = 60; // 60px per hour = 1px per minute
const TOTAL_HEIGHT = 24 * HOUR_HEIGHT; // 1440px for 24 hours

/**
 * Calculates positioning (top, height, left, width) for each task
 * while handling multi-hour spans, short tasks (with minHeight),
 * overnight tasks, and overlapping tasks side-by-side.
 */
function computeTaskLayout(tasks, hourHeight = HOUR_HEIGHT) {
  if (!tasks || tasks.length === 0) return [];

  // Parse tasks and calculate vertical bounds
  const parsed = tasks.map(task => {
    const startM = timeToMinutes(task.startTime);
    let endM = timeToMinutes(task.endTime);
    let isOvernight = false;

    // Handle overnight schedules (e.g., 23:00 - 07:00)
    if (endM <= startM) {
      isOvernight = true;
      endM = 24 * 60; // Clamp to 24:00 boundary for today's visual canvas
    }

    const durationMinutes = endM - startM;
    const top = (startM / 60) * hourHeight;
    const rawHeight = (durationMinutes / 60) * hourHeight;
    // Provide a comfortable minimum height (26px) so short tasks (e.g. 5m breaks) remain readable
    const height = Math.max(26, rawHeight);

    return {
      task,
      startM,
      endM,
      isOvernight,
      durationMinutes,
      top,
      height,
      visualEndM: startM + (height / hourHeight) * 60
    };
  });

  // Sort tasks by start time ascending, then by duration descending
  parsed.sort((a, b) => a.startM - b.startM || b.durationMinutes - a.durationMinutes);

  // Group into clusters of tasks that visually overlap
  const clusters = [];
  let currentCluster = [];
  let clusterEndM = 0;

  parsed.forEach(item => {
    if (currentCluster.length === 0) {
      currentCluster.push(item);
      clusterEndM = Math.max(item.endM, item.visualEndM);
    } else if (item.startM < clusterEndM) {
      // Overlaps with the current cluster
      currentCluster.push(item);
      clusterEndM = Math.max(clusterEndM, item.endM, item.visualEndM);
    } else {
      // Start a new cluster
      clusters.push(currentCluster);
      currentCluster = [item];
      clusterEndM = Math.max(item.endM, item.visualEndM);
    }
  });
  if (currentCluster.length > 0) {
    clusters.push(currentCluster);
  }

  // Assign columns for side-by-side rendering in overlapping clusters
  const result = [];
  clusters.forEach(cluster => {
    const columns = []; // tracks the end time for each column

    cluster.forEach(item => {
      let colIndex = -1;
      for (let i = 0; i < columns.length; i++) {
        if (columns[i] <= item.startM) {
          colIndex = i;
          columns[i] = Math.max(item.endM, item.visualEndM);
          break;
        }
      }
      if (colIndex === -1) {
        colIndex = columns.length;
        columns.push(Math.max(item.endM, item.visualEndM));
      }
      item.col = colIndex;
    });

    const totalCols = columns.length;
    cluster.forEach(item => {
      const widthPercent = 100 / totalCols;
      const leftPercent = item.col * widthPercent;

      result.push({
        ...item,
        totalCols,
        left: `calc(${leftPercent}% + 2px)`,
        width: `calc(${widthPercent}% - 4px)`
      });
    });
  });

  return result;
}

export default function Timeline24h({ tasks, onAddSlot, onEditTask, onDeleteTask, isToday = true }) {
  // Real-time minute ticker for the live indicator line
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nowTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // Sort tasks by startTime for statistics
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

  // Compute exact coordinates for each task card
  const layoutItems = computeTaskLayout(tasks, HOUR_HEIGHT);

  return (
    <div className="timeline-container">
      {/* Coverage Progress Bar Header */}
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

      {/* 24h Continuous Timeline Board */}
      <div className="timeline-board-wrapper">
        {/* Left Time Axis Labels (00:00 to 24:00) */}
        <div className="timeline-time-axis" style={{ height: `${TOTAL_HEIGHT}px` }}>
          {Array.from({ length: 25 }).map((_, hour) => {
            const timeLabel = hour === 24 ? '24:00' : `${String(hour).padStart(2, '0')}:00`;
            return (
              <div
                key={hour}
                className="time-axis-marker"
                style={{ top: `${hour * HOUR_HEIGHT}px` }}
              >
                <span className="time-axis-text">{timeLabel}</span>
              </div>
            );
          })}
        </div>

        {/* Right Timeline Canvas (Background Grid + Overlay Task Blocks) */}
        <div className="timeline-canvas" style={{ height: `${TOTAL_HEIGHT}px` }}>
          {/* Background Hour Grid Slots */}
          {Array.from({ length: 24 }).map((_, hour) => {
            const timeLabel = `${String(hour).padStart(2, '0')}:00`;
            return (
              <div
                key={hour}
                className="timeline-hour-slot"
                style={{
                  top: `${hour * HOUR_HEIGHT}px`,
                  height: `${HOUR_HEIGHT}px`
                }}
                onClick={() => onAddSlot(timeLabel)}
              >
                {/* 30-minute faint guideline */}
                <div className="timeline-half-hour-line" />

                {/* Quick Add Button appearing on hover */}
                <button
                  type="button"
                  className="slot-quick-add-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddSlot(timeLabel);
                  }}
                  title={`${timeLabel} に予定を追加`}
                >
                  <Plus size={13} style={{ display: 'inline', marginRight: '4px' }} />
                  <span>{timeLabel} に追加</span>
                </button>
              </div>
            );
          })}

          {/* Bottom Boundary Line for 24:00 */}
          <div className="timeline-end-line" style={{ top: `${TOTAL_HEIGHT}px` }} />

          {/* Live Current Time Indicator Line (Only on today's view) */}
          {isToday && nowMinutes >= 0 && nowMinutes <= 1440 && (
            <div
              className="timeline-now-line"
              style={{ top: `${(nowMinutes / 60) * HOUR_HEIGHT}px` }}
            >
              <div className="timeline-now-dot" />
              <div className="timeline-now-badge">
                <span>現在 {nowTimeStr}</span>
              </div>
            </div>
          )}

          {/* Overlay Task Cards Layer */}
          <div className="timeline-tasks-layer">
            {layoutItems.map(({ task, top, height, left, width, durationMinutes, isOvernight }) => {
              const cat = CATEGORIES.find(c => c.id === task.category) || CATEGORIES[6];
              const isTall = height >= 70; // 70px+ has spacious room for title + badges + time
              const isMedium = height >= 45 && height < 70;
              const isCompact = height < 45;

              // Format duration string (e.g. 3.0時間 or 25分)
              const hours = Math.floor(durationMinutes / 60);
              const mins = durationMinutes % 60;
              let durationLabel = '';
              if (hours > 0 && mins > 0) {
                durationLabel = `${hours}時間${mins}分`;
              } else if (hours > 0) {
                durationLabel = `${hours}時間`;
              } else {
                durationLabel = `${mins}分`;
              }

              return (
                <div
                  key={task.id}
                  className={`timeline-task-block ${cat.color} ${isCompact ? 'compact' : ''} ${isTall ? 'tall' : ''}`}
                  style={{
                    top: `${top}px`,
                    height: `${height}px`,
                    left,
                    width
                  }}
                  onClick={() => onEditTask(task)}
                >
                  {isTall ? (
                    /* Spacious layout for multi-hour tasks (e.g. 09:00 - 12:00, 3 hours) */
                    <div className="task-block-content tall-content">
                      <div className="task-block-header">
                        <div className="task-time-badge">
                          {task.startTime} - {task.endTime}
                          {isOvernight && <span className="overnight-tag">🌙 翌日</span>}
                        </div>
                        <span className="task-duration-badge">{durationLabel}</span>
                        <span className="task-category-badge">{cat.name}</span>

                        <div className="task-block-actions" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className="task-action-btn"
                            onClick={() => onEditTask(task)}
                            title="予定の編集"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            className="task-action-btn danger"
                            onClick={() => onDeleteTask(task.id)}
                            title="予定の削除"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <div className="task-block-body">
                        {task.isPomodoro && (
                          <Zap size={15} className="text-emerald-400" title="ポモドーロタスク" />
                        )}
                        <h4 className="task-block-title">{task.title}</h4>
                      </div>

                      {height >= 110 && (
                        <div className="task-block-footer">
                          <span className="task-block-span-hint">
                            ⏱ {task.startTime} 〜 {task.endTime} 枠全体（{durationLabel}）を確保
                          </span>
                        </div>
                      )}
                    </div>
                  ) : isMedium ? (
                    /* Medium layout for 45m - 1h tasks */
                    <div className="task-block-content medium-content">
                      <div className="task-block-row">
                        <div className="task-time-badge">
                          {task.startTime} - {task.endTime}
                        </div>
                        <span className="task-duration-badge">{durationLabel}</span>
                        {task.isPomodoro && (
                          <Zap size={14} className="text-emerald-400" title="ポモドーロタスク" />
                        )}
                        <span className="task-block-title">{task.title}</span>
                        <span className="task-category-badge">{cat.name}</span>

                        <div className="task-block-actions" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className="task-action-btn"
                            onClick={() => onEditTask(task)}
                            title="予定の編集"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            type="button"
                            className="task-action-btn danger"
                            onClick={() => onDeleteTask(task.id)}
                            title="予定の削除"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Compact single-row layout for short 5m - 30m tasks */
                    <div className="task-block-content compact-content">
                      <div className="task-block-row compact-row">
                        <span className="task-time-badge compact-time">
                          {task.startTime}-{task.endTime}
                        </span>
                        {task.isPomodoro && (
                          <Zap size={12} className="text-emerald-400 flex-shrink-0" />
                        )}
                        <span className="task-block-title compact-title">{task.title}</span>
                        <span className="task-duration-badge compact-duration">{durationLabel}</span>

                        <div className="task-block-actions compact-actions" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className="task-action-btn"
                            onClick={() => onEditTask(task)}
                            title="予定の編集"
                          >
                            <Edit2 size={11} />
                          </button>
                          <button
                            type="button"
                            className="task-action-btn danger"
                            onClick={() => onDeleteTask(task.id)}
                            title="予定の削除"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
