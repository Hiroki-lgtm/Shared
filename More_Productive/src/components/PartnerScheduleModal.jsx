import React from 'react';
import { X } from 'lucide-react';
import { CATEGORIES } from '../utils/storage';

export default function PartnerScheduleModal({ isOpen, onClose, partner, tasks }) {
  if (!isOpen || !partner) return null;

  // Sort tasks by start time
  const sortedTasks = [...tasks].sort((a, b) => {
    const aM = a.startTime.split(':').map(Number);
    const bM = b.startTime.split(':').map(Number);
    return (aM[0] * 60 + aM[1]) - (bM[0] * 60 + bM[1]);
  });

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="avatar-circle" style={{ width: '28px', height: '28px', fontSize: '0.85rem' }}>
              {partner.name.charAt(0)}
            </div>
            <span>{partner.name} のスケジュール</span>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto', padding: '16px' }}>
          {sortedTasks.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {sortedTasks.map(task => {
                const category = CATEGORIES.find(c => c.id === task.categoryId) || CATEGORIES[0];
                return (
                  <div key={task.id} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    background: 'var(--bg-input)', 
                    padding: '12px 16px', 
                    borderRadius: '8px', 
                    borderLeft: `4px solid ${category.color}`,
                    borderTop: '1px solid var(--glass-border)',
                    borderRight: '1px solid var(--glass-border)',
                    borderBottom: '1px solid var(--glass-border)'
                  }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', width: '90px', flexShrink: 0, fontWeight: 600 }}>
                      {task.startTime} - {task.endTime}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {task.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: category.color, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: category.color }}></div>
                        {category.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 20px' }}>
              予定は登録されていません
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
