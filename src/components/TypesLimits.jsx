import React from 'react';
import Modal from './Modal';
import { useTranslation } from '../languajes/i18n';
import esData from '../languajes/es.json';
import enData from '../languajes/en.json';
import ptData from '../languajes/pt.json';

export default function TypesLimits({ open, onClose }) {
  const { t, lang } = useTranslation();

  const resources = { es: esData, en: enData, pt: ptData };
  const typesObj = (resources[lang] && resources[lang].typesLimits) || {};

  const entries = Object.entries(typesObj || {});
  const items = [];

  for (let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i];
    if (key === 'title') continue; 

    if (key.endsWith('Title')) {
      const prefix = key.slice(0, -5);
      const descKey = `${prefix}Desc`;
      const desc = typesObj[descKey];
      items.push({ type: 'pair', title: value, desc });
      if (i + 1 < entries.length && entries[i + 1][0] === descKey) i++;
      continue;
    }

    // generic text or explanation
    items.push({ type: 'text', key, value });
  }

  return (
    <Modal open={open} onClose={onClose} title={t('typesLimits.title')} fullScreen={false}>
      <div>
        <div className="space-y-3 mt-3 text-sm">
          {items.map((it, idx) => {
            if (it.type === 'pair') {
              return (
                <div key={idx}>
                  <strong>{it.title}</strong>
                  <div className="mt-1 text-xs text-muted-foreground">{it.desc}</div>
                </div>
              );
            }

            if (Array.isArray(it.value)) {
              return (
                <div key={idx}>
                  {it.value.map((v, i2) => (
                    <div key={i2} className="mt-1 text-xs text-muted-foreground">
                      {v}
                    </div>
                  ))}
                </div>
              );
            }

            return (
              <div key={idx}>
                <div className="mt-1 text-xs text-muted-foreground">{it.value}</div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
