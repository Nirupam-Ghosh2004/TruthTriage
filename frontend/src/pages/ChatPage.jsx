import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import LoadingIndicator from '../components/LoadingIndicator';
import Sidebar from '../components/sidebar';
import MetricsPanel from '../components/MetricsPanel';
import WelcomeScreen from '../components/WelcomeScreen';
import SourceModal from '../components/SourceModal';
import { sendMessage } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

function ChatPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [metricsOpen, setMetricsOpen] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [selectedSource, setSelectedSource] = useState(null);
  const [sessionMetrics, setSessionMetrics] = useState({
    questionsAsked: 0,
    sourcesRetrieved: 0,
    avgConfidence: 0,
    avgResponseTime: 0,
    successRate: 100
  });
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      setChatHistory(JSON.parse(savedHistory));
    }

    const savedShowSuggestions = localStorage.getItem('showSuggestions');
    if (savedShowSuggestions !== null) {
      setShowSuggestions(JSON.parse(savedShowSuggestions));
    }
  }, []);

  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  useEffect(() => {
    localStorage.setItem('showSuggestions', JSON.stringify(showSuggestions));
  }, [showSuggestions]);

  const calculateConfidence = (sources) => {
    if (!sources || sources.length === 0) return 0;
    const baseConfidence = Math.min(sources.length * 25, 85);
    const randomVariance = Math.random() * 15;
    return Math.min(Math.round(baseConfidence + randomVariance), 100);
  };

  const handleSendMessage = async (query) => {
    const startTime = Date.now();

    const userMessage = {
      content: query,
      isUser: true,
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await sendMessage(query);
      const responseTime = ((Date.now() - startTime) / 1000).toFixed(2);
      const sources = response.sources || [];
      const medicines = response.medicines || [];
      const confidence = calculateConfidence(sources);

      const aiMessage = {
        content: response.answer,
        isUser: false,
        sources: sources,
        medicines: medicines,
        timestamp: new Date().toISOString(),
        confidence: confidence,
        responseTime: responseTime
      };

      const updatedMessages = [...newMessages, aiMessage];
      setMessages(updatedMessages);

      setSessionMetrics(prev => ({
        questionsAsked: prev.questionsAsked + 1,
        sourcesRetrieved: prev.sourcesRetrieved + sources.length,
        avgConfidence: Math.round((prev.avgConfidence * prev.questionsAsked + confidence) / (prev.questionsAsked + 1)),
        avgResponseTime: ((prev.avgResponseTime * prev.questionsAsked + parseFloat(responseTime)) / (prev.questionsAsked + 1)).toFixed(2),
        successRate: sources.length > 0 ? prev.successRate : Math.max(prev.successRate - 5, 0)
      }));

      if (currentChatId) {
        updateChatInHistory(currentChatId, updatedMessages);
      } else {
        const newChatId = Date.now().toString();
        const newChat = {
          id: newChatId,
          title: query.substring(0, 50) + (query.length > 50 ? '...' : ''),
          messages: updatedMessages,
          timestamp: new Date().toISOString(),
        };
        setChatHistory([newChat, ...chatHistory]);
        setCurrentChatId(newChatId);
      }
    } catch (error) {
      const errorMessage = {
        content: '❌ Connection error. Please ensure the backend is running on http://localhost:8000',
        isUser: false,
        sources: [],
        timestamp: new Date().toISOString(),
        confidence: 0,
        responseTime: 0
      };
      setMessages([...newMessages, errorMessage]);

      setSessionMetrics(prev => ({
        ...prev,
        successRate: Math.max(prev.successRate - 10, 0)
      }));

      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateChatInHistory = (chatId, updatedMessages) => {
    setChatHistory(prevHistory =>
      prevHistory.map(chat =>
        chat.id === chatId
          ? { ...chat, messages: updatedMessages, timestamp: new Date().toISOString() }
          : chat
      )
    );
  };

  const loadChat = (chatId) => {
    const chat = chatHistory.find(c => c.id === chatId);
    if (chat) {
      setMessages(chat.messages);
      setCurrentChatId(chatId);
      setSidebarOpen(false);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    setSidebarOpen(false);
  };

  const deleteChat = (chatId) => {
    setChatHistory(prevHistory => prevHistory.filter(chat => chat.id !== chatId));
    if (currentChatId === chatId) {
      startNewChat();
    }
  };

  const clearAllHistory = () => {
    if (window.confirm('Are you sure you want to clear all chat history?')) {
      setChatHistory([]);
      localStorage.removeItem('chatHistory');
      startNewChat();
    }
  };

  const handleSourceClick = (source) => {
    setSelectedSource(source);
  };

  const handleToggleSuggestions = () => {
    setShowSuggestions(!showSuggestions);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        chatHistory={chatHistory}
        currentChatId={currentChatId}
        onLoadChat={loadChat}
        onNewChat={startNewChat}
        onDeleteChat={deleteChat}
        onClearAll={clearAllHistory}
        navigate={navigate}
      />

      <div className="flex flex-1 flex-col">
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          onMetricsClick={() => setMetricsOpen(!metricsOpen)}
          navigate={navigate}
        />

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 py-6 max-w-5xl">
              <AnimatePresence mode="wait">
                {messages.length === 0 ? (
                  <WelcomeScreen key="welcome" metrics={sessionMetrics} />
                ) : (
                  <motion.div
                    key="messages"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <AnimatePresence>
                      {messages.map((message, index) => (
                        <ChatMessage
                          key={index}
                          message={message}
                          isUser={message.isUser}
                          index={index}
                          onSourceClick={handleSourceClick}
                        />
                      ))}
                    </AnimatePresence>
                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start mb-4"
                      >
                        <div className="bg-white rounded-2xl px-5 py-4 border border-gray-200 shadow-lg">
                          <LoadingIndicator />
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          </div>

          <AnimatePresence>
            {metricsOpen && (
              <MetricsPanel metrics={sessionMetrics} messages={messages} />
            )}
          </AnimatePresence>
        </div>

        <ChatInput
          onSend={handleSendMessage}
          isLoading={isLoading}
          showSuggestions={showSuggestions}
          onToggleSuggestions={handleToggleSuggestions}
        />
      </div>

      <SourceModal
        source={selectedSource}
        onClose={() => setSelectedSource(null)}
      />
    </div>
  );
}

export default ChatPage;