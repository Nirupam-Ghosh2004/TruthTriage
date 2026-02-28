import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageSquare, Trash2, Calendar, Clock } from 'lucide-react';

const HistoryPage = () => {
  const navigate = useNavigate();
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      setChatHistory(JSON.parse(savedHistory));
    }
  }, []);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const deleteChat = (chatId) => {
    if (window.confirm('Delete this conversation?')) {
      const updated = chatHistory.filter(chat => chat.id !== chatId);
      setChatHistory(updated);
      localStorage.setItem('chatHistory', JSON.stringify(updated));
    }
  };

  const clearAll = () => {
    if (window.confirm('Clear all chat history? This cannot be undone.')) {
      setChatHistory([]);
      localStorage.removeItem('chatHistory');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-6 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Back to Chat
          </button>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-5xl font-black mb-2">
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Chat History
                </span>
              </h1>
              <p className="text-gray-600">{chatHistory.length} conversations saved</p>
            </div>
            {chatHistory.length > 0 && (
              <button
                onClick={clearAll}
                className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-semibold transition flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>
        </motion.div>

        {chatHistory.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <MessageSquare className="w-20 h-20 mx-auto mb-4 text-gray-300" />
            <h2 className="text-2xl font-bold text-gray-400 mb-2">No chat history yet</h2>
            <p className="text-gray-500 mb-6">Start a conversation to see it here</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition"
            >
              Start Chatting
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {chatHistory.map((chat, index) => (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1" onClick={() => {
                    navigate('/');
                    // Load chat logic will be handled in ChatPage
                  }}>
                    <div className="flex items-center gap-3 mb-3">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                      <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition">
                        {chat.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(chat.timestamp)}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        {chat.messages.length} messages
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {chat.messages[0]?.content}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(chat.id);
                    }}
                    className="p-2 hover:bg-red-50 rounded-lg transition group-hover:opacity-100 opacity-0"
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;