import React from 'react';
import { useTranslation } from '../languajes/i18n';

function PropertyRow({ title, result }) {
  const { t } = useTranslation();
  return (
    <div className="relative p-3 rounded-md border bg-card overflow-hidden">
      {/* punto de estado en la esquina superior izquierda */}
      <div className={`absolute left-3 top-3 w-3 h-3 rounded-full mt-1 ${result.holds ? 'bg-green-500' : 'bg-red-500'}`} />

      <div className="pl-4">
        <div className="font-semibold">{title}: <span className="font-normal">{result.holds ? t('relations.results.yes') : t('relations.results.no')}</span></div>
        <div className="text-sm text-muted-foreground mt-1 break-words">{result.explanation}</div>
      </div>
    </div>
  );
}

export default function ResultsPanel({ analysis }) {
  if (!analysis) return null;
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <PropertyRow title={t('relations.results.reflexive')} result={analysis.reflexive} />
      <PropertyRow title={t('relations.results.irreflexive')} result={analysis.irreflexive} />
      <PropertyRow title={t('relations.results.symmetric')} result={analysis.symmetric} />
      <PropertyRow title={t('relations.results.asymmetric')} result={analysis.asymmetric} />
      <PropertyRow title={t('relations.results.antisymmetric')} result={analysis.antisymmetric} />
      <PropertyRow title={t('relations.results.transitive')} result={analysis.transitive} />
    </div>
  );
}
