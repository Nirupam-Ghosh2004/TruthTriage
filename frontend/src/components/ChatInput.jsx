import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, ChevronUp, ChevronDown } from "lucide-react";

const ChatInput = ({
  onSend,
  isLoading = false,
  showSuggestions = false,
  onToggleSuggestions
}) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading && onSend) {
      onSend(input);
      setInput("");
    }
  };

  const suggestedQuestions = [
    "What medicines are mentioned in the document?",
    "Tell me about the first medicine listed",
    "What are the uses mentioned?",
    "What does the document say about dosage?"
  ];

  return (
    <div className="border-t-2 border-gray-200 bg-white shadow-2xl">
      <div className="container mx-auto px-4 py-4">

        {/* Toggle Button */}
        <div className="flex justify-end mb-2">
          <button
            onClick={() =>
              onToggleSuggestions && onToggleSuggestions()
            }
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 font-semibold transition"
          >
            {showSuggestions ? (
              <>
                <ChevronDown className="w-4 h-4" />
                Hide Suggestions
              </>
            ) : (
              <>
                <ChevronUp className="w-4 h-4" />
                Show Suggestions
              </>
            )}
          </button>
        </div>

        {/* Suggestions */}
        <AnimatePresence>
          {showSuggestions && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-3 overflow-hidden"
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600 font-medium">
                  Try asking:
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      !isLoading && onSend && onSend(question)
                    }
                    disabled={isLoading}
                    className="text-sm bg-blue-100 text-blue-700 px-4 py-2 rounded-full border border-blue-200 disabled:opacity-50"
                  >
                    {question}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-3">
          <motion.input
            whileFocus={{ scale: 1.01 }}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask any medical question..."
            disabled={isLoading}
            className="flex-1 px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-4 bg-blue-600 text-white rounded-xl disabled:bg-gray-400 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Sparkles className="w-5 h-5 animate-spin" />
                Sending
              </>
            ) : (
              <>
                Send
                <Send className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default ChatInput;
