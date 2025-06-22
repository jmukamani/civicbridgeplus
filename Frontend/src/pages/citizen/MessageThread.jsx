import React from 'react';
import { useTranslation } from 'react-i18next';
import { User, Clock } from 'lucide-react';

const MessageThread = ({ messages, userId }) => {
  const { t } = useTranslation();

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length > 0 ? (
        messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.senderId === userId ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs md:max-w-md rounded-lg p-3 ${
                message.senderId === userId
                  ? 'bg-kenya-red text-white'
                  : 'bg-gray-100'
              }`}
            >
              <p>{message.content}</p>
              <div className="flex items-center mt-1 text-xs opacity-80">
                <Clock size={12} className="mr-1" />
                <span>
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center text-gray-500 py-10">
          {t('messages.noMessages')}
        </div>
      )}
    </div>
  );
};

export default MessageThread;