import React, { useState } from 'react';
import { useTranslation } from '../languajes/i18n';

export default function Header({
  onToggleTheme,
  onToggleLanguage,
  onSetLanguage,
  onOpenSyntax,
  onOpenProperties,
  propertiesLabel,
  theme = 'dark',
  title,
  subtitle
}) {
  const { lang, setLanguage, t } = useTranslation();
  const [openLang, setOpenLang] = useState(false);
  const propertiesText = propertiesLabel || t('header.propertiesLabel');
  const titleText = title || t('header.title');
  const subtitleText = subtitle || t('header.subtitle');
  return (
    <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4 md:gap-0">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold">{titleText}</h1>
        <p className="text-sm text-muted-foreground">{subtitleText}</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-end gap-3 w-full">
        {onOpenSyntax && (
          <button
            onClick={onOpenSyntax}
            className="w-full sm:w-auto px-6 py-3 rounded-md bg-muted hover:scale-105 hover:shadow-lg transition transform text-sm"
          >{t('header.syntaxButton') || 'Guía sintaxis'}</button>
        )}

        {onOpenProperties && (
          <button
            onClick={onOpenProperties}
            className="w-full sm:w-auto px-6 py-3 rounded-md bg-muted hover:scale-105 hover:shadow-lg transition transform text-sm"
          >{propertiesText}</button>
        )}

        <div className="relative w-full sm:w-auto">
          <button
            onClick={() => setOpenLang(v => !v)}
            aria-label={t('header.languageButton') || 'Idioma'}
            className="w-full sm:w-auto px-6 py-3 rounded-md bg-muted hover:scale-105 hover:shadow-lg transition transform text-sm"
          >{t('header.languageButton') || 'Idioma'}</button>

          {openLang && (
            <div className="absolute right-0 mt-2 w-44 bg-card rounded-md shadow-lg z-50">
              <button className="w-full text-left px-3 py-2 hover:bg-muted/50" onClick={() => { setLanguage('es'); setOpenLang(false); if(onToggleLanguage) onToggleLanguage(); if(onSetLanguage) onSetLanguage('es'); }}>Español (ES)</button>
              <button className="w-full text-left px-3 py-2 hover:bg-muted/50" onClick={() => { setLanguage('en'); setOpenLang(false); if(onToggleLanguage) onToggleLanguage(); if(onSetLanguage) onSetLanguage('en'); }}>English (EN)</button>
              <button className="w-full text-left px-3 py-2 hover:bg-muted/50" onClick={() => { setLanguage('pt'); setOpenLang(false); if(onToggleLanguage) onToggleLanguage(); if(onSetLanguage) onSetLanguage('pt'); }}>Português (PT)</button>
            </div>
          )}
        </div>

        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="w-full sm:w-auto px-6 py-3 rounded-md bg-muted hover:scale-105 hover:shadow-lg transition transform text-sm"
          >{theme === 'dark' ? (t('header.theme.light') || 'Modo claro') : (t('header.theme.dark') || 'Modo oscuro')}</button>
        )}
      </div>
    </header>
  );
}
