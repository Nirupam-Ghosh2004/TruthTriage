import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Plus, Trash2, History, Info, Settings, Home } from 'lucide-react';

const Sidebar = ({ 
  isOpen, 
  onClose, 
  chatHistory, 
  currentChatId, 
  onLoadChat, 
  onNewChat, 
  onDeleteChat,
  onClearAll,
  navigate
}) => {
  if (!chatHistory) return null;

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />

          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col"
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5" />
                <h2 className="text-lg font-bold">Menu</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-gray-200 space-y-2">
              <button
                onClick={() => { navigate('/'); onClose(); }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 rounded-lg transition text-gray-700 font-medium"
              >
                <Home className="w-5 h-5 text-blue-600" />
                Chat
              </button>
              <button
                onClick={() => { navigate('/about'); onClose(); }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 rounded-lg transition text-gray-700 font-medium"
              >
                <Info className="w-5 h-5 text-blue-600" />
                About
              </button>
              <button
                onClick={() => { navigate('/settings'); onClose(); }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 rounded-lg transition text-gray-700 font-medium"
              >
                <Settings className="w-5 h-5 text-blue-600" />
                Settings
              </button>
            </div>

            <div className="p-4 border-b border-gray-200">
              <button
                onClick={onNewChat}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition font-medium shadow-md"
              >
                <Plus className="w-5 h-5" />
                New Chat
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {chatHistory.length === 0 ? (
                <div className="text-center text-gray-500 mt-10">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No chat history yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {chatHistory.slice(0, 10).map((chat) => (
                    <div
                      key={chat.id}
                      className={`p-3 rounded-lg cursor-pointer border transition ${
                        currentChatId === chat.id ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div onClick={() => onLoadChat(chat.id)} className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <MessageSquare className="w-4 h-4 text-blue-600" />
                            <p className="text-sm font-medium text-gray-800 truncate">{chat.title}</p>
                          </div>
                          <p className="text-xs text-gray-500">{formatDate(chat.timestamp)}</p>
                        </div>
                        <button onClick={() => onDeleteChat(chat.id)} className="p-1 hover:bg-red-100 rounded">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {chatHistory.length > 0 && (
              <div className="p-4 border-t border-gray-200">
                <button onClick={onClearAll} className="w-full flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition text-sm font-medium">
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;