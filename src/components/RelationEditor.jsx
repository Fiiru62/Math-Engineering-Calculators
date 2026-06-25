import React, { useState } from 'react';
import { useTranslation } from '../languajes/i18n';

export default function RelationEditor({ onAnalyze }) {
  const [text, setText] = useState('');
  const { t } = useTranslation();

  const handleAnalyze = (e) => {
    e.preventDefault();
    onAnalyze(text);
  };

  return (
    <form onSubmit={handleAnalyze} className="mb-6">
      <label className="block text-sm font-medium mb-2">
        {t('relations.editor.label')}
      </label>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          placeholder={t('relations.editor.inputPlaceholder')}
          value={text}
          onChange={e=>setText(e.target.value)}
          className="flex-1 min-w-0 px-4 py-3 rounded-md bg-input border"
          aria-label="Relación"
        />
        <button className="w-full sm:w-auto px-4 py-3 rounded-md bg-primary text-primary-foreground hover:scale-105 hover:shadow-lg transition transform" type="submit">{t('relations.editor.analyzeButton')}</button>
      </div>
    </form>
  );
}
