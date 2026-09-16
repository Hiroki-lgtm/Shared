import React, { useState } from 'react';
import { LogIn, UserCheck, ShieldAlert, Sparkles } from 'lucide-react';
import { loadUsers, saveUsers, saveCurrentUser } from '../utils/storage';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const users = loadUsers();
  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id || 'u1');
  const [password, setPassword] = useState('123');
  const [usernameInput, setUsernameInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (isRegisterMode) {
      if (!usernameInput.trim()) {
        setErrorMsg('ユーザー名を入力してください');
        return;
      }
      const existing = users.find(u => u.username.toLowerCase() === usernameInput.toLowerCase());
      if (existing) {
        setErrorMsg('そのユーザー名は既に存在します');
        return;
      }
      const newUser = {
        id: `u_${Date.now()}`,
        username: usernameInput.trim(),
        name: usernameInput.trim(),
        password: newPasswordInput || '123'
      };
      const updatedUsers = [...users, newUser];
      saveUsers(updatedUsers);
      saveCurrentUser(newUser);
      onLoginSuccess(newUser);
      onClose();
    } else {
      const user = users.find(u => u.id === selectedUserId);
      if (!user) {
        setErrorMsg('ユーザーが見つかりません');
        return;
      }
      if (user.password && user.password !== password) {
        setErrorMsg('パスワードが間違っています (初期テストPW: 123)');
        return;
      }
      saveCurrentUser(user);
      onLoginSuccess(user);
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <div className="modal-title">
            <Sparkles className="text-indigo-400" size={24} />
            <span>ChronoCraft ログイン</span>
          </div>
        </div>

        <form onSubmit={handleLogin}>
          <div className="modal-body">
            {errorMsg && (
              <div style={{
                background: 'rgba(239,68,68,0.15)',
                border: '1px solid rgba(239,68,68,0.3)',
                padding: '10px 14px',
                borderRadius: '8px',
                color: '#f87171',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <ShieldAlert size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {!isRegisterMode ? (
              <>
                <div className="form-group">
                  <label className="form-label">ログインアカウントを選択</label>
                  <select
                    className="form-select"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} (@{u.username})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">パスワード</label>
                  <input
                    type="password"
                    className="form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="パスワードを入力 (デフォルト: 123)"
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    ※ テスト用初期パスワード: <code>123</code>
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">新規ユーザー名</label>
                  <input
                    type="text"
                    className="form-input"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="例: charlie"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">パスワード設定</label>
                  <input
                    type="password"
                    className="form-input"
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="任意のパスワード"
                  />
                </div>
              </>
            )}

            <div style={{ textAlign: 'center', marginTop: '8px' }}>
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '0.85rem' }}
                onClick={() => {
                  setIsRegisterMode(!isRegisterMode);
                  setErrorMsg('');
                }}
              >
                {isRegisterMode ? '← 既存アカウント選択へ戻る' : '+ 新しいユーザーアカウントを追加登録'}
              </button>
            </div>
          </div>

          <div className="modal-footer">
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              <LogIn size={18} />
              <span>{isRegisterMode ? '登録してログイン' : 'ログイン'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
