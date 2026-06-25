import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { useTranslation } from '../languajes/i18n';

const HomePage = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

    const { t } = useTranslation();

  const toggleTheme = () => {
    setTheme(t => {
      const next = t === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', next);
      return next;
    });
  };

  React.useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [theme]);

  return (
    <div className={`min-h-screen px-4 py-6 md:p-6 ${theme === 'dark' ? 'bg-background text-white' : 'bg-white text-foreground'}`}>
      <Helmet>
        <title>{t('home.title')} — {t('home.subtitle')}</title>
        <meta name="description" content={t('home.metaDescription')} />
      </Helmet>

        <div className="max-w-6xl mx-auto">
          <Header onToggleTheme={toggleTheme} theme={theme} title={t('home.title')} subtitle={t('home.subtitle')} />

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link to="/relations" className="block p-6 rounded-lg shadow-lg bg-muted/80 hover:scale-105 transition transform">
              <h2 className="text-xl font-semibold">{t('home.cards.relations.title')}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{t('home.cards.relations.description')}</p>
            </Link>

            <Link to="/limits" className="block p-6 rounded-lg shadow-lg bg-muted/80 hover:scale-105 transition transform">
              <h2 className="text-xl font-semibold">{t('home.cards.limits.title')}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{t('home.cards.limits.description')}</p>
            </Link>

            <Link to="#" className="block p-6 rounded-lg shadow-lg bg-muted/80 hover:scale-105 transition transform">
              <h2 className="text-xl font-semibold">{t('home.cards.resolvent.title')}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{t('home.cards.resolvent.description')}</p>
            </Link>

            <Link to="#" className="block p-6 rounded-lg shadow-lg bg-muted/80 hover:scale-105 transition transform">
              <h2 className="text-xl font-semibold">{t('home.cards.integrals.title')}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{t('home.cards.integrals.description')}</p>
            </Link>

            <Link to="#" className="block p-6 rounded-lg shadow-lg bg-muted/80 hover:scale-105 transition transform">
              <h2 className="text-xl font-semibold">{t('home.cards.derivatives.title')}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{t('home.cards.derivatives.description')}</p>
            </Link>

            <Link to="#" className="block p-6 rounded-lg shadow-lg bg-muted/80 hover:scale-105 transition transform">
              <h2 className="text-xl font-semibold">{t('home.cards.truthTables.title')}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{t('home.cards.truthTables.description')}</p>
            </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
