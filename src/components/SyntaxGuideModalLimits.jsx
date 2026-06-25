import React from 'react';
import Modal from './Modal';
import { useTranslation } from '../languajes/i18n';

export default function SyntaxGuideModalLimits({ open, onClose }) {
  const { t } = useTranslation();
  return (
    <Modal open={open} onClose={onClose} title={t('syntaxGuideLimits.title')} fullScreen={false}>
      <div>
        <h3 className="font-semibold">{t('syntaxGuideLimits.formatHeading')}</h3>
        <p>{t('syntaxGuideLimits.formatExplanation')}</p>

        <pre className="bg-muted p-3 rounded">
{t('syntaxGuideLimits.examples').join('\n')}
        </pre>

        <h4 className="mt-3 font-medium">{t('syntaxGuideLimits.rulesHeading')}</h4>
        <ul className="list-disc ml-5 mt-1 text-sm">
          {t('syntaxGuideLimits.rules').map((r, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: r }} />
          ))}
        </ul>

        <div className="mt-4 text-sm text-muted-foreground">
          <strong>{t('syntaxGuideLimits.advice')}</strong>
        </div>
      </div>
    </Modal>
  );
}