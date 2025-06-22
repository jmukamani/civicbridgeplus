import api from './api';

export const getConversations = async () => {
  const response = await api.get('/messages/conversations');
  return response.data;
};

export const getMessageThread = async (conversationId) => {
  const response = await api.get(`/messages/thread/${conversationId}`);
  return response.data;
};

export const sendMessage = async (recipientId, content) => {
  const response = await api.post('/messages/send', {
    recipientId,
    content
  });
  return response.data;
};

export const getRecentMessages = async () => {
  const response = await api.get('/messages/recent');
  return response.data;
};

export const markAsRead = async (messageId) => {
  const response = await api.patch(`/messages/${messageId}/read`);
  return response.data;
};

export const getRepresentatives = async (searchQuery = '') => {
  const response = await api.get(`/representatives?search=${searchQuery}`);
  return response.data;
};