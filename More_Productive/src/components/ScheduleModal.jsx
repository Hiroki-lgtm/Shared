import React, { useState, useEffect } from 'react';
import { PlusCircle, Save, X } from 'lucide-react';
import { CATEGORIES } from '../utils/storage';

export default function ScheduleModal({ isOpen, onClose, onSave, editingTask, defaultStartTime = '09:00' }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('work');
  const [startTime, setStartTime] = useState(defaultStartTime);
  const [endTime, setEndTime] = useState('10:00');

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setCategory(editingTask.category || 'work');
      setStartTime(editingTask.startTime);
      setEndTime(editingTask.endTime);
    } else {
      setTitle('');
      setCategory('work');
      setStartTime(defaultStartTime);
      // Auto set 1 hour later
      const [h, m] = defaultStartTime.split(':').map(Number);
      const nextH = (h + 1) % 24;
      setEndTime(`${String(nextH).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }, [editingTask, defaultStartTime, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: editingTask ? editingTask.id : `task_${Date.now()}`,
      title: title.trim(),
      category,
      startTime,
      endTime
    });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <div className="modal-title">
            <PlusCircle className="text-indigo-400" size={24} />
            <span>{editingTask ? '予定の編集' : '新しい予定の追加'}</span>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">予定の名称</label>
              <input
                type="text"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例: 設計レビュー、チームミーティング、読書"
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">カテゴリ選択</label>
              <div className="category-picker">
                {CATEGORIES.map(cat => (
                  <div
                    key={cat.id}
                    className={`cat-pill ${cat.id} ${category === cat.id ? 'selected' : ''}`}
                    onClick={() => setCategory(cat.id)}
                  >
                    {cat.name}
                  </div>
                ))}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">開始時間</label>
                <input
                  type="time"
                  className="form-input"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">終了時間</label>
                <input
                  type="time"
                  className="form-input"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              キャンセル
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} />
              <span>{editingTask ? '変更を保存' : '予定を追加'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
