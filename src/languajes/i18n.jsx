import React, { createContext, useContext, useMemo, useState } from 'react';
import es from './es.json';
import en from './en.json';
import pt from './pt.json';

const resources = { es, en, pt };

const I18nContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('lang') || 'es';
    } catch (e) {
      return 'es';
    }
  });

  const setLanguage = (l) => {
    setLang(l);
    try { localStorage.setItem('lang', l); } catch(e){}
  };

  const t = (key, vars) => {
    const parts = key.split('.');
    let cur = resources[lang];
    for (const p of parts) {
      if (!cur) break;
      cur = cur[p];
    }
    let str = cur || key;
    if (vars && typeof str === 'string') {
      Object.keys(vars).forEach(k => {
        str = str.replace(new RegExp(`\\{\\s*${k}\\s*\\}`, 'g'), vars[k]);
      });
    }
    return str;
  };

  const value = useMemo(() => ({ lang, setLanguage, t }), [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useTranslation must be used within LanguageProvider');
  return ctx;
}

export default LanguageProvider;
