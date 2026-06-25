import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '../components/Header';
import { useTranslation } from '../languajes/i18n';
import SyntaxGuideModal from '../components/SyntaxGuideModal';
import PropertiesGuideModal from '../components/PropertiesGuideModal';
import RelationEditor from '../components/RelationEditor';
import ResultsPanel from '../components/ResultsPanel';
import ParsedRelation from '../components/ParsedRelation';
import { parseRelationText, analyzeRelation } from '../relations/relations';

const RelationsPage = () => {
  const [analysis, setAnalysis] = useState(null);
  const [pairs, setPairs] = useState([]);
  const [baseSet, setBaseSet] = useState([]);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [showGuide, setShowGuide] = useState(false);
  const [showPropertiesGuide, setShowPropertiesGuide] = useState(false);

  const handleAnalyze = (text) => {
    setError(null);
    const parsed = parseRelationText(text);
    if (parsed.error) {
      setAnalysis(null);
      setPairs([]);
      setBaseSet([]);
      setError(parsed.error);
      return;
    }
    setPairs(parsed.pairs);
    setBaseSet(parsed.baseSet);
    const result = analyzeRelation(parsed.pairs, parsed.baseSet);
    setAnalysis(result);
  };

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
        <title>{t('relations.pageTitle')}</title>
        <meta name="description" content={t('relations.metaDescription')} />
      </Helmet>

      <div className="max-w-6xl mx-auto">
        <Header onToggleTheme={toggleTheme} onOpenSyntax={() => setShowGuide(true)} onOpenProperties={() => setShowPropertiesGuide(true)} theme={theme} title={t('relations.pageTitle')} subtitle={t('relations.metaDescription')} />

        <div className="mt-4">
          <Link to="/" className="inline-block px-4 py-2 rounded-md bg-muted hover:shadow-md transition text-sm">{t('relations.backToMenu')}</Link>
        </div>

        <div className="mb-4">
          <RelationEditor onAnalyze={handleAnalyze} />
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-600/10 border border-red-400 text-red-700">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <ResultsPanel analysis={analysis} />
          </div>
          <div>
            <ParsedRelation pairs={pairs} baseSet={baseSet} />
          </div>
        </div>

        <SyntaxGuideModal open={showGuide} onClose={() => setShowGuide(false)} />
        <PropertiesGuideModal open={showPropertiesGuide} onClose={() => setShowPropertiesGuide(false)} />
      </div>
    </div>
  );
};

export default RelationsPage;
