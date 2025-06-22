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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium">{t('messages.newMessage')}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4">
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={t('messages.searchRepresentatives')}
              className="form-input pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={!isOnline}
            />
          </div>

          {!isOnline && (
            <div className="bg-yellow-50 text-yellow-800 p-3 rounded-md mb-4 text-sm">
              {t('offlineSearchWarning')}
            </div>
          )}

          <div className="max-h-60 overflow-y-auto mb-4 border rounded-lg">
            {isSearching ? (
              <div className="p-4 flex justify-center">
                <LoadingSpinner small />
              </div>
            ) : representatives.length > 0 ? (
              representatives.map(rep => (
                <div
                  key={rep.id}
                  onClick={() => setSelectedRepresentative(rep)}
                  className={`p-3 cursor-pointer ${
                    selectedRepresentative?.id === rep.id
                      ? 'bg-kenya-red text-white'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="p-2 bg-gray-100 rounded-full mr-3">
                      <User size={18} />
                    </div>
                    <div>
                      <h4 className="font-medium">{rep.name}</h4>
                      <p className="text-sm">{rep.position}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                {searchQuery 
                  ? t('messages.noRepresentativesFound')
                  : t('messages.searchPrompt')}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <textarea
                placeholder={t('messages.typeYourMessage')}
                className="form-input w-full"
                rows={4}
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                required
                disabled={!isOnline}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary px-4 py-2"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={!selectedRepresentative || !messageContent.trim() || !isOnline || isLoading}
                className="btn-primary px-4 py-2"
              >
                {isLoading ? t('sending') : t('messages.sendMessage')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewMessageModal;