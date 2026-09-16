import React, { useState } from 'react';
import { Copy, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';
import { getUserSchedule, getYesterdayDateStr, formatDateStr } from '../utils/storage';

export default function CopyScheduleModal({
  isOpen,
  onClose,
  currentUserId,
  targetDateStr,
  onApplyCopy
}) {
  const yesterdayStr = getYesterdayDateStr(targetDateStr);
  const [selectedSourceDate, setSelectedSourceDate] = useState(yesterdayStr);
  const [mode, setMode] = useState('yesterday'); // 'yesterday' or 'custom'

  if (!isOpen) return null;

  const actualSourceDate = mode === 'yesterday' ? yesterdayStr : selectedSourceDate;
  const sourceTasks = getUserSchedule(currentUserId, actualSourceDate);

  const handleCopy = () => {
    if (sourceTasks.length === 0) {
      alert('選択した日付には予定が存在しません。');
      return;
    }
    // Duplicate tasks with new unique IDs
    const clonedTasks = sourceTasks.map((t, idx) => ({
      ...t,
      id: `copy_${Date.now()}_${idx}`
    }));

    onApplyCopy(clonedTasks);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <div className="modal-title">
            <Copy className="text-indigo-400" size={24} />
            <span>予定のコピー・複製</span>
          </div>
        </div>

        <div className="modal-body">
          <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            対象日（<strong>{targetDateStr}</strong>）へコピー元の日付の予定をまるごと複製します。
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.12)',
                background: mode === 'yesterday' ? 'rgba(99,102,241,0.15)' : 'rgba(15,23,42,0.4)',
                cursor: 'pointer'
              }}
            >
              <input
                type="radio"
                name="copyMode"
                checked={mode === 'yesterday'}
                onChange={() => setMode('yesterday')}
              />
              <div>
                <div style={{ fontWeight: 600 }}>前日（昨日: {yesterdayStr}）の予定をコピー</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>最もよく使われるパターンです</div>
              </div>
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.12)',
                background: mode === 'custom' ? 'rgba(99,102,241,0.15)' : 'rgba(15,23,42,0.4)',
                cursor: 'pointer'
              }}
            >
              <input
                type="radio"
                name="copyMode"
                checked={mode === 'custom'}
                onChange={() => setMode('custom')}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>日付を指定してコピー</div>
                {mode === 'custom' && (
                  <input
                    type="date"
                    className="form-input"
                    value={selectedSourceDate}
                    onChange={(e) => setSelectedSourceDate(e.target.value)}
                    style={{ marginTop: '6px' }}
                  />
                )}
              </div>
            </label>
          </div>

          {/* Copy Preview */}
          <div style={{ background: 'rgba(15,23,42,0.6)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                コピー内容プレビュー ({actualSourceDate}):
              </span>
              <span style={{ fontSize: '0.8rem', color: sourceTasks.length > 0 ? '#34d399' : '#f87171' }}>
                {sourceTasks.length > 0 ? `${sourceTasks.length} 件の予定` : '予定なし'}
              </span>
            </div>

            {sourceTasks.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
                {sourceTasks.map(t => (
                  <div key={t.id} style={{ fontSize: '0.8rem', padding: '6px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{t.startTime} - {t.endTime} : {t.title}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{t.category}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
                この日付には登録された予定がありません。別の日付を選択してください。
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            キャンセル
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={sourceTasks.length === 0}
            onClick={handleCopy}
            style={{ opacity: sourceTasks.length === 0 ? 0.5 : 1 }}
          >
            <Copy size={16} />
            <span>この予定をコピーする ({sourceTasks.length}件)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
