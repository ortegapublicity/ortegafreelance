import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Test() {
  const { t } = useTranslation();
  return (
    <div style={{ padding: '20px' }}>
      <h1>{t('home')}</h1>
      <p>{t('services')}</p>
    </div>
  );
}
