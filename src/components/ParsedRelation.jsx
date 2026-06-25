import React from 'react';
import { useTranslation } from '../languajes/i18n';

export default function ParsedRelation({ pairs, baseSet }) {
  const { t } = useTranslation();
  return (
    <div className="bg-muted rounded-md p-4">
      <h3 className="font-semibold mb-2">{t('relations.parsed.title')}</h3>
      <p className="text-sm mb-1 break-words"><strong>{t('relations.parsed.pairsLabel')}</strong> {pairs.length === 0 ? t('relationsUtils.emptySet') : pairs.map(p=>`(${p[0]},${p[1]})`).join(', ')}</p>
      <p className="text-sm break-words"><strong>{t('relations.parsed.baseSetLabel')}</strong> {baseSet.length === 0 ? t('relationsUtils.emptySet') : baseSet.join(', ')}</p>
    </div>
  );
}
