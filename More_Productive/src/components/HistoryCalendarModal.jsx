import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Copy, X } from 'lucide-react';
import { getUserSchedule, formatDateStr, CATEGORIES } from '../utils/storage';

export default function HistoryCalendarModal({ isOpen, onClose, currentUserId, onCopyFromHistory }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(formatDateStr());

  if (!isOpen) return null;

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Calendar matrix calculation
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const monthLabel = `${year}年 ${month + 1}月`;

  // Selected date tasks
  const dayTasks = getUserSchedule(currentUserId, selectedDateStr);

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '820px' }}>
        <div className="modal-header">
          <div className="modal-title">
            <CalendarIcon className="text-indigo-400" size={24} />
            <span>過去の記録カレンダー</span>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Left Column: Calendar Grid */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <button className="icon-btn" onClick={prevMonth}><ChevronLeft size={20} /></button>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>{monthLabel}</div>
              <button className="icon-btn" onClick={nextMonth}><ChevronRight size={20} /></button>
            </div>

            <div className="calendar-grid">
              {['日', '月', '火', '水', '木', '金', '土'].map(d => (
                <div key={d} className="calendar-header-day">{d}</div>
              ))}

              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="calendar-cell empty"></div>
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const tasks = getUserSchedule(currentUserId, dStr);
                const hasData = tasks && tasks.length > 0;
                const isSelected = dStr === selectedDateStr;

                return (
                  <div
                    key={dStr}
                    className={`calendar-cell ${hasData ? 'has-data' : ''} ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedDateStr(dStr)}
                  >
                    {dayNum}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Day Schedule Details */}
          <div style={{ background: 'rgba(15,23,42,0.6)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                📅 {selectedDateStr} の記録
              </div>
              <span style={{ fontSize: '0.8rem', color: dayTasks.length > 0 ? '#34d399' : 'var(--text-muted)' }}>
                {dayTasks.length} 件の予定
              </span>
            </div>

            {dayTasks.length > 0 ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                  {dayTasks.map(task => {
                    const cat = CATEGORIES.find(c => c.id === task.category) || CATEGORIES[6];
                    return (
                      <div
                        key={task.id}
                        style={{
                          background: 'rgba(30,41,59,0.9)',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          borderLeft: `4px solid ${cat.hex}`,
                          fontSize: '0.82rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600 }}>{task.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {task.startTime} 〜 {task.endTime}
                          </div>
                        </div>
                        <span className="task-badge">{cat.name}</span>
                      </div>
                    );
                  })}
                </div>

                <button
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: 'auto' }}
                  onClick={() => {
                    onCopyFromHistory(selectedDateStr);
                    onClose();
                  }}
                >
                  <Copy size={14} />
                  <span>この日の予定を今日にコピー</span>
                </button>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                この日の記録はありません
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
