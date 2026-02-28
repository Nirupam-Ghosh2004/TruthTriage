import React from 'react';
import { motion } from 'framer-motion';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { Clock, CheckCircle, BarChart3 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const ChatMessage = ({ message, isUser, index, onSourceClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        type: "spring"
      }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}
    >
      <motion.div
        whileHover={{ scale: 1.01 }}
        className={`max-w-3xl rounded-2xl px-6 py-5 shadow-xl ${isUser
          ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white'
          : 'bg-white text-gray-800 border-2 border-gray-100'
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" }}
              className="text-2xl"
            >
              {isUser ? '👤' : '🤖'}
            </motion.div>
            <div className={`text-sm font-bold ${isUser ? 'text-blue-100' : 'text-gray-600'}`}>
              {isUser ? 'You' : 'TruthTriage AI'}
            </div>
          </div>

          {/* Metrics for AI responses */}
          {!isUser && message.confidence !== undefined && (
            <div className="flex items-center gap-3">
              {message.responseTime && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{message.responseTime}s</span>
                </div>
              )}
              <div className="w-10 h-10">
                <CircularProgressbar
                  value={message.confidence}
                  text={`${message.confidence}%`}
                  styles={buildStyles({
                    textSize: '28px',
                    pathColor: message.confidence > 70 ? '#22c55e' : message.confidence > 40 ? '#f59e0b' : '#ef4444',
                    textColor: message.confidence > 70 ? '#22c55e' : message.confidence > 40 ? '#f59e0b' : '#ef4444',
                    trailColor: '#e5e7eb',
                    strokeLinecap: 'round'
                  })}
                />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-base leading-relaxed"
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none prose-headings:text-gray-800 prose-p:text-gray-700 prose-strong:text-gray-900 prose-li:text-gray-700 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </motion.div>

        {/* Medicine Suggestions */}
        {!isUser && message.medicines && message.medicines.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="mt-4 pt-4 border-t border-gray-100"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">💊</span>
              <span className="text-sm font-bold text-purple-700">Suggested Medicines:</span>
            </div>
            <div className="space-y-2">
              {message.medicines.map((med, idx) => (
                <div
                  key={idx}
                  className="bg-purple-50 rounded-lg p-3 border border-purple-100"
                >
                  <span className="font-bold text-sm text-purple-800">{med.name}</span>
                  <p className="text-xs text-gray-600 mt-0.5">{med.usage}</p>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-2 italic">
              ⚠️ Always consult a healthcare professional before taking any medication.
            </p>
          </motion.div>
        )}

        {/* Sources with Similarity Scores */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ delay: 0.3 }}
            className="mt-5 pt-5 border-t-2 border-gray-100"
          >
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-bold text-gray-700">Verified Sources ({message.sources.length}):</span>
            </div>
            <div className="space-y-3">
              {message.sources.map((source, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                  whileHover={{ scale: 1.03, x: 5 }}
                  onClick={() => onSourceClick && onSourceClick(source)}
                  className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-4 border-l-4 border-blue-500 cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-blue-700">
                      📄 {source.metadata?.source || 'Unknown'}
                    </span>
                    <div className="flex items-center gap-2">
                      {/* Similarity Score Badge */}
                      {source.similarity_score != null && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${source.similarity_score > 0.7
                          ? 'bg-green-100 text-green-700'
                          : source.similarity_score > 0.4
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                          }`}>
                          <BarChart3 className="w-3 h-3" />
                          {(source.similarity_score * 100).toFixed(0)}%
                        </span>
                      )}
                      {source.metadata?.page != null && (
                        <span className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full font-semibold">
                          Page {source.metadata.page}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 italic leading-relaxed">
                    "{source.content?.substring(0, 150)}..."
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ChatMessage;