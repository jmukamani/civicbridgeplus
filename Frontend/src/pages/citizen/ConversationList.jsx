import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Clock } from 'lucide-react';
import { getConversations } from '../../services/messageService';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../../components/auth/common/LoadingSpinner';

const ConversationList = ({ onSelect, selectedId, isOnline }) => {
  const { t } = useTranslation();
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        if (isOnline) {
          const data = await getConversations();
          setConversations(data);
          await cacheData('conversations', data);
        } else {
          const cachedConversations = await getCachedData('conversations');
          setConversations(cachedConversations || []);
          toast(t('offlineDataWarning'), { icon: '⚠️' });
        }
      } catch (error) {
        toast.error(t('error.fetchingConversations'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, [isOnline, t]);

  if (isLoading) return <LoadingSpinner small />;

  return (
    <div className="divide-y">
      {conversations.length > 0 ? (
        conversations.map(conversation => (
          <div
            key={conversation.id}
            onClick={() => onSelect(conversation)}
            className={`p-4 cursor-pointer transition-colors ${
              conversation.id === selectedId ? 'bg-blue-50' : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {conversation.recipient.name}
                  {conversation.unreadCount > 0 && (
                    <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                      {conversation.unreadCount}
                    </span>
                  )}
                </h3>
                <p className="text-gray-600 text-sm mt-1 truncate">
                  {conversation.lastMessage.content}
                </p>
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <Clock size={14} className="mr-1" />
                {new Date(conversation.lastMessage.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-10 text-gray-500">
          <Mail size={24} className="mx-auto mb-2 text-gray-400" />
          <p>{t('messages.noConversations')}</p>
        </div>
      )}
    </div>
  );
};

export default ConversationList;