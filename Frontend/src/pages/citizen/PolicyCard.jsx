import React from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Bookmark, Clock } from 'lucide-react';

const PolicyCard = ({ policy, onDownload, isOnline }) => {
  const { t } = useTranslation();
  const formattedDate = new Date(policy.createdAt).toLocaleDateString();

  return (
    <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4 bg-gray-50 border-b">
        <h3 className="font-semibold text-lg">{policy.title}</h3>
        <p className="text-sm text-gray-500 mt-1">{policy.category}</p>
      </div>
      
      <div className="p-4">
        <p className="text-gray-600 line-clamp-3">{policy.description}</p>
        
        <div className="flex items-center mt-4 text-sm text-gray-500">
          <Clock size={16} className="mr-1" />
          <span>{formattedDate}</span>
        </div>
        
        <div className="mt-4 flex justify-between">
          <button
            onClick={() => onDownload?.(policy.id)}
            disabled={!isOnline}
            className={`flex items-center text-sm ${
              isOnline ? 'text-kenya-red hover:underline' : 'text-gray-400'
            }`}
          >
            <Download size={16} className="mr-1" />
            {t('policy.download')}
          </button>
          
          <button className="flex items-center text-sm text-gray-500 hover:text-kenya-red">
            <Bookmark size={16} className="mr-1" />
            {t('policy.save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PolicyCard;