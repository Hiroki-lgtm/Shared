import React, { useState } from 'react';
import { LogIn, Clock, ShieldCheck, Sparkles, UserPlus } from 'lucide-react';
import { loadUsers, saveUsers, saveCurrentUser } from '../utils/storage';

export default function LoginScreen({ onLoginSuccess }) {
  const users = loadUsers();
  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id || 'u1');
  const [password, setPassword] = useState('123');
  const [displayNameInput, setDisplayNameInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (isRegisterMode) {
      if (!displayNameInput.trim()) {
        setErrorMsg('お名前（表示名）を入力してください');
        return;
      }
      if (!usernameInput.trim()) {
        setErrorMsg('ユーザー名（ID）を入力してください');
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
        name: displayNameInput.trim(),
        password: newPasswordInput || '123'
      };
      const updatedUsers = [...users, newUser];
      saveUsers(updatedUsers);
      saveCurrentUser(newUser);
      onLoginSuccess(newUser);
    } else {
      const user = users.find(u => u.id === selectedUserId);
      if (!user) {
        setErrorMsg('ユーザーが見つかりません');
        return;
      }
      if (user.password && user.password !== password) {
        setErrorMsg('パスワードが間違っています (初期PW: 123)');
        return;
      }
      saveCurrentUser(user);
      onLoginSuccess(user);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'var(--bg-primary)'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '32px' }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div className="logo-icon" style={{ width: '56px', height: '56px', borderRadius: '16px' }}>
            <Clock size={32} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h1 className="logo-title" style={{ fontSize: '1.8rem', textAlign: 'center' }}>ChronoCraft</h1>
            <p className="logo-subtitle" style={{ textAlign: 'center', marginTop: '4px' }}>24時間 デイリータイムスケジューラー</p>
          </div>
        </div>

        {errorMsg && (
          <div style={{
            background: 'rgba(239,68,68,0.15)',
            border: '1px solid rgba(239,68,68,0.3)',
            padding: '10px 14px',
            borderRadius: '8px',
            color: 'var(--status-red)',
            fontSize: '0.85rem',
            marginBottom: '16px'
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!isRegisterMode ? (
            <>
              <div className="form-group">
                <label className="form-label">アカウントを選択</label>
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
                  placeholder="パスワードを入力"
                  required
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  ※ デフォルト初期パスワード: <code>123</code>
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">お名前（表示名）</label>
                <input
                  type="text"
                  className="form-input"
                  value={displayNameInput}
                  onChange={(e) => setDisplayNameInput(e.target.value)}
                  placeholder="例: 山田 太郎"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">ユーザー名（半角英数ID）</label>
                <input
                  type="text"
                  className="form-input"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="例: taro_yamada"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">パスワード設定</label>
                <input
                  type="password"
                  className="form-input"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="パスワードを入力 (未入力の場合は 123)"
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  ※ ログイン後、いつでも設定画面から変更可能です
                </span>
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px', padding: '12px' }}>
            <LogIn size={18} />
            <span>{isRegisterMode ? 'アカウントを作成してログイン' : 'ログイン'}</span>
          </button>

          <div style={{ textAlign: 'center', marginTop: '4px' }}>
            <button
              type="button"
              style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '0.85rem' }}
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setErrorMsg('');
              }}
            >
              {isRegisterMode ? '← 既存アカウント選択へ戻る' : '+ 新しいアカウントを作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
