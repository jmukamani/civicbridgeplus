import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { Mail, Search, Filter, Check, Clock, Reply } from 'lucide-react';

const MessageManagement = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isOnline = useOnlineStatus();
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessages, setSelectedMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        let messagesData;
        
        if (isOnline) {
          const response = await api.get('/representatives/messages');
          messagesData = response.data;
          await cacheData('repMessages', messagesData);
        } else {
          messagesData = await getCachedData('repMessages') || [];
          toast(t('offlineDataWarning'), { icon: '⚠️' });
        }
        
        setMessages(messagesData);
        setIsLoading(false);
      } catch (error) {
        toast.error(t('error.fetchingMessages'));
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [isOnline, t]);

  useEffect(() => {
    // Apply filters and search
    let results = [...messages];
    
    // Apply filter
    if (selectedFilter === 'pending') {
      results = results.filter(msg => !msg.responded);
    } else if (selectedFilter === 'responded') {
      results = results.filter(msg => msg.responded);
    } else if (selectedFilter === 'urgent') {
      results = results.filter(msg => msg.urgent);
    }
    
    // Apply search
    if (searchQuery) {
      results = results.filter(msg =>
        msg.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredMessages(results);
  }, [messages, selectedFilter, searchQuery]);

  const handleMarkAsResponded = async (messageId) => {
    if (!isOnline) {
      toast.error(t('error.offlineAction'));
      return;
    }

    try {
      await api.patch(`/representatives/messages/${messageId}/respond`);
      
      setMessages(messages.map(msg =>
        msg.id === messageId ? { ...msg, responded: true } : msg
      ));
      
      toast.success(t('success.messageMarkedAsResponded'));
    } catch (error) {
      toast.error(t('error.updatingMessage'));
    }
  };

  const handleBulkAction = async (action) => {
    if (!isOnline) {
      toast.error(t('error.offlineAction'));
      return;
    }

    if (selectedMessages.length === 0) return;

    try {
      await api.patch('/representatives/messages/bulk-action', {
        messageIds: selectedMessages,
        action
      });
      
      setMessages(messages.map(msg =>
        selectedMessages.includes(msg.id) 
          ? { ...msg, responded: action === 'respond' } 
          : msg
      ));
      
      setSelectedMessages([]);
      toast.success(t('success.bulkActionCompleted'));
    } catch (error) {
      toast.error(t('error.bulkActionFailed'));
    }
  };

  const toggleSelectMessage = (messageId) => {
    setSelectedMessages(prev =>
      prev.includes(messageId)
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">{t('repMessages.title')}</h2>
        
        <div className="flex flex-1 max-w-md">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={t('repMessages.searchPlaceholder')}
              className="form-input pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex space-x-2">
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="form-select"
          >
            <option value="pending">{t('repMessages.filterPending')}</option>
            <option value="responded">{t('repMessages.filterResponded')}</option>
            <option value="urgent">{t('repMessages.filterUrgent')}</option>
            <option value="all">{t('repMessages.filterAll')}</option>
          </select>
        </div>
      </div>
      
      {/* Bulk Actions Bar */}
      {selectedMessages.length > 0 && (
        <div className="bg-gray-100 p-2 flex items-center justify-between">
          <div className="text-sm">
            {t('repMessages.selectedCount', { count: selectedMessages.length })}
          </div>
          <div className="space-x-2">
            <button
              onClick={() => handleBulkAction('respond')}
              className="btn-primary px-3 py-1 text-sm"
            >
              <Check size={16} className="mr-1 inline" />
              {t('repMessages.markAsResponded')}
            </button>
            <button
              onClick={() => setSelectedMessages([])}
              className="text-gray-600 hover:text-gray-800 text-sm"
            >
              {t('repMessages.clearSelection')}
            </button>
          </div>
        </div>
      )}
      
      {/* Messages List */}
      <div className="divide-y">
        {filteredMessages.length > 0 ? (
          filteredMessages.map(message => (
            <div 
              key={message.id} 
              className={`p-4 hover:bg-gray-50 ${
                selectedMessages.includes(message.id) ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start">
                <input
                  type="checkbox"
                  checked={selectedMessages.includes(message.id)}
                  onChange={() => toggleSelectMessage(message.id)}
                  className="mt-1 mr-3"
                />
                
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h3 className="font-medium">
                      {message.senderName}
                      {message.urgent && (
                        <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                          {t('repMessages.urgent')}
                        </span>
                      )}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {new Date(message.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mt-1">
                    {message.content.length > 150
                      ? `${message.content.substring(0, 150)}...`
                      : message.content}
                  </p>
                  
                  <div className="mt-3 flex items-center text-sm">
                    {message.responded ? (
                      <span className="text-green-600 flex items-center">
                        <Check size={14} className="mr-1" />
                        {t('repMessages.responded')}
                      </span>
                    ) : (
                      <span className="text-yellow-600 flex items-center">
                        <Clock size={14} className="mr-1" />
                        {t('repMessages.pendingResponse')}
                      </span>
                    )}
                    <span className="mx-2">•</span>
                    <Link
                      to={`/representative/messages/thread/${message.id}`}
                      className="text-kenya-red hover:underline"
                    >
                      {t('repMessages.viewThread')}
                    </Link>
                  </div>
                </div>
                
                {!message.responded && (
                  <button
                    onClick={() => handleMarkAsResponded(message.id)}
                    disabled={!isOnline}
                    className={`ml-4 p-2 rounded-full ${
                      isOnline 
                        ? 'bg-kenya-green text-white hover:bg-green-700' 
                        : 'bg-gray-200 text-gray-500'
                    }`}
                    title={t('repMessages.markAsResponded')}
                  >
                    <Reply size={16} />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            {t('repMessages.noMessagesFound')}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageManagement;