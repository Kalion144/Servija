import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
}

export const Toast = ({ message, type = 'success', onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`toast-message ${type}`}
      style={{ background: type === 'error' ? '#dc2626' : '#f97316' }}
    >
      <i
        className={`fas ${type === 'error' ? 'fa-exclamation-triangle' : 'fa-check-circle'}`}
      ></i>{' '}
      {message}
    </div>
  );
};
