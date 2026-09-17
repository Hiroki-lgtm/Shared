import React, { useState } from 'react';
import { User, CheckCircle2, AlertTriangle, XCircle, Clock, Eye, ShieldCheck } from 'lucide-react';
import { loadUsers, getUserSchedule, getTomorrowDateStr, getStatusColorByHour } from '../utils/storage';
import PartnerScheduleModal from './PartnerScheduleModal';

export default function PartnerStatusCard({ currentUser, currentHour, tomorrowDateStr }) {
  const users = loadUsers();
  const friendIds = currentUser.friends || users.filter(u => u.id !== currentUser.id).map(u => u.id);
  const partner = users.find(u => u.id === friendIds[0]);

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  if (!partner) {
    return (
      <div className="glass-panel">
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          フレンドアカウントを追加すると、翌日予定の作成ステータスがリアルタイム表示されます。
        </div>
      </div>
    );
  }

  // Get partner's schedule for tomorrow
  const partnerTomorrowTasks = getUserSchedule(partner.id, tomorrowDateStr);
  const isCreated = partnerTomorrowTasks && partnerTomorrowTasks.length > 0;

  // Calculate status color based on requirements:
  // 19-22: Green, 22-24: Yellow, Other: Red
  const statusInfo = getStatusColorByHour(currentHour);

  return (
    <div className="glass-panel">
      <div className="stat-header" style={{ marginBottom: '14px' }}>
        <div className="stat-title">
          <User className="text-indigo-400" size={18} />
          <span>{partner.name} の翌日予定ステータス</span>
        </div>
        {/* Status Badge according to the rule */}
        <div className={`status-badge ${statusInfo.color}`}>
          <span className="status-dot"></span>
          <span>{statusInfo.label}</span>
        </div>
      </div>

      <div className="partner-card-box">
        <div className="partner-user-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="avatar-circle">
              {partner.name.charAt(0)}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{partner.name}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>@{partner.username}</div>
            </div>
          </div>

          {/* Creation status indicator */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
            {isCreated ? (
              <span style={{ color: '#34d399', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={16} />
                <span>作成済み ({partnerTomorrowTasks.length}件)</span>
              </span>
            ) : (
              <span style={{ color: statusInfo.color === 'green' ? '#34d399' : statusInfo.color === 'yellow' ? '#fbbf24' : '#f87171', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <XCircle size={16} />
                <span>未作成</span>
              </span>
            )}
            
            {partner.shareSchedule ? (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ padding: '2px 8px', fontSize: '0.75rem', marginTop: '2px' }}
                onClick={() => setIsScheduleModalOpen(true)}
              >
                <Eye size={12} />
                <span>予定詳細を見る</span>
              </button>
            ) : (
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                <ShieldCheck size={12} />
                <span>予定詳細は非公開</span>
              </div>
            )}
          </div>
        </div>

        {/* Time condition status breakdown */}
        <div style={{
          fontSize: '0.78rem',
          background: 'rgba(15, 23, 42, 0.6)',
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.06)',
          marginTop: '4px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            <Clock size={14} />
            <span>ステータス時間判定ルール:</span>
          </div>
          <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '2px', color: 'var(--text-muted)', listStyle: 'none', marginLeft: '-18px' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '6px', color: currentHour >= 19 && currentHour < 22 ? '#34d399' : 'inherit', fontWeight: currentHour >= 19 && currentHour < 22 ? 'bold' : 'normal' }}>
              <span className="status-dot green" style={{ position: 'relative' }}></span>
              19:00〜22:00 : 標準作成時間
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '6px', color: currentHour >= 22 && currentHour < 24 ? '#fbbf24' : 'inherit', fontWeight: currentHour >= 22 && currentHour < 24 ? 'bold' : 'normal' }}>
              <span className="status-dot yellow" style={{ position: 'relative' }}></span>
              22:00〜24:00 : 締め切り間近
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '6px', color: currentHour < 19 ? '#f87171' : 'inherit', fontWeight: currentHour < 19 ? 'bold' : 'normal' }}>
              <span className="status-dot red" style={{ position: 'relative' }}></span>
              それ以外 (〜19:00) : 作成可能時間外
            </li>
          </ul>
        </div>
      </div>

      <PartnerScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        partner={partner}
        tasks={partnerTomorrowTasks || []}
      />
    </div>
  );
}
