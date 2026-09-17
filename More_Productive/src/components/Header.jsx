import React from 'react';
import { Clock, Calendar, Settings, LogOut } from 'lucide-react';

export default function Header({
  currentUser,
  onOpenSettings,
  onOpenHistory,
  realTimeStr,
  simulatedHour,
  isSimulatingTime
}) {
  return (
    <header className="app-header">
      <div className="header-top">
        <div className="logo-area">
          <div className="logo-icon">
            <Clock size={24} />
          </div>
          <div>
            <h1 className="logo-title">ChronoCraft</h1>
            <div className="logo-subtitle">24時間 デイリータイムスケジューラー</div>
          </div>
        </div>

        <div className="user-nav-actions">
          {/* Past History Calendar Button */}
          <button className="btn btn-secondary btn-sm" onClick={onOpenHistory}>
            <Calendar size={16} />
            <span>過去の記録 📅</span>
          </button>



          {/* User Account Menu Badge */}
          <div
            onClick={onOpenSettings}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--bg-card-hover)',
              padding: '4px 12px',
              borderRadius: '20px',
              border: '1px solid var(--glass-border)',
              cursor: 'pointer'
            }}
            title="アカウント設定を開く"
          >
            <div className="avatar-circle" style={{ width: '28px', height: '28px', fontSize: '0.75rem' }}>
              {currentUser.name.charAt(0)}
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{currentUser.name}</span>
          </div>
        </div>
      </div>

      {/* Real-time bar */}
      <div className="sim-time-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Clock size={16} className="text-indigo-400" />
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            {isSimulatingTime ? (
              <span className="status-badge yellow">
                仮想テスト時刻: {String(simulatedHour).padStart(2, '0')}:00
              </span>
            ) : (
              <span className="status-badge green">
                現在時刻: {realTimeStr}
              </span>
            )}
          </span>
        </div>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          ※ 翌日予定の作成解放: 19:00〜
        </span>
      </div>
    </header>
  );
}
