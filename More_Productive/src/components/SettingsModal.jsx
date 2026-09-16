import React, { useState } from 'react';
import { Settings, User, Users, Sun, Moon, LogOut, CheckCircle2, XCircle, Clock, Plus, X, ShieldCheck } from 'lucide-react';
import { loadUsers, saveUsers, getUserSchedule, getStatusColorByHour, getTomorrowDateStr, formatDateStr } from '../utils/storage';

export default function SettingsModal({
  isOpen,
  onClose,
  currentUser,
  theme,
  onToggleTheme,
  onLogout,
  currentHour,
  tomorrowDateStr
}) {
  const [activeTab, setActiveTab] = useState('friends'); // 'friends', 'appearance', 'account'
  const [friendUsernameInput, setFriendUsernameInput] = useState('');
  const [friendsList, setFriendsList] = useState(() => {
    // Get other users as default friends
    const users = loadUsers();
    return users.filter(u => u.id !== currentUser.id);
  });
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleAddFriend = (e) => {
    e.preventDefault();
    if (!friendUsernameInput.trim()) return;
    const allUsers = loadUsers();
    const found = allUsers.find(u => u.username.toLowerCase() === friendUsernameInput.trim().toLowerCase());
    if (!found) {
      alert(`ユーザー名 @${friendUsernameInput} は見つかりませんでした。`);
      return;
    }
    if (found.id === currentUser.id) {
      alert('自分自身をフレンドに追加することはできません。');
      return;
    }
    if (friendsList.some(f => f.id === found.id)) {
      alert('すでにフレンドに追加されています。');
      return;
    }
    setFriendsList(prev => [...prev, found]);
    setFriendUsernameInput('');
    setSuccessMsg(`@${found.username} をフレンドに追加しました！`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const statusInfo = getStatusColorByHour(currentHour);

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div className="modal-title">
            <Settings className="text-indigo-500" size={22} />
            <span>設定</span>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)', padding: '0 16px', background: 'var(--bg-input)' }}>
          <button
            className={`tab-btn ${activeTab === 'friends' ? 'active' : ''}`}
            onClick={() => setActiveTab('friends')}
            style={{ borderRadius: '0', borderBottom: activeTab === 'friends' ? '2px solid var(--accent-primary)' : 'none' }}
          >
            <Users size={16} />
            <span>フレンド</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'appearance' ? 'active' : ''}`}
            onClick={() => setActiveTab('appearance')}
            style={{ borderRadius: '0', borderBottom: activeTab === 'appearance' ? '2px solid var(--accent-primary)' : 'none' }}
          >
            {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
            <span>表示・テーマ</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}
            style={{ borderRadius: '0', borderBottom: activeTab === 'account' ? '2px solid var(--accent-primary)' : 'none' }}
          >
            <User size={16} />
            <span>アカウント</span>
          </button>
        </div>

        <div className="modal-body">
          {/* Tab 1: Friends */}
          {activeTab === 'friends' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                フレンドの翌日の予定作成状況を確認できます。プライバシー保護のため、<strong>具体的な予定の内容は相互に非公開</strong>となっています。
              </div>

              {/* Add Friend Form */}
              <form onSubmit={handleAddFriend} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="ユーザー名を入力 (例: bob)"
                  value={friendUsernameInput}
                  onChange={(e) => setFriendUsernameInput(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn btn-secondary btn-sm">
                  <Plus size={16} />
                  <span>追加</span>
                </button>
              </form>

              {successMsg && (
                <div style={{ fontSize: '0.8rem', color: 'var(--status-green)', padding: '6px 12px', background: 'rgba(16,185,129,0.1)', borderRadius: '6px' }}>
                  {successMsg}
                </div>
              )}

              {/* Friends List Status */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>登録済みフレンド一覧 ({friendsList.length})</span>
                  <div className={`status-badge ${statusInfo.color}`}>
                    <span className="status-dot"></span>
                    <span>現在ステータス: {statusInfo.label}</span>
                  </div>
                </div>

                {friendsList.length > 0 ? (
                  friendsList.map(friend => {
                    const friendTomorrowTasks = getUserSchedule(friend.id, tomorrowDateStr);
                    const isCreated = friendTomorrowTasks && friendTomorrowTasks.length > 0;

                    return (
                      <div
                        key={friend.id}
                        style={{
                          background: 'var(--bg-input)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: '12px',
                          padding: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div className="avatar-circle">
                            {friend.name.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{friend.name}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>@{friend.username}</div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          {isCreated ? (
                            <span style={{ color: 'var(--status-green)', fontWeight: 600, fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle2 size={16} />
                              <span>翌日予定 作成済み</span>
                            </span>
                          ) : (
                            <span style={{ color: 'var(--status-red)', fontWeight: 600, fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <XCircle size={16} />
                              <span>未作成</span>
                            </span>
                          )}
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px', justifyContent: 'flex-end' }}>
                            <ShieldCheck size={12} />
                            <span>予定の詳細は非公開</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0', fontSize: '0.85rem' }}>
                    フレンドがまだ登録されていません
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Appearance (Theme) */}
          {activeTab === 'appearance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">カラーテーマ選択</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => theme !== 'light' && onToggleTheme()}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      border: theme === 'light' ? '2px solid var(--accent-primary)' : '1px solid var(--glass-border)',
                      background: '#ffffff',
                      color: '#0f172a',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }}
                  >
                    <Sun size={24} className="text-amber-500" />
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 700 }}>ライトモード</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>白基調の明るいテーマ</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => theme !== 'dark' && onToggleTheme()}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      border: theme === 'dark' ? '2px solid var(--accent-primary)' : '1px solid var(--glass-border)',
                      background: '#0f172a',
                      color: '#f8fafc',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }}
                  >
                    <Moon size={24} className="text-indigo-400" />
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 700 }}>ダークモード</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>黒基調の洗練されたテーマ</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Account */}
          {activeTab === 'account' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '12px', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div className="avatar-circle" style={{ width: '48px', height: '48px', fontSize: '1.2rem' }}>
                  {currentUser.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{currentUser.name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ユーザー名: @{currentUser.username}</div>
                </div>
              </div>

              <div style={{ marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn btn-danger"
                  style={{ width: '100%' }}
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                >
                  <LogOut size={18} />
                  <span>ログアウト</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
