import React from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Bookmark, Clock } from 'lucide-react';

const PolicyCard = ({ policy, onDownload, isOnline }) => {
  const { t } = useTranslation();
  const formattedDate = new Date(policy.createdAt).toLocaleDateString();

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors">
      <div className="mb-4">
        <h3 className="font-semibold text-lg text-gray-900">{policy.title}</h3>
        <p className="text-sm text-gray-500 mt-1">{policy.category}</p>
      </div>
      <p className="text-gray-600 line-clamp-3">{policy.description}</p>
      <div className="flex items-center mt-4 text-sm text-gray-500">
        <Clock size={16} className="mr-1" />
        <span>{formattedDate}</span>
      </div>
      <div className="mt-4 flex justify-between">
        <button
          onClick={() => onDownload?.(policy.id)}
          disabled={!isOnline}
          className={`flex items-center text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isOnline ? 'text-blue-600 hover:underline' : 'text-gray-400 cursor-not-allowed opacity-70'
          }`}
        >
          <Download size={16} className="mr-1" />
          {t('policy.download')}
        </button>
        <button className="flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
          <Bookmark size={16} className="mr-1" />
          {t('policy.save')}
        </button>
      </div>
    </div>
  );
};

export default PolicyCard;