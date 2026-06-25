import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '../components/Header';
import { useTranslation } from '../languajes/i18n';
import SyntaxGuideModalLimits from '../components/SyntaxGuideModalLimits';
import TypesLimits from '../components/TypesLimits';
import CalculadoraLimites from '../limits/limits';

const LimitsPage = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [showSyntax, setShowSyntax] = useState(false);
  const [showProperties, setShowProperties] = useState(false);

  const toggleTheme = () => {
    setTheme(t => {
      const next = t === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', next);
      return next;
    });
  };

  const { t } = useTranslation();

  React.useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [theme]);

  return (
    <div className={`min-h-screen px-4 py-6 md:p-6 ${theme === 'dark' ? 'bg-background text-white' : 'bg-white text-foreground'}`}>
      <Helmet>
        <title>{t('limits.pageTitle')}</title>
        <meta name="description" content={t('limits.metaDescription')} />
      </Helmet>

      <div className="max-w-6xl mx-auto">
        <Header onToggleTheme={toggleTheme} onOpenSyntax={() => setShowSyntax(true)} onOpenProperties={() => setShowProperties(true)} propertiesLabel={t('limits.typesLabel')} theme={theme} title={t('limits.pageTitle')} 
        subtitle={t('limits.metaDescription')} />

        <div className="mt-4">
          <Link to="/" className="inline-block px-4 py-2 rounded-md bg-muted hover:shadow-md transition text-sm">{t('limits.backToMenu')}</Link>
        </div>

        <div className="mt-6 p-4 bg-card rounded-md shadow-sm">
          <CalculadoraLimites />
        </div>

        <SyntaxGuideModalLimits open={showSyntax} onClose={() => setShowSyntax(false)} />
        <TypesLimits open={showProperties} onClose={() => setShowProperties(false)} />
      </div>
    </div>
  );
};

export default LimitsPage;
