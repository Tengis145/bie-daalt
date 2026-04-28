import { useEffect, useState } from 'react';

function ToastItem({ toast, onRemove }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const hideTimer = setTimeout(() => setVisible(false), 2600);
    const removeTimer = setTimeout(() => onRemove(toast.id), 3000);
    return () => { clearTimeout(hideTimer); clearTimeout(removeTimer); };
  }, []);

  const icons = { success: '✓', error: '✕', info: 'ℹ' };

  return (
    <div className={`toast toast-${toast.type} ${visible ? 'toast-show' : ''}`}>
      <span className="toast-icon">{icons[toast.type] || icons.info}</span>
      <span className="toast-msg">{toast.message}</span>
    </div>
  );
}

export default function Toast({ toasts, onRemove }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}
