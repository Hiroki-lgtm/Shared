import React, { useState } from 'react';
import {
  Settings,
  User,
  Users,
  Sun,
  Moon,
  LogOut,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  X,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  Edit2,
  RefreshCw
} from 'lucide-react';
import {
  loadUsers,
  saveUsers,
  getUserSchedule,
  getStatusColorByHour,
  getTomorrowDateStr,
  formatDateStr,
  updateUser,
  saveCurrentUser
} from '../utils/storage';

export default function SettingsModal({
  isOpen,
  onClose,
  currentUser,
  theme,
  onToggleTheme,
  onLogout,
  currentHour,
  tomorrowDateStr,
  onUpdateUser,
  onSwitchUser
}) {
  const [activeTab, setActiveTab] = useState('friends'); // 'friends', 'appearance', 'account'
  const [friendUsernameInput, setFriendUsernameInput] = useState('');
  const [friendSuccessMsg, setFriendSuccessMsg] = useState('');

  const allUsers = loadUsers();
  
  const [friendIds, setFriendIds] = useState(() => {
    if (currentUser.friends) return currentUser.friends;
    return allUsers.filter(u => u.id !== currentUser.id).map(u => u.id);
  });

  const friendsList = friendIds.map(id => allUsers.find(u => u.id === id)).filter(Boolean);

  const saveFriends = (newIds) => {
    setFriendIds(newIds);
    const updated = { ...currentUser, friends: newIds };
    updateUser(updated);
    if (onUpdateUser) onUpdateUser(updated);
  };

  // Account form state
  const [editName, setEditName] = useState(currentUser.name || '');
  const [nameMsg, setNameMsg] = useState('');

  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

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
    if (friendIds.includes(found.id)) {
      alert('すでにフレンドに追加されています。');
      return;
    }
    saveFriends([...friendIds, found.id]);
    setFriendUsernameInput('');
    setFriendSuccessMsg(`@${found.username} をフレンドに追加しました！`);
    setTimeout(() => setFriendSuccessMsg(''), 3000);
  };

  const handleRemoveFriend = (friendId) => {
    saveFriends(friendIds.filter(id => id !== friendId));
  };

  const handleSaveName = (e) => {
    e.preventDefault();
    const trimmed = editName.trim();
    if (!trimmed) return;
    const updated = { ...currentUser, name: trimmed };
    updateUser(updated);
    if (onUpdateUser) onUpdateUser(updated);
    setNameMsg('名前を変更しました！');
    setTimeout(() => setNameMsg(''), 3000);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordMsg('');
    const actualPassword = currentUser.password || '123';

    if (!currentPasswordInput) {
      setPasswordError('現在のパスワードを入力してください');
      return;
    }
    if (currentPasswordInput !== actualPassword) {
      setPasswordError('現在のパスワードが間違っています');
      return;
    }
    if (!newPasswordInput) {
      setPasswordError('新しいパスワードを入力してください');
      return;
    }
    if (newPasswordInput.length < 3) {
      setPasswordError('新しいパスワードは3文字以上で入力してください');
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordError('新しいパスワード（確認用）が一致しません');
      return;
    }

    const updated = { ...currentUser, password: newPasswordInput };
    updateUser(updated);
    if (onUpdateUser) onUpdateUser(updated);
    setPasswordMsg('パスワードを変更しました！');
    setCurrentPasswordInput('');
    setNewPasswordInput('');
    setConfirmPasswordInput('');
    setTimeout(() => setPasswordMsg(''), 3000);
  };

  const otherUsers = loadUsers().filter(u => u.id !== currentUser.id);

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
              <div style={{ background: 'var(--bg-input)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>自分の予定詳細をフレンドに公開する</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      オンにすると、あなたをフレンド登録している相手があなたのスケジュール内容（タスク名や時間）を閲覧できるようになります。
                    </div>
                  </div>
                  <label className="toggle-switch" style={{ cursor: 'pointer', position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                    <input 
                      type="checkbox" 
                      checked={!!currentUser.shareSchedule} 
                      onChange={(e) => {
                        const updated = { ...currentUser, shareSchedule: e.target.checked };
                        updateUser(updated);
                        if (onUpdateUser) onUpdateUser(updated);
                      }}
                      style={{ opacity: 0, width: 0, height: 0 }} 
                    />
                    <span style={{
                      position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                      backgroundColor: currentUser.shareSchedule ? 'var(--accent-primary)' : 'var(--text-muted)',
                      transition: '.4s', borderRadius: '24px'
                    }}>
                      <span style={{
                        position: 'absolute', content: '""', height: '18px', width: '18px',
                        left: currentUser.shareSchedule ? '22px' : '3px', bottom: '3px',
                        backgroundColor: 'white', transition: '.4s', borderRadius: '50%'
                      }}></span>
                    </span>
                  </label>
                </div>
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

              {friendSuccessMsg && (
                <div style={{ fontSize: '0.8rem', color: 'var(--status-green)', padding: '6px 12px', background: 'rgba(16,185,129,0.1)', borderRadius: '6px' }}>
                  {friendSuccessMsg}
                </div>
              )}

              {/* Friends List Status */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>登録済みフレンド一覧 ({friendsList.length})</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    現在時刻: {String(currentHour).padStart(2, '0')}:00
                  </span>
                </div>

                {friendsList.length > 0 ? (
                  friendsList.map(friend => {
                    const friendTomorrowTasks = getUserSchedule(friend.id, tomorrowDateStr);
                    const isCreated = friendTomorrowTasks && friendTomorrowTasks.length > 0;
                    const friendStatus = getStatusColorByHour(currentHour, isCreated);

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
                            {friend.name ? friend.name.charAt(0) : '?'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{friend.name}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>@{friend.username}</div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                          <div className={`status-badge ${friendStatus.color}`}>
                            <span className="status-dot"></span>
                            <span>{friendStatus.label}</span>
                          </div>

                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <ShieldCheck size={12} />
                            <span>予定詳細は非公開</span>
                          </div>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '2px 8px', fontSize: '0.75rem', marginTop: '4px', background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--status-red)' }}
                            onClick={() => handleRemoveFriend(friend.id)}
                          >
                            削除
                          </button>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Account Card */}
              <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '12px', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div className="avatar-circle" style={{ width: '48px', height: '48px', fontSize: '1.2rem' }}>
                  {currentUser.name.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{currentUser.name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ユーザー名: @{currentUser.username}</div>
                </div>
              </div>



              {/* Display Name Edit Form */}
              <form onSubmit={handleSaveName} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label className="form-label">表示名の変更</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="form-input"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn btn-secondary btn-sm">
                    <Edit2 size={15} />
                    <span>保存</span>
                  </button>
                </div>
                {nameMsg && (
                  <span style={{ fontSize: '0.78rem', color: 'var(--status-green)' }}>{nameMsg}</span>
                )}
              </form>

              {/* Password Change Form */}
              <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <KeyRound size={16} />
                  <span>パスワードの変更</span>
                </div>

                {passwordMsg && (
                  <div style={{ fontSize: '0.82rem', color: 'var(--status-green)', padding: '8px 12px', background: 'rgba(16,185,129,0.12)', borderRadius: '8px', marginBottom: '10px' }}>
                    {passwordMsg}
                  </div>
                )}

                {passwordError && (
                  <div style={{ fontSize: '0.82rem', color: 'var(--status-red)', padding: '8px 12px', background: 'rgba(239,68,68,0.12)', borderRadius: '8px', marginBottom: '10px' }}>
                    {passwordError}
                  </div>
                )}

                <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>現在のパスワード</label>
                    <input
                      type="password"
                      className="form-input"
                      value={currentPasswordInput}
                      onChange={(e) => setCurrentPasswordInput(e.target.value)}
                      placeholder="現在のパスワード"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>新しいパスワード</label>
                      <input
                        type="password"
                        className="form-input"
                        value={newPasswordInput}
                        onChange={(e) => setNewPasswordInput(e.target.value)}
                        placeholder="新しいパスワード"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>新しいパスワード (確認)</label>
                      <input
                        type="password"
                        className="form-input"
                        value={confirmPasswordInput}
                        onChange={(e) => setConfirmPasswordInput(e.target.value)}
                        placeholder="もう一度入力"
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-start', marginTop: '4px' }}>
                    <KeyRound size={15} />
                    <span>パスワード更新</span>
                  </button>
                </form>
              </div>

              {/* Logout Button */}
              <div style={{ marginTop: '4px', paddingTop: '14px', borderTop: '1px solid var(--glass-border)' }}>
                <button
                  type="button"
                  className="btn btn-danger"
                  style={{ width: '100%', padding: '12px' }}
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
