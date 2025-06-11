import React, { useState } from 'react';
import { X, MessageSquare, Send } from 'lucide-react';
import { representatives } from '../../data/mockData';
import { useTranslation } from '../../hooks/useTranslation';

const Representatives = ({ language }) => {
  const { t } = useTranslation(language);
  const [selectedRep, setSelectedRep] = useState(null);
  const [messageText, setMessageText] = useState('');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Your Representatives</h1>
        <p className="text-gray-600 mt-2">Connect and communicate with your elected officials.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {representatives.map((rep) => (
          <div key={rep.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl">
                {rep.avatar}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{rep.name}</h3>
                <p className="text-gray-600">{rep.constituency || rep.county}</p>
                <p className="text-sm text-gray-500">{rep.party}</p>
              </div>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => setSelectedRep(rep)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center space-x-2"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Send Message</span>
              </button>
              <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200">
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Message Modal */}
      {selectedRep && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Message {selectedRep.name}</h2>
                <button
                  onClick={() => setSelectedRep(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <textarea
                className="w-full h-32 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type your message here..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setSelectedRep(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2">
                  <Send className="h-4 w-4" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Representatives;