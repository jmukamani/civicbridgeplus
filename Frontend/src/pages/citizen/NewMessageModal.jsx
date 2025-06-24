import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Search, User } from 'lucide-react';
import { getRepresentatives, sendMessage } from '../../services/messageService';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../../components/auth/common/LoadingSpinner';

const NewMessageModal = ({ isOpen, onClose, onSubmit, isOnline }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [representatives, setRepresentatives] = useState([]);
  const [selectedRepresentative, setSelectedRepresentative] = useState(null);
  const [messageContent, setMessageContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchRepresentatives = async () => {
      try {
        setIsSearching(true);
        const reps = await getRepresentatives(searchQuery);
        setRepresentatives(reps);
      } catch (error) {
        toast.error(t('error.fetchingRepresentatives'));
      } finally {
        setIsSearching(false);
      }
    };

    if (isOnline && searchQuery) {
      const debounceTimer = setTimeout(() => {
        if (searchQuery.trim()) {
          fetchRepresentatives();
        }
      }, 300);

      return () => clearTimeout(debounceTimer);
    }
  }, [searchQuery, isOnline, t]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRepresentative || !messageContent.trim() || !isOnline) return;

    try {
      setIsLoading(true);
      const sentMessage = await sendMessage(
        selectedRepresentative.id, 
        messageContent
      );
      onSubmit(selectedRepresentative, sentMessage);
      setMessageContent('');
    } catch (error) {
      toast.error(t('error.sendingMessage'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 ${!isOpen ? 'hidden' : ''}`}>
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-lg">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{t('messages.newConversation')}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-2">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-1">
              {t('messages.recipient')}
            </label>
            <input
              id="recipient"
              type="text"
              value={selectedRepresentative?.name}
              onChange={(e) => setSelectedRepresentative({ ...selectedRepresentative, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              {t('messages.message')}
            </label>
            <textarea
              id="message"
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              required
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 focus:outline-none"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={!selectedRepresentative || !messageContent.trim() || !isOnline || isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? t('sending') : t('send')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewMessageModal;