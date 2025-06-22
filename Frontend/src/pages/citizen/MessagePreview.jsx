import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Mail, Clock } from 'lucide-react';
import { getRecentMessages } from '../../services/messageService';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../../components/auth/common/LoadingSpinner';

const MessagePreview = ({ isOnline }) => {
  const { t } = useTranslation();
  const [recentMessages, setRecentMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentMessages = async () => {
      try {
        if (isOnline) {
          const messages = await getRecentMessages();
          setRecentMessages(messages);
          await cacheData('recentMessages', messages);
        } else {
          const cachedMessages = await getCachedData('recentMessages');
          setRecentMessages(cachedMessages || []);
          toast(t('offlineDataWarning'), { icon: '⚠️' });
        }
      } catch (error) {
        toast.error(t('error.fetchingMessages'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentMessages();
  }, [isOnline, t]);

  if (isLoading) return <LoadingSpinner small />;

  return (
    <div className="space-y-4">
      {recentMessages.length > 0 ? (
        recentMessages.map(message => (
          <Link
            key={message.id}
            to={`/citizen/messages/thread/${message.id}`}
            className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium flex items-center">
                  {message.representative.name}
                  {message.unread && (
                    <span className="ml-2 w-2 h-2 bg-kenya-red rounded-full"></span>
                  )}
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  {message.preview}
                </p>
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <Clock size={14} className="mr-1" />
                {new Date(message.date).toLocaleDateString()}
              </div>
            </div>
          </Link>
        ))
      ) : (
        <div className="text-center py-6 text-gray-500">
          <Mail size={24} className="mx-auto mb-2 text-gray-400" />
          <p>{t('messages.noRecentMessages')}</p>
          {isOnline && (
            <Link 
              to="/citizen/messages/new" 
              className="text-kenya-red hover:underline text-sm mt-2 inline-block"
            >
              {t('messages.startNewConversation')}
            </Link>
          )}
        </div>
      )}
      
      <div className="text-center mt-4">
        <Link 
          to="/citizen/messages" 
          className="text-kenya-red hover:underline text-sm"
        >
          {t('viewAllMessages')}
        </Link>
      </div>
    </div>
  );
};

export default MessagePreview;