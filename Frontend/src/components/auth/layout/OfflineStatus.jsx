import React from 'react';
import { useTranslation } from 'react-i18next';
import { WifiOff } from 'lucide-react';

const OfflineStatus = ({ isOnline }) => {
  const { t } = useTranslation();

  if (isOnline) return null;

  return (
    <div className="bg-yellow-500 text-white py-2 px-4 text-center flex items-center justify-center">
      <WifiOff size={18} className="mr-2" />
      {t('offlineWarning')}
    </div>
  );
};

export default OfflineStatus;