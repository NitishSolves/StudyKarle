import React, { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(null);
let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback(function (id) {
    setToasts(function (prev) {
      return prev.filter(function (t) {
        return t.id !== id;
      });
    });
  }, []);

  const showToast = useCallback(
    function (message, type) {
      const id = ++idCounter;
      setToasts(function (prev) {
        return prev.concat([{ id: id, message: message, type: type || 'info' }]);
      });
      setTimeout(function () {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  const value = {
    success: function (msg) {
      showToast(msg, 'success');
    },
    error: function (msg) {
      showToast(msg, 'error');
    },
    info: function (msg) {
      showToast(msg, 'info');
    }
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm">
        {toasts.map(function (toast) {
          const styles =
            toast.type === 'success'
              ? 'bg-status-success text-white'
              : toast.type === 'error'
              ? 'bg-error text-white'
              : 'bg-text-primary text-white';
          return (
            <div
              key={toast.id}
              role="status"
              className={'px-4 py-3 rounded-lg shadow-lg text-body-sm font-medium animate-in fade-in ' + styles}
            >
              {toast.message}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}
