import React, { useState } from 'react';
import { Zap, Play, Clock, Coffee, PlusCircle } from 'lucide-react';
import { minutesToTime, timeToMinutes } from '../utils/storage';

export default function PomodoroQuickAddModal({ isOpen, onClose, onAddTasks, initialStartTime = '09:00' }) {
  const [startTime, setStartTime] = useState(initialStartTime);
  const [activityTitle, setActivityTitle] = useState('集中のポモドーロ作業');
  const [setCount, setSetCount] = useState(2); // Default 2 sets (1 hour total)

  if (!isOpen) return null;

  const handleInsert = (e) => {
    e.preventDefault();
    let currentMin = timeToMinutes(startTime);
    const newTasks = [];

    for (let i = 1; i <= setCount; i++) {
      // 25 mins Activity
      const workStart = minutesToTime(currentMin);
      currentMin += 25;
      const workEnd = minutesToTime(currentMin);

      newTasks.push({
        id: `pomo_w_${Date.now()}_${i}`,
        startTime: workStart,
        endTime: workEnd,
        title: `${activityTitle} (セット ${i}/${setCount})`,
        category: 'work',
        isPomodoro: true
      });

      // 5 mins Break
      const breakStart = workEnd;
      currentMin += 5;
      const breakEnd = minutesToTime(currentMin);

      newTasks.push({
        id: `pomo_b_${Date.now()}_${i}`,
        startTime: breakStart,
        endTime: breakEnd,
        title: `☕ 5分リフレッシュ休憩 (${i}/${setCount})`,
        category: 'break',
        isPomodoro: true
      });
    }

    onAddTasks(newTasks);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <div className="modal-title">
            <Zap className="text-emerald-400" size={24} />
            <span>⚡ ポモドーロ (25分作業 + 5分休憩) クイック挿入</span>
          </div>
        </div>

        <form onSubmit={handleInsert}>
          <div className="modal-body">
            <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', padding: '12px 16px', borderRadius: '10px', fontSize: '0.85rem', color: '#6ee7b7' }}>
              ワンタップで <strong>25分の集中作業</strong> と <strong>5分の休憩</strong> のセットをタイムラインに連続して追加します。
            </div>

            <div className="form-group">
              <label className="form-label">活動内容（タスク名）</label>
              <input
                type="text"
                className="form-input"
                value={activityTitle}
                onChange={(e) => setActivityTitle(e.target.value)}
                placeholder="例: コーディング作業、読書、レポート作成"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">開始時刻</label>
                <input
                  type="time"
                  className="form-input"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">セット数 (1セット = 30分)</label>
                <select
                  className="form-select"
                  value={setCount}
                  onChange={(e) => setSetCount(Number(e.target.value))}
                >
                  <option value={1}>1セット (30分: 25分作業+5分休憩)</option>
                  <option value={2}>2セット (60分: 2回繰り返し)</option>
                  <option value={3}>3セット (90分: 3回繰り返し)</option>
                  <option value={4}>4セット (120分: 4回繰り返し)</option>
                </select>
              </div>
            </div>

            {/* Visual Preview */}
            <div style={{ background: 'rgba(15,23,42,0.6)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>挿入プレビュー:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem' }}>
                <div style={{ color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} />
                  <span>{startTime} 〜 {minutesToTime(timeToMinutes(startTime) + 25)}: {activityTitle} (25分)</span>
                </div>
                <div style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Coffee size={14} />
                  <span>{minutesToTime(timeToMinutes(startTime) + 25)} 〜 {minutesToTime(timeToMinutes(startTime) + 30)}: 5分リフレッシュ休憩</span>
                </div>
                {setCount > 1 && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    ...以降 {setCount} 回繰り返し
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              キャンセル
            </button>
            <button type="submit" className="btn btn-pomo">
              <PlusCircle size={18} />
              <span>予定に追加する ({setCount * 30}分間)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
