import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { 
  getMessageThread,
  getConversations,
  sendMessage,
  markAsRead
} from '../../services/messageService';
import ConversationList from './ConversationList';
import MessageThread from './MessageThread';
import NewMessageModal from './NewMessageModal';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Send, Plus } from 'lucide-react';
import LoadingSpinner from '../../components/auth/common/LoadingSpinner';

const MessageCenter = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isOnline = useOnlineStatus();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setIsLoading(true);
        let conversationsData;
        
        if (isOnline) {
          conversationsData = await getConversations();
          await cacheData('conversations', conversationsData);
        } else {
          conversationsData = await getCachedData('conversations') || [];
          toast(t('offlineDataWarning'), { icon: '⚠️' });
        }
        
        setConversations(conversationsData);
      } catch (error) {
        toast.error(t('error.fetchingConversations'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, [isOnline]);

  useEffect(() => {
    if (selectedConversation) {
      const fetchMessages = async () => {
        try {
          let messagesData;
          
          if (isOnline) {
            messagesData = await getMessageThread(selectedConversation.id);
            await cacheData(`thread-${selectedConversation.id}`, messagesData);
            
            // Mark as read if online
            if (messagesData.some(m => !m.read && m.senderId !== user.id)) {
              await markAsRead(selectedConversation.id);
            }
          } else {
            messagesData = await getCachedData(`thread-${selectedConversation.id}`) || [];
          }
          
          setMessages(messagesData);
        } catch (error) {
          toast.error(t('error.fetchingMessages'));
        }
      };

      fetchMessages();
    }
  }, [selectedConversation, isOnline, user.id]);

  const handleSendMessage = async () => {
    if (!isOnline) {
      toast.error(t('error.offlineMessage'));
      return;
    }

    if (!newMessage.trim()) return;

    try {
      setIsSending(true);
      const response = await sendMessage(
        selectedConversation.recipient.id,
        newMessage
      );

      setMessages([...messages, response]);
      setNewMessage('');
      
      // Update conversation last message
      const updatedConversations = conversations.map(conv => 
        conv.id === selectedConversation.id
          ? { ...conv, lastMessage: response }
          : conv
      );
      setConversations(updatedConversations);
    } catch (error) {
      toast.error(t('error.sendingMessage'));
    } finally {
      setIsSending(false);
    }
  };

  const handleNewConversation = async (recipient, message) => {
    try {
      const response = await sendMessage(recipient.id, message);

      // Add new conversation to list
      const newConversation = {
        id: recipient.id, // Using recipient ID as conversation ID
        recipient,
        lastMessage: response
      };
      
      setConversations([newConversation, ...conversations]);
      setSelectedConversation(newConversation);
      setMessages([response]);
      setIsModalOpen(false);
    } catch (error) {
      toast.error(t('error.sendingMessage'));
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex flex-col md:flex-row h-full">
        {/* Conversation List */}
        <div className={`md:w-1/3 border-r ${selectedConversation ? 'hidden md:block' : 'block'}`}>
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">{t('messages.title')}</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={!isOnline}
              className={`bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${!isOnline ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Plus size={20} />
            </button>
          </div>
          
          <ConversationList 
            conversations={conversations}
            onSelect={setSelectedConversation}
            selectedId={selectedConversation?.id}
            isOnline={isOnline}
          />
        </div>
        
        {/* Message Thread */}
        {selectedConversation ? (
          <div className="md:w-2/3 flex flex-col h-full">
            <div className="p-4 border-b flex items-center">
              <button
                onClick={() => setSelectedConversation(null)}
                className="md:hidden mr-4 text-gray-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {selectedConversation.recipient.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedConversation.recipient.position}
                </p>
              </div>
            </div>
            
            <MessageThread 
              messages={messages}
              userId={user.id}
            />
            
            <div className="p-4 border-t flex bg-gray-50">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={t('messages.typeMessage')}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white disabled:bg-gray-100"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={!isOnline}
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || !isOnline || isSending}
                className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div className="md:w-2/3 flex items-center justify-center bg-gray-50">
            <div className="text-center p-6">
              <h3 className="text-lg font-medium mb-2">
                {t('messages.noConversationSelected')}
              </h3>
              <p className="text-gray-500 mb-4">
                {t('messages.selectOrStartNew')}
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                disabled={!isOnline}
                className={`btn-primary px-4 py-2 ${
                  !isOnline ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {t('messages.newMessage')}
              </button>
            </div>
          </div>
        )}
      </div>
      
      <NewMessageModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleNewConversation}
        isOnline={isOnline}
      />
    </div>
  );
};

export default MessageCenter;