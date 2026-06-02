import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../components/UI';

const ConfirmModalComponent = ({ message, onConfirm, onCancel }) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onCancel, 200); // Wait for transition
  };

  const handleConfirm = () => {
    setIsOpen(false);
    setTimeout(onConfirm, 200);
  };

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/60 dark:bg-black/70 backdrop-blur-md transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`bg-white dark:bg-slate-900 dark:border dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transition-all duration-200 transform ${isOpen ? 'scale-100' : 'scale-95'}`}>
        <div className="p-6 text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-black text-gray-800 dark:text-slate-100 mb-2">تأكيد الإجراء</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 font-bold mb-6 whitespace-pre-wrap">{message}</p>
          <div className="flex justify-center gap-3">
            <Button variant="ghost" onClick={handleClose} className="font-bold flex-1">إلغاء</Button>
            <Button variant="danger" onClick={handleConfirm} className="font-bold flex-1 shadow-none">نعم، متأكد</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const confirmDialog = (message) => {
  return new Promise((resolve) => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    const root = createRoot(div);

    const cleanup = () => {
      root.unmount();
      div.remove();
    };

    root.render(
      <ConfirmModalComponent
        message={message}
        onConfirm={() => {
          cleanup();
          resolve(true);
        }}
        onCancel={() => {
          cleanup();
          resolve(false);
        }}
      />
    );
  });
};
