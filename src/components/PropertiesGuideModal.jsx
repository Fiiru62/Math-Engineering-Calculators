import React from 'react';
import Modal from './Modal';
import { useTranslation } from '../languajes/i18n';

export default function PropertiesGuideModal({ open, onClose }) {
  const { t } = useTranslation();
  return (
    <Modal open={open} onClose={onClose} title={t('propertiesGuide.title')} fullScreen={false}>
      <div>
        <h3 className="font-semibold">{t('propertiesGuide.heading')}</h3>
        <div className="space-y-3 mt-3 text-sm">
          <div>
            <strong>{t('propertiesGuide.reflexive.title')}</strong>
            <div className="mt-1 text-xs text-muted-foreground">{t('propertiesGuide.reflexive.desc')}</div>
          </div>
          <div>
            <strong>{t('propertiesGuide.irreflexive.title')}</strong>
            <div className="mt-1 text-xs text-muted-foreground">{t('propertiesGuide.irreflexive.desc')}</div>
          </div>
          <div>
            <strong>{t('propertiesGuide.symmetric.title')}</strong>
            <div className="mt-1 text-xs text-muted-foreground">{t('propertiesGuide.symmetric.desc')}</div>
          </div>
          <div>
            <strong>{t('propertiesGuide.asymmetric.title')}</strong>
            <div className="mt-1 text-xs text-muted-foreground">{t('propertiesGuide.asymmetric.desc')}</div>
          </div>
          <div>
            <strong>{t('propertiesGuide.antisymmetric.title')}</strong>
            <div className="mt-1 text-xs text-muted-foreground">{t('propertiesGuide.antisymmetric.desc')}</div>
          </div>
          <div>
            <strong>{t('propertiesGuide.transitive.title')}</strong>
            <div className="mt-1 text-xs text-muted-foreground">{t('propertiesGuide.transitive.desc')}</div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
