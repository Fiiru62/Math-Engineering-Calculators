import React from 'react';
import { useTranslation } from '../languajes/i18n';

export default function Modal({ open, onClose, title, children, fullScreen = false }) {
  const { t } = useTranslation();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className={`${fullScreen ? 'absolute inset-0 p-6' : 'relative max-w-2xl w-full p-6'} bg-card rounded-lg shadow-2xl overflow-auto`}> 
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button onClick={onClose} className="px-2 py-1 rounded hover:bg-muted">{t('modal.close')}</button>
        </div>
        <div className="space-y-4 text-sm text-muted-foreground">
          {children}
        </div>
      </div>
    </div>
  );
}
