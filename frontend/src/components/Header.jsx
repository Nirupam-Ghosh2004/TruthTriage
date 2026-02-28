import React from 'react';
import { Menu, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

const Header = ({ onMenuClick, onMetricsClick }) => {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-2xl relative overflow-hidden"
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 80%, white 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="container mx-auto px-6 py-5 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onMenuClick}
              className="p-2 hover:bg-white/10 rounded-xl transition backdrop-blur-sm"
            >
              <Menu className="w-6 h-6" />
            </motion.button>
            
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 2
                }}
                className="text-5xl"
              >
                💊
              </motion.div>
              <div>
                <h1 className="text-3xl font-black tracking-tight">TruthTriage</h1>
                <p className="text-blue-100 text-sm font-medium">Verified Medical AI Assistant</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20"
            >
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm font-semibold">System Online</span>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onMetricsClick}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition backdrop-blur-sm border border-white/20"
            >
              <BarChart3 className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 bg-yellow-400/20 backdrop-blur-sm border border-yellow-400/30 rounded-xl px-4 py-3"
        >
          <p className="text-sm font-medium">
            <span className="font-bold">⚠️ Medical Disclaimer:</span> Educational purposes only. Always consult healthcare professionals.
          </p>
        </motion.div>
      </div>
    </motion.header>
  );
};

export default Header;