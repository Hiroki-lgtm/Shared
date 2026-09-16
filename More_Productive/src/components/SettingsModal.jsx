import React, { useState, useEffect } from 'react';
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
  KeyRound,
  Save,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  loadUsers,
  saveUsers,
  getUserSchedule,
  getStatusColorByHour,
  getTomorrowDateStr,
  formatDateStr,
  updateUser
} from '../utils/storage';

export default function SettingsModal({
  isOpen,
  onClose,
  currentUser,
  theme,
  onToggleTheme,
  onLogout,
  onUpdateUser,
  currentHour,
  tomorrowDateStr
}) {
  const [activeTab, setActiveTab] = useState('friends'); // 'friends', 'appearance', 'account'
  const [friendUsernameInput, setFriendUsernameInput] = useState('');
  const [friendsList, setFriendsList] = useState([]);
  const [friendSuccessMsg, setFriendSuccessMsg] = useState('');

  // Name edit state
  const [nameInput, setNameInput] = useState('');
  const [nameMsg, setNameMsg] = useState('');
  const [nameError, setNameError] = useState('');

  // Password change state
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Refresh data whenever modal opens or currentUser changes
  useEffect(() => {
    if (isOpen && currentUser) {
      const users = loadUsers();
      setFriendsList(users.filter(u => u.id !== currentUser.id));
      setNameInput(currentUser.name || '');
      setNameMsg('');
      setNameError('');
      setCurrentPasswordInput('');
      setNewPasswordInput('');
      setConfirmPasswordInput('');
      setPasswordMsg('');
      setPasswordError('');
      setShowPasswords(false);
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  // Add friend handler
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
    setFriendSuccessMsg(`@${found.username} をフレンドに追加しました！`);
    setTimeout(() => setFriendSuccessMsg(''), 3000);
  };

  // Name change handler
  const handleSaveName = (e) => {
    e.preventDefault();
    setNameError('');
    setNameMsg('');

    const trimmed = nameInput.trim();
    if (!trimmed) {
      setNameError('名前（表示名）を入力してください');
      return;
    }

    const updated = { ...currentUser, name: trimmed };
    updateUser(updated);
    if (onUpdateUser) {
      onUpdateUser(updated);
    }
    setNameMsg('名前を変更しました！');
    setTimeout(() => setNameMsg(''), 3000);
  };

  // Password change handler
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
    if (newPasswordInput === actualPassword) {
      setPasswordError('新しいパスワードが現在のパスワードと同じです');
      return;
    }

    const updated = { ...currentUser, password: newPasswordInput };
    updateUser(updated);
    if (onUpdateUser) {
      onUpdateUser(updated);
    }

    setCurrentPasswordInput('');
    setNewPasswordInput('');
    setConfirmPasswordInput('');
    setPasswordMsg('パスワードを変更しました！次回から新しいパスワードでログインできます。');
    setTimeout(() => setPasswordMsg(''), 4000);
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

              {friendSuccessMsg && (
                <div style={{ fontSize: '0.8rem', color: 'var(--status-green)', padding: '6px 12px', background: 'rgba(16,185,129,0.1)', borderRadius: '6px' }}>
                  {friendSuccessMsg}
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
                            {friend.name ? friend.name.charAt(0) : '?'}
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

          {/* Tab 3: Account (Name Settings & Password Change) */}
          {activeTab === 'account' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Account Overview Header */}
              <div style={{
                background: 'var(--bg-input)',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid var(--glass-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <div className="avatar-circle" style={{ width: '52px', height: '52px', fontSize: '1.3rem' }}>
                  {currentUser.name ? currentUser.name.charAt(0) : '?'}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{currentUser.name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ユーザーID: @{currentUser.username}</div>
                </div>
              </div>

              {/* Section 1: Change Display Name */}
              <div style={{
                background: 'var(--bg-card)',
                padding: '18px',
                borderRadius: '12px',
                border: '1px solid var(--glass-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.95rem' }}>
                  <User size={18} className="text-indigo-400" />
                  <span>お名前（表示名）の設定</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  アプリ内やフレンド一覧に表示されるお名前を設定・変更できます。
                </div>

                {nameMsg && (
                  <div style={{
                    fontSize: '0.82rem',
                    color: 'var(--status-green)',
                    padding: '8px 12px',
                    background: 'rgba(16,185,129,0.12)',
                    border: '1px solid rgba(16,185,129,0.3)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <CheckCircle2 size={16} />
                    <span>{nameMsg}</span>
                  </div>
                )}

                {nameError && (
                  <div style={{
                    fontSize: '0.82rem',
                    color: 'var(--status-red)',
                    padding: '8px 12px',
                    background: 'rgba(239,68,68,0.12)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <AlertCircle size={16} />
                    <span>{nameError}</span>
                  </div>
                )}

                <form onSubmit={handleSaveName} style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    className="form-input"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="例: 山田 太郎"
                    style={{ flex: 1 }}
                    required
                  />
                  <button type="submit" className="btn btn-primary btn-sm" style={{ whiteSpace: 'nowrap' }}>
                    <Save size={16} />
                    <span>名前を保存</span>
                  </button>
                </form>
              </div>

              {/* Section 2: Change Password */}
              <div style={{
                background: 'var(--bg-card)',
                padding: '18px',
                borderRadius: '12px',
                border: '1px solid var(--glass-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.95rem' }}>
                    <KeyRound size={18} className="text-amber-400" />
                    <span>パスワードの変更</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {showPasswords ? <EyeOff size={14} /> : <Eye size={14} />}
                    <span>{showPasswords ? '伏字にする' : 'パスワードを表示'}</span>
                  </button>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  ログインに使用するパスワードを変更します。（初期パスワード: <code>123</code>）
                </div>

                {passwordMsg && (
                  <div style={{
                    fontSize: '0.82rem',
                    color: 'var(--status-green)',
                    padding: '8px 12px',
                    background: 'rgba(16,185,129,0.12)',
                    border: '1px solid rgba(16,185,129,0.3)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <CheckCircle2 size={16} />
                    <span>{passwordMsg}</span>
                  </div>
                )}

                {passwordError && (
                  <div style={{
                    fontSize: '0.82rem',
                    color: 'var(--status-red)',
                    padding: '8px 12px',
                    background: 'rgba(239,68,68,0.12)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <AlertCircle size={16} />
                    <span>{passwordError}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>現在のパスワード</label>
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      className="form-input"
                      value={currentPasswordInput}
                      onChange={(e) => setCurrentPasswordInput(e.target.value)}
                      placeholder="現在のパスワードを入力"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>新しいパスワード</label>
                      <input
                        type={showPasswords ? 'text' : 'password'}
                        className="form-input"
                        value={newPasswordInput}
                        onChange={(e) => setNewPasswordInput(e.target.value)}
                        placeholder="新しいパスワード (3文字以上)"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>新しいパスワード（確認用）</label>
                      <input
                        type={showPasswords ? 'text' : 'password'}
                        className="form-input"
                        value={confirmPasswordInput}
                        onChange={(e) => setConfirmPasswordInput(e.target.value)}
                        placeholder="もう一度入力"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-secondary btn-sm"
                    style={{ alignSelf: 'flex-start', marginTop: '4px' }}
                  >
                    <KeyRound size={16} />
                    <span>パスワードを更新する</span>
                  </button>
                </form>
              </div>

              {/* Section 3: Logout */}
              <div style={{ marginTop: '6px', paddingTop: '14px', borderTop: '1px solid var(--glass-border)' }}>
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
