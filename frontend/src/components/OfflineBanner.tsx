import { useState, useEffect } from 'react';

export default function OfflineBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setShow(!!token && token.startsWith('local_'));
  }, []);

  if (!show) return null;

  return (
    <div style={{
      background: '#fbbf24',
      color: '#1e293b',
      textAlign: 'center',
      padding: '8px 16px',
      fontSize: '13px',
      fontWeight: 500,
      borderBottom: '1px solid #f59e0b',
      position: 'sticky',
      top: 0,
      zIndex: 9999,
    }}>
      ⚡ Demo mode — backend not connected. Login &amp; basic navigation work. Some features (jobs, messages, search) need the server running.
    </div>
  );
}
