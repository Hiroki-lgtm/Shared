import React from 'react';
import { User, CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react';
import { loadUsers, getUserSchedule, getTomorrowDateStr, getStatusColorByHour } from '../utils/storage';

export default function PartnerStatusCard({ currentUser, currentHour, tomorrowDateStr }) {
  const users = loadUsers();
  const partner = users.find(u => u.id !== currentUser.id) || users[0];

  if (!partner || partner.id === currentUser.id) {
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {isCreated ? (
              <span style={{ color: '#34d399', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={16} />
                <span>作成済み ({partnerTomorrowTasks.length}件)</span>
              </span>
            ) : (
              <span style={{ color: '#f87171', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <XCircle size={16} />
                <span>未作成</span>
              </span>
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
          <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '2px', color: 'var(--text-muted)' }}>
            <li style={{ color: currentHour >= 19 && currentHour < 22 ? '#34d399' : 'inherit', fontWeight: currentHour >= 19 && currentHour < 22 ? 'bold' : 'normal' }}>
              19:00〜22:00 : <span style={{ color: '#34d399' }}>緑色</span> (標準作成時間)
            </li>
            <li style={{ color: currentHour >= 22 && currentHour < 24 ? '#fbbf24' : 'inherit', fontWeight: currentHour >= 22 && currentHour < 24 ? 'bold' : 'normal' }}>
              22:00〜24:00 : <span style={{ color: '#fbbf24' }}>黄色</span> (締め切り間近)
            </li>
            <li style={{ color: currentHour < 19 ? '#f87171' : 'inherit', fontWeight: currentHour < 19 ? 'bold' : 'normal' }}>
              それ以外 (〜19:00) : <span style={{ color: '#f87171' }}>赤色</span> (作成可能時間外)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
